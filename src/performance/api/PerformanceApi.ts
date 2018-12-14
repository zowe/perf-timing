/*!
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 *
 */

import { IPerformanceApi, IPerformanceApiManager } from "../manager/interfaces";
import {
    ICollectionObserver,
    IFunctionTimer,
    IMetric,
    IMetrics,
    INodeTiming,
    IPerformanceEntry,
    ISystemInformation
} from "./interfaces";

import { MeasureTimer } from "./types";

/**
 * The underlying api that provides hooks into
 * {@link https://nodejs.org/dist/latest-v10.x/docs/api/perf_hooks.html Node's Performance Timing APIs}.
 *
 * Use this class in place of relying on Node's experimental APIs.
 */
export class PerformanceApi implements IPerformanceApi {

    /**
     * Internal method for getting the errors that can be thrown. It is smart
     * and will only do the require once and cache the results for later calls.
     *
     * @internal
     */
    private static get _errors(): typeof PerformanceApi._errorImport {
        if (!PerformanceApi._errorImport) {
            PerformanceApi._errorImport = require("./errors");
        }

        return PerformanceApi._errorImport;
    }

    /**
     * Cache of loaded error objects. Only populated on first call to {@link PerformanceApi._errors}
     *
     * @internal
     */
    private static _errorImport: typeof import("./errors");

    // @TODO Document
    private static _aggregateData<T extends IPerformanceEntry>(map: Map<string, ICollectionObserver<T>>): Array<IMetric<T>> {
        const timers = map.entries();
        const output: Array<IMetric<T>> = [];

        for (const [key, value] of timers) {
            let totalDuration = 0;

            for (const entry of value.entries) {
                totalDuration += entry.duration;
            }

            output.push({
                name: key,
                calls: value.entries.length,
                totalDuration,
                averageDuration: totalDuration / value.entries.length,
                entries: value.entries
            });
        }

        return output;
    }

    /**
     * Created for consistent reference to Node Performance Timing API.
     *
     * @see {@link PerformanceApi.watch}
     */
    public timerify = this.watch;

    /**
     * Created for consistent reference to Node Performance Timing API.
     *
     * @see {@link PerformanceApi.unwatch}
     */
    public untimerify = this.unwatch;

    /**
     * Internal map of all created function timers. The key represents the name
     * and the value is an {@link IFunctionTimer} instance.
     *
     * @internal
     */
    private _functionTimers: Map<string, IFunctionTimer> = new Map();

    /**
     * Internal map of all created measurement timers. The key represents the name
     * and the value is an {@link MeasureTimer} instance.
     *
     * @internal
     */
    private _measureTimers: Map<string, MeasureTimer> = new Map();

    /**
     * This variable holds the import from the Node JS performance hooks
     * library.
     *
     * @internal
     */
    private readonly _perfHooks: typeof import("perf_hooks");

    /**
     * Construct the performance API. The constructor is not intended to be used
     * by any class except for the {@link PerformanceApiManager} of this class.
     *
     * @internal
     *
     * @param _manager The manager of this API class.
     */
    constructor(private readonly _manager: IPerformanceApiManager) {
        // Check if performance utilities should be enabled.
        if (this._manager.isEnabled) {
            // Delay the require so we don't waste resources when performance
            // isn't needed.
            this._perfHooks = require("perf_hooks");
        }
    }

    public clearMarks(name?: string) {
        if (this._manager.isEnabled) {
            this._perfHooks.performance.clearMarks(
                this._addPackageNamespace(name)
            );
        }
    }

    /**
     * Output raw performance metrics to a file. Should be the last call in execution.
     */
    public getMetrics(): IMetrics | {} {
        if (this._manager.isEnabled) {
            // @TODO All metrics should be stopped before reporting
            return {
                functions: PerformanceApi._aggregateData(this._functionTimers),
                measurements: PerformanceApi._aggregateData(this._measureTimers)
            };
        }

        return {};
    }

    public getNodeTiming(): INodeTiming | void {
        if (this._manager.isEnabled) {

            const timing = this._perfHooks.performance.nodeTiming;

            return {
                bootstrapComplete: timing.bootstrapComplete,
                duration: timing.duration,
                loopStart: timing.loopStart,
                loopExit: timing.loopExit,
                name: timing.name,
                nodeStart: timing.nodeStart,
                startTime: timing.startTime,
                v8Start: timing.v8Start
            };
        }

        return;
    }

