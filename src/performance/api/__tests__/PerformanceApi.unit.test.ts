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

import { CollectionMap, PerformanceApi } from "../PerformanceApi";
import {
    ICollectionObserver,
    IMetric,
    IPerformanceEntry
} from "../interfaces";

/**
 * Strongly typed access to the private static methods of the PerformanceApi. For
 * documentation on these methods, see the corresponding item in the {@link PerformanceApi}.
 */
interface IPerformanceApiStaticPrivate {
    _errorImport: typeof import("../errors");
    readonly _errors: IPerformanceApiStaticPrivate["_errorImport"];
    _aggregateData<T extends IPerformanceEntry>(map: CollectionMap<ICollectionObserver<T>>): Array<IMetric<T>>;
}

// interface IPerformanceApiPrivate {
//     // @TODO Fill this out later
// }

describe("PerformanceApi", () => {
    // This gives us an all access pass to the performance timing api.
    const _PerformanceApi: IPerformanceApiStaticPrivate = PerformanceApi as any;

    beforeEach(() => {
        // Clear out the value of the error import for each test.
        _PerformanceApi._errorImport = undefined;
    });

    describe("private static functions", () => {
        it("should load errors on demand", () => pending());

        describe("_aggregateData", () => {
            it("should convert a collection map to the proper format.", () => pending());
            it("should return an empty array when there is no data", () => pending());
        });
    });

    describe("private instance functions/variables", () => {
        it("should properly initialize private variables (manager disabled)", () => pending());
        it("should properly initialize private variables (manager enabled)", () => pending());
        it("should properly add the package namespace", () => pending());
    });

    describe("gathering metrics", () => {
        describe("getMetrics", () => {
            it("should return gathered metrics", () => pending());
            it("should throw PerformanceNotCapturedError", () => pending());
        });

        describe("getNodeTiming", () => {
            it("should return node timing information", () => pending());
            it("should throw PerformanceNotCapturedError", () => pending());
        });

        describe("getSysInfo", () => {
            it("should return system information", () => pending());
            it("should throw PerformanceNotCapturedError", () => pending());
        });
    });

    describe("point to point measurement", () => {
        it("should clear all marks", () => pending());
        it("should clear a single mark", () => pending());
        it("should create a single mark", () => pending());

        describe("measure", () => {
            it("should measure between two marks", () => pending());
            it("should reuse a measurement name in the map", () => pending());
            it("should not create another observer if one is connected", () => pending());
        });
    });

    describe("watching a function", () => {
        it("should map timerify to watch", () => pending());
        it("should map untimerify to unwatch", () => pending());

        describe("watching a function", () => {
            it("should watch a function", () => pending());
            it("should return the proper function", () => pending()); // Handle enabled vs disabled here
            it("should gather metrics on the watched function", () => pending());
            it("should throw a TimerNameConflictError", () => pending());
            it("should allow the timer to be saved under a different name", () => pending()); // Note this might cause problems with 2
                                                                                               // functions of the same name so we get to test it
        });

        describe("unwatching a function", () => {
            it("should return the input function", () => pending());
            it("should return the original function implementation", () => pending());
            it("should disconnect the observer", () => pending()); // Test that calling the function doesn't trigger the observer
            it("should accept the name of the timer that is unwatched", () => pending());
        });
    });
});
