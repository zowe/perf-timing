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

import {IPerfEnabled} from "./interfaces";

// @TODO Separate file for the interfaces

interface IFunctionTimer {
    observer: perfHooks.PerformanceObserver;
    originalFunction: (...args: any[]) => any;
    totalDuration: number;
    totalCalls: number;
}

interface IMeaureTimer {
    observer: perfHooks.PerformanceObserver;
    measurements: IMeasurment[];
}

interface IMeasurment {
    name: string;
    startTime: number;
    startMarkName: string;
    endMarkName: string;
    duration: number;
}

export class PerformanceTools {

    // @TODO DOCUMENT
    private _functionTimers: Map<string,IFunctionTimer> = new Map();
    private _measureTimers: Map<string, number> = new Map();

    /**
     * This variable holds the import from the Node JS performance hooks
     * library.
     */
    private readonly _perfHooks: typeof perfHooks;

    constructor(private readonly _manager: IPerfEnabled) {
        // Check if performance utilities should be enabled.
        if(this._manager.isPerfEnabled) {
            // Delay the require so we don't waste resources when performance
            // isn't needed.
            this._perfHooks = require("perf_hooks");

            // process.on("exit", () => {
            //    console.log("NODE EXIT OCCURING...PRINTING METRICS");
            //    console.log("-------------------------------------");
            //    this.outputMetrics();
            // });
        }
    }

    public clearMarks(name?: string) {
        if (this._manager.isPerfEnabled) {
            this._perfHooks.performance.clearMarks(name);
        }
    }

    public mark(name: string) {
        if (this._manager.isPerfEnabled) {
            this._perfHooks.performance.mark(name);
        }
    }

    public measure(name: string, startMark: string, endMark: string) {
        if (this._manager.isPerfEnabled) {
            const obs = new this._perfHooks.PerformanceObserver((list, observer) => {
                console.log(list.getEntriesByName(name));

                observer.disconnect();
            });
            obs.observe({entryTypes: ["measure"]});

            this._perfHooks.performance.measure(name, startMark, endMark);
        }
    }

    public timerify(fn: (...args: any[]) => any, name?: string) {
        if (this._manager.isPerfEnabled) {
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
                // const entries = list.getEntriesByName(fn.name);
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
        if (this._manager.isPerfEnabled) {
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
    public getMetrics(): string {
        if (this._manager.isPerfEnabled) {
            // @TODO All metrics should be stopped before reporting

            let output = "NODE EXIT OCCURING...PRINTING METRICS\n";
            output += "-------------------------------------\n\n";

            const timing = this._perfHooks.performance.nodeTiming;

            output += "Node Run Statistics\n";
            output += "-------------------\n";
            output += `Node Initialized in ${timing.nodeStart}ms\n`;
            output += `V8 Platform Initialized in ${timing.v8Start}ms\n`;
            output += `Process Bootstrapped in ${timing.bootstrapComplete}ms\n`;
            output += `Process Loop Started in ${timing.loopStart}ms\n`;
            output += `Process Loop Ended after ${timing.loopExit - timing.loopStart}ms\n`;
            output += `Total Process Duration: ${timing.duration}ms\n`;

            // All metrics should
            output += "\nFunction Timers\n";
            output += "---------------\n";

            const functionTimers = this._functionTimers.entries();

            for (const [key, value] of functionTimers) {
                output += `${key}:\n\tCalled: ${value.totalCalls}\n\tTotal Time: ${value.totalDuration}ms` +
                    `\n\tAverage Time: ${value.totalDuration/value.totalCalls}ms\n\n`;
            }

            return output;
        }
    }
}

