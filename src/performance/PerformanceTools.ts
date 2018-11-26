/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

// Imported for typings. This will not be reflected in the generated code.
import * as perfHooks from "perf_hooks";

import {IEnabled} from "./interfaces";

// @TODO Separate file for the interfaces

interface IFunctionTimer {
    observer: perfHooks.PerformanceObserver;
    originalFunction: (...args: any[]) => any;
    totalDuration: number;
    totalCalls: number;
}

interface IMeasureTimer {
    observer: perfHooks.PerformanceObserver;
    isConnected: boolean;
    measurements: IMeasurment[];
}

interface IMeasurment {
    name: string;
    startTime: number;
    startMarkName: string;
    endMarkName: string;
    duration: number;
}

interface IFunctionMetric {
    name: string;
    calls: number;
    totalDuration: number; // Both in ms
    averageDuration: number;
}
interface IMetrics {
    functions: IFunctionMetric[];
    measurements: IMeasurmentMetric[];
}
interface IMeasurmentMetric {
    name: string;
    calls: number; // Number of measurements with this name
    totalDuration: number; // Total time of measurements in ms
    averageDuration: number; // Average time of measurements
    data: IMeasurment[]; // The raw measurement data
}

export class PerformanceTools {
    // @TODO DOCUMENT
    private _functionTimers: Map<string,IFunctionTimer> = new Map();
    private _measureTimers: Map<string,IMeasureTimer> = new Map();

    /**
     * This variable holds the import from the Node JS performance hooks
     * library.
     */
    private readonly _perfHooks: typeof perfHooks;

    constructor(private readonly _manager: IEnabled) {
        // Check if performance utilities should be enabled.
        if(this._manager.isEnabled) {
            // Delay the require so we don't waste resources when performance
            // isn't needed.
            this._perfHooks = require("perf_hooks");
        }
    }

    public clearMarks(name?: string) {
        if (this._manager.isEnabled) {
            this._perfHooks.performance.clearMarks(name);
        }
    }

    public mark(name: string) {
        if (this._manager.isEnabled) {
            this._perfHooks.performance.mark(name);
        }
    }


    // @TODO document
    public measure(name: string, startMark: string, endMark: string) {
        if (this._manager.isEnabled) {
            let mapObject: IMeasureTimer;

            if (this._measureTimers.has(name)) {
                mapObject = this._measureTimers.get(name);
            } else {
                // Create the map object when needed
                mapObject = {
                    observer: undefined,
                    isConnected: false,
                    measurements: []
                };

                this._measureTimers.set(name, mapObject);
            }

            if (!mapObject.isConnected) {
                mapObject.observer = new this._perfHooks.PerformanceObserver((list) => {
                    const entries = list.getEntriesByName(name);

                    if (entries.length > 0) {
                        for(const entry of entries) {
                            mapObject.measurements.push({
                                name: entry.name,
                                startTime: entry.startTime,
                                duration: entry.duration,
                                startMarkName: startMark,
                                endMarkName: endMark
                            });
                        }

                        mapObject.observer.disconnect();
                        mapObject.isConnected = false;
                    }
                });
                mapObject.observer.observe({entryTypes: ["measure"], buffered: true});
                mapObject.isConnected = true;
            }

            this._perfHooks.performance.measure(name, startMark, endMark);
        }
    }

    public timerify(fn: (...args: any[]) => any, name?: string) {
        if (this._manager.isEnabled) {
            // Check if we should use the function name or the passed name for tracking.
            if (name == null) {
                name = fn.name;
            }

            // Throw an error if the timer already exists in the map.
            if (this._functionTimers.has(name)) {
                throw new (require("./errors").TimerNameConflictError)(name);
            }

            // Create the observer and store it in the map.
            const observerObject: IFunctionTimer = {
                observer: undefined,
                originalFunction: fn,
                totalDuration: 0,
                totalCalls: 0
            };

            this._functionTimers.set(name, observerObject);

            // Create a function observer
            observerObject.observer = new this._perfHooks.PerformanceObserver((list) => {
                const entries = list.getEntriesByName(fn.name);

                for (const entry of entries) {
                    observerObject.totalDuration += entry.duration;
                    observerObject.totalCalls++;
                }
            });

            observerObject.observer.observe({entryTypes: ["function"], buffered: true});

            // Wrap the function in a timer
            return this._perfHooks.performance.timerify(fn);
        } else {
            // If performance is not enabled, we need to return the function
            // so original code doesn't get broken.
            return fn;
        }
    }

    /**
     * This method will close an observer that was opened through the {@link PerformanceTools#timerify}
     * function.
     *
     * @todo document
     */
    public untimerify(fn: ((...args: any[]) => any), name?: string) {
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
                return timerRef.originalFunction;
            } else {
                throw new (require("./errors").TimerDoesNotExistError)(timer);
            }
        } else {
            return fn;
        }
    }

    /**
     * Output raw performance metrics to a file. Should be the last call in execution.
     */
    public getMetrics(): object { // @TODO proper interface
        if (this._manager.isEnabled) {
            // @TODO All metrics should be stopped before reporting

            const output: IMetrics = { // @TODO separate file
                functions: [],
                measurements: []
            };

            // Get function timer metrics
            const functionTimers = this._functionTimers.entries();
            for (const [key, value] of functionTimers) {
                output.functions.push({
                    name: key,
                    calls: value.totalCalls,
                    totalDuration: value.totalDuration,
                    averageDuration: value.totalDuration / value.totalCalls
                });
            }

            // Get measurement metrics
            const measureTimers = this._measureTimers.entries();
            for (const [key, value] of measureTimers) {
                let totalDuration = 0;

                for (const measurement of value.measurements) {
                    totalDuration += measurement.duration;
                }

                output.measurements.push({
                    name: key,
                    calls: value.measurements.length,
                    totalDuration,
                    averageDuration: totalDuration / value.measurements.length,
                    data: value.measurements
                });
            }

            return output;
        }

        return {};
    }

    public getNodeTiming(): object { // @TODO Proper Interface
        if (this._manager.isEnabled) {

            const timing: any = this._perfHooks.performance.nodeTiming;

            return {
                bootstrapComplete: timing.bootstrapComplete,
                duration: timing.duration,
                environment: timing.environment,
                loopStart: timing.loopStart,
                loopExit: timing.loopExit,
                nodeStart: timing.nodeStart,
                startTime: timing.startTime,
                v8Start: timing.v8Start
            };
        }

        return {};
    }
}

