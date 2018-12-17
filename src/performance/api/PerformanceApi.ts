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
    IFunctionObserver,
    IMeasurementObserver,
    IMetric,
    IMetrics,
    INodeTiming,
    IPerformanceEntry,
    ISystemInformation
} from "./interfaces";

/**
 * A type that generically defines all collection observer maps that are defined
 * to the Performance API.
 *
 * @param T The type of observer stored in the map. The observer must be an
 *          {@link ICollectionObserver} type with entries adhering to the
 *          {@link IPerformanceEntry} interface.
 *
 * @internal
 */
type CollectionMap<T extends ICollectionObserver<IPerformanceEntry>> = Map<string, T>;

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

    /**
     * Aggregate all entries present in a {@link CollectionMap} into an array output.
     *
     * Each item present in the map will correspond to a single entry in the final array output. The
     * strings will now become the name property and each data point will be stored in the final
     * object. The statistical analysis present is generated from the IPerformanceEntry instances
     * present in the entries portion of that element.
     *
     *
     * @param map A {@link CollectionMap} of observers containing entries to process.
     * @param T The type representing the raw data stored in the observer. It is important that this
     *          data extends {@link IPerformanceEntry} for proper data processing.
     *
     * @returns An array of {@link IMetric} data points representing each key/value present in the
     *          CollectionMap.
     *
     * @internal
     */
    private static _aggregateData<T extends IPerformanceEntry>(map: CollectionMap<ICollectionObserver<T>>): Array<IMetric<T>> {
        // Get all observers present within the map.
        const observers = map.entries();
        const output: Array<IMetric<T>> = [];

        // Loop through each observer in the map
        for (const [name, observer] of observers) {
            let totalDuration = 0;

            // Calculate the total duration represented by all entries
            for (const entry of observer.entries) {
                totalDuration += entry.duration;
            }

            // Create the data point for the map using the key as the name
            output.push({
                name,
                calls: observer.entries.length,
                totalDuration,
                averageDuration: totalDuration / observer.entries.length,
                entries: observer.entries
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
     * and the value is an {@link IFunctionObserver} instance.
     *
     * @internal
     */
    private _functionObservers: CollectionMap<IFunctionObserver> = new Map();

    /**
     * Internal map of all created measurement timers. The key represents the name
     * and the value is an {@link IMeasurementObserver} instance.
     *
     * @internal
     */
    private _measurementObservers: CollectionMap<IMeasurementObserver> = new Map();

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

    /**
     * Clears marks created using {@link mark}.
     *
     * This method does nothing if the Performance API is not enabled. It also takes advantage
     * of the namespace applied within mark; however, if name is not specified, all marks
     * will be cleared from all package.
     *
     * @param name The name of the mark to clear. If not specified, all marks are
     *             cleared.
     *
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_performance_clearmarks_name clearMarks()}
     */
    public clearMarks(name?: string) {
        if (this._manager.isEnabled) {
            // Add the namespace to the mark for uniqueness across packages
            this._perfHooks.performance.clearMarks(
                name ? this._addPackageNamespace(name) : undefined
            );
        }
    }

     /**
      * Aggregate metrics that have been captured for this instance of the API
      * and return them back in a data format.
      *
      * @returns An object representing metrics that have been prepared to be
      *          written to a file.
      *
      * @throws {@link PerformanceNotCapturedError} when the method is called and performance captures
      *                                             are not enabled.
      */
    public getMetrics(): IMetrics {
        if (this._manager.isEnabled) {
            // @TODO All metrics should be stopped before reporting
            return {
                functions: PerformanceApi._aggregateData(this._functionObservers),
                measurements: PerformanceApi._aggregateData(this._measurementObservers)
            };
        }
        else {
            throw new PerformanceApi._errors.PerformanceNotCapturedError();
        }
    }

    /**
     * Get the node timing information provided by the underlying node APIs.
     *
     * @returns The node timing information.
     *
     * @throws {@link PerformanceNotCapturedError} when the method is called and performance captures
     *                                             are not enabled.
     */
    public getNodeTiming(): INodeTiming {
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
        } else {
            throw new PerformanceApi._errors.PerformanceNotCapturedError();
        }
    }

    /**
     * Gathers and returns valuable system information to help understand the environment
     * where the data was captured.
     *
     * @returns System information formatted in an object ready to write to a file.
     *
     * @throws {@link PerformanceNotCapturedError} when the method is called and performance captures
     *                                             are not enabled.
     */
    public getSysInfo(): ISystemInformation {
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
        } else {
            throw new PerformanceApi._errors.PerformanceNotCapturedError();
        }
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
            let mapObject: IMeasurementObserver;

            if (this._measurementObservers.has(name)) {
                mapObject = this._measurementObservers.get(name);
            } else {
                // Create the map object when needed
                mapObject = {
                    observer: undefined,
                    isConnected: false,
                    entries: []
                };

                this._measurementObservers.set(name, mapObject);
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

            const timerRef = this._functionObservers.get(timer);

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
            if (this._functionObservers.has(name)) {
                throw new PerformanceApi._errors.TimerNameConflictError(name);
            }

            // Create the observer and store it in the map.
            const observerObject: IFunctionObserver = {
                observer: undefined,
                isConnected: false,
                entries: [],
                originalFunction: fn
            };

            this._functionObservers.set(name, observerObject);

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