    public getSysInfo(): ISystemInformation | void {
        if (this._manager.isEnabled) {
            // Dynamically import os so that this process doesn't have to bother
            // if performance is not enabled.
            const os: typeof import("os") = require("os");

            const freeMem = os.freemem();
            const totalMem = os.totalmem();

            return {
                argv: process.argv,
                cpus: os.cpus(),
                loadavg: os.loadavg(), // On windows this will always be [0, 0, 0]
                memory: {
                    free: freeMem,
                    total: totalMem,
                    usage: totalMem - freeMem,
                    usagePercentage: ((totalMem - freeMem) / totalMem) * 100 // tslint:disable-line:no-magic-numbers
                },
                network: {
                    hostname: os.hostname(),
                    interfaces: os.networkInterfaces()
                },
                os: `${os.type()} ${os.arch()} ${os.release()}`,
                platform: os.platform(),
                shell: os.userInfo().shell,
                uptime: os.uptime()
            };
        }

        return;
    }

    public mark(name: string) {
        if (this._manager.isEnabled) {
            this._perfHooks.performance.mark(
                this._addPackageNamespace(name)
            );
        }
    }


    // @TODO document
    public measure(name: string, startMark: string, endMark: string) {
        if (this._manager.isEnabled) {
            let mapObject: MeasureTimer;

            if (this._measureTimers.has(name)) {
                mapObject = this._measureTimers.get(name);
            } else {
                // Create the map object when needed
                mapObject = {
                    observer: undefined,
                    isConnected: false,
                    entries: []
                };

                this._measureTimers.set(name, mapObject);
            }

            // Remap the name to the unique package name. This will not be visible
            // in the output of the command, but it will allow 2 instances of this
            // package to not conflict accidentally in their naming.
            const namespaceName = this._addPackageNamespace(name);
            const namespaceStartMark = this._addPackageNamespace(startMark);
            const namespaceEndMark = this._addPackageNamespace(endMark);

            // If the map object is already connected, we don't need to do anything.
            // The metric will be picked up by the for loop in the observer.
            if (!mapObject.isConnected) {
                // Create the observer that will capture the metrics.
                mapObject.observer = new this._perfHooks.PerformanceObserver((list) => {
                    const entries = list.getEntriesByName(namespaceName);

                    // Loop through each entry and save the metrics
                    if (entries.length > 0) {
                        for (const entry of entries) {
                            mapObject.entries.push({
                                name: entry.name,
                                startTime: entry.startTime,
                                duration: entry.duration,
                                startMarkName: namespaceStartMark,
                                endMarkName: namespaceEndMark
                            });
                        }

                        mapObject.observer.disconnect();
                        mapObject.isConnected = false;
                    }
                });
                mapObject.observer.observe({ entryTypes: ["measure"], buffered: true });
                mapObject.isConnected = true;
            }

            this._perfHooks.performance.measure(namespaceName, namespaceStartMark, namespaceEndMark);
        }
    }

    /**
     * This method will close an observer that was opened through the {@link PerformanceTools#timerify}
     * function.
     *
     * @todo document
     */
    public unwatch(fn: ((...args: any[]) => any), name?: string) {
        if (this._manager.isEnabled) {
            let timer = fn.name;

            // Extract the name of the function if necessary
            if (name != null) {
                timer = name;
            } else {
                // When timerifing(?) functions, node will prepend the function
                // name with timerified . This regex will strip out that name
                timer = /timerified (.*)/g.exec(timer)[1];
            }

            const timerRef = this._functionTimers.get(timer);

            if (timerRef !== undefined) {
                timerRef.observer.disconnect();
                timerRef.isConnected = false;
                return timerRef.originalFunction;
            } else {
                throw new PerformanceApi._errors.TimerDoesNotExistError(timer);
            }
        } else {
            return fn;
        }
    }

    public watch(fn: (...args: any[]) => any, name?: string) {
        if (this._manager.isEnabled) {
            // Check if we should use the function name or the passed name for tracking.
            if (name == null) {
                name = fn.name;
            }

            // @TODO allow for a name to be reconnected if the observer has been disconnected.
            // Throw an error if the timer already exists in the map.
            if (this._functionTimers.has(name)) {
                throw new PerformanceApi._errors.TimerNameConflictError(name);
            }

            // Create the observer and store it in the map.
            const observerObject: IFunctionTimer = {
                observer: undefined,
                isConnected: false,
                entries: [],
                originalFunction: fn
            };

            this._functionTimers.set(name, observerObject);

            // Create a function observer
            observerObject.observer = new this._perfHooks.PerformanceObserver((list) => {
                const entries = list.getEntriesByName(fn.name);

                for (const entry of entries) {
                    observerObject.entries.push(entry);
                }
            });

            observerObject.observer.observe({ entryTypes: ["function"], buffered: true });
            observerObject.isConnected = true;

            // Wrap the function in a timer
            return this._perfHooks.performance.timerify(fn);
        } else {
            // If performance is not enabled, we need to return the function
            // so original code doesn't get broken.
            return fn;
        }
    }

    private _addPackageNamespace(name: string): string {
        return `${this._manager.packageUUID}: ${name}`;
    }
}
