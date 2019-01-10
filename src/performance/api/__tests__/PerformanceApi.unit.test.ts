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

jest.mock("perf_hooks");
jest.mock("os");

import { CollectionMap, PerformanceApi } from "../PerformanceApi";
import {
    ICollectionObserver,
    IFunctionObserver,
    IMeasurementObserver,
    IMetric,
    IPerformanceEntry,
    IPerformanceObserver
} from "../interfaces";
import { IPerformanceApiManager } from "../../manager/interfaces";

import * as perfHooks from "perf_hooks";
import * as os from "os";

import { randomHexString, randomInteger, randomNumber, getMockWrapper } from "../../../../__tests__/utilities";
import { PerformanceNotCapturedError } from "../errors";

/**
 * Strongly typed access to the private static methods of the PerformanceApi. For
 * documentation on these methods, see the corresponding item in the {@link PerformanceApi}.
 */
interface IPerformanceApiStaticPrivate {
    _errorImport: typeof import("../errors");
    readonly _errors: IPerformanceApiStaticPrivate["_errorImport"];
    _aggregateData<T extends IPerformanceEntry>(map: CollectionMap<ICollectionObserver<T>>): Array<IMetric<T>>;
}

type PerformanceApiType = { [K in keyof PerformanceApi]: PerformanceApi[K] };


/**
 * Strongly typed access to the private instance methods of the PerformanceApi. For
 * documentation on these methods, see the corresponding item in the {@link PerformanceApi}.
 */
interface IPerformanceApiPrivate extends PerformanceApiType {
    _functionObservers: CollectionMap<IFunctionObserver>;
    readonly _manager: IPerformanceApiManager;
    _measurementObservers: CollectionMap<IMeasurementObserver>;
    readonly _perfHooks: typeof import("perf_hooks");
    _addPackageNamespace(value: string): string;
}

/**
 * Gets a dummy api manager object for testing.
 *
 * @param packageUUID The uuid of the package manager
 * @param isEnabled Is the manager enabled
 *
 * @returns A manager object that can be passed to the api
 */
function getManager(packageUUID: string, isEnabled = true): IPerformanceApiManager {
    return {
        isEnabled,
        packageUUID
    };
}

/**
 * Generates a dummy performance observer for testing.
 *
 * @returns a dummy performance observer.
 */
function getDummyObserver(): IPerformanceObserver {
    return {
        disconnect: jest.fn(),
        observe: jest.fn()
    };
}

describe("PerformanceApi", () => {
    // This gives us an all access pass to the performance timing api.
    const _PerformanceApi: IPerformanceApiStaticPrivate = PerformanceApi as any;

    beforeEach(() => {
        // Clear out the value of the error import for each test.
        _PerformanceApi._errorImport = undefined;

        jest.clearAllMocks();
    });

    describe("private static functions", () => {
        it("should load errors on demand", () => {
            expect(_PerformanceApi._errorImport).toBeUndefined();

            const errors = require("../errors");

            expect(_PerformanceApi._errors).toBe(errors);
            expect(_PerformanceApi._errorImport).toBe(errors);

            // Tests the else path of the get function
            expect(_PerformanceApi._errors).toBe(errors);
        });

        describe("_aggregateData", () => {
            const generateCollectionMap = (mapData: Array<[string, IPerformanceEntry[]]>): CollectionMap<ICollectionObserver<IPerformanceEntry>> => {
                const map: ReturnType<typeof generateCollectionMap> = new Map();

                for (const data of mapData) {
                    map.set(data[0], {
                        entries: data[1],
                        isConnected: false,
                        observer: getDummyObserver()
                    });
                }

                return map;
            };

            it("should convert a collection map to the proper format. (1 map entry)", () => {
                const testMap = generateCollectionMap([
                    ["test element 1", [
                        {
                            duration: 5.325,
                            name: "test",
                            startTime: 12
                        }
                    ]]
                ]);

                // Hard coded test to see if we get the right data from a single
                // metric.
                expect(_PerformanceApi._aggregateData(testMap)).toEqual([
                    {
                        averageDuration: 5.325,
                        calls: 1,
                        entries: [{
                            duration: 5.325,
                            name: "test",
                            startTime: 12
                        }],
                        name: "test element 1",
                        totalDuration: 5.325
                    }
                ]);
            });

            it("should convert a randomized map to the proper output", () => {
                // tslint:disable:no-magic-numbers

                const numCollectionItems = randomInteger(5, 20);
                const expectedArray: Array<IMetric<IPerformanceEntry>> = [];
                const map = generateCollectionMap([]); // I'm too lazy to keep typing this

                // Create a random number of items in the map, between 5 and 20 will be created
                for(let itemCounter = 0; itemCounter < numCollectionItems; itemCounter++) {
                    // Create a unique key name for each item
                    const keyName = `${itemCounter}_${randomHexString(randomInteger(10, 20))}`;
                    let totalDuration = 0;

                    // Default to 0 entries
                    let min = 0;
                    let max = 0;

                    const entries: IPerformanceEntry[] = [];

                    if (itemCounter === 1) {
                        min = 1;
                        max = 1;
                    } else if (itemCounter > 1) {
                        min = 2;
                        max = 10;
                    }

                    // For item 0 there will be no entries so that might blow up.
                    // For item 1 there will be 1 entry
                    // For items 2+ there will be between 2 and 10 entries
                    const numEntries = randomInteger(min, max);
                    for (let entryCounter = 0; entryCounter < numEntries; entryCounter++) {
                        const insertObj = {
                            duration: randomNumber(0, 15),
                            startTime: randomNumber(0, 15),
                            name: randomHexString(randomInteger(10, 20))
                        };

                        // Keep track of the duration for this run
                        totalDuration += insertObj.duration;

                        entries.push(insertObj);
                    }

                    // Add the item to the map
                    map.set(keyName, {
                        entries,
                        isConnected: false,
                        observer: getDummyObserver()
                    });

                    // Now add the item to the expected array as well
                    expectedArray.push({
                        name: keyName,
                        calls: entries.length,
                        totalDuration,
                        averageDuration: totalDuration / entries.length,
                        entries
                    });
                }

                expect(_PerformanceApi._aggregateData(map)).toEqual(expectedArray);

                // tslint:enable:no-magic-numbers
            });

            it("should return an empty array when there is no data", () => {
                expect(_PerformanceApi._aggregateData(new Map())).toEqual([]);
            });
        });
    });

    describe("private instance functions/variables", () => {
        it("should properly initialize private variables (manager disabled)", () => {
            const manager = getManager("Malkin@71", false);

            const api: IPerformanceApiPrivate = new PerformanceApi(manager) as any;

            expect(api._functionObservers).toBeInstanceOf(Map);
            expect(api._functionObservers.size).toBe(0);

            expect(api._measurementObservers).toBeInstanceOf(Map);
            expect(api._measurementObservers.size).toBe(0);

            expect(api._perfHooks).toBeUndefined();
            expect(api._manager).toBe(manager);

        });
        it("should properly initialize private variables (manager enabled)", () => {
            const manager = getManager("Guentzel@59");

            const api: IPerformanceApiPrivate = new PerformanceApi(manager) as any;

            expect(api._functionObservers).toBeInstanceOf(Map);
            expect(api._functionObservers.size).toBe(0);

            expect(api._measurementObservers).toBeInstanceOf(Map);
            expect(api._measurementObservers.size).toBe(0);

            expect(api._perfHooks).toBe(require("perf_hooks"));
            expect(api._manager).toBe(manager);
        });

        it("should properly add the package namespace", () => {
            const manager = getManager("Letang@58", true);

            const _api: IPerformanceApiPrivate = new PerformanceApi(manager) as any;

            for(const test of ["", "Value 1", "12345", "false"]) {
                expect(_api._addPackageNamespace(test)).toBe(`${manager.packageUUID}: ${test}`);
            }
        });
    });

    describe("gathering metrics", () => {
        let mocks = getMockWrapper({
            aggregateData: _PerformanceApi._aggregateData
        });

        beforeAll(() => {
            jest.spyOn(_PerformanceApi, "_aggregateData");
            mocks = getMockWrapper({
                aggregateData: _PerformanceApi._aggregateData
            });
        });
        beforeEach(() => {
            mocks.aggregateData.mockClear();
            mocks.aggregateData.mockImplementation(() => undefined);
        });
        afterAll(() => mocks.aggregateData.mockRestore());

        describe("getMetrics", () => {
            it("should return gathered metrics", () => pending());
            it("should throw PerformanceNotCapturedError", () => {
                const api = new PerformanceApi(getManager("NotEnabled", false));

                expect(() => {
                    api.getMetrics();
                }).toThrowError(PerformanceNotCapturedError);

                expect(_PerformanceApi._aggregateData).not.toHaveBeenCalled();
            });
        });

        describe("getNodeTiming", () => {
            Object.defineProperty(perfHooks.performance, "nodeTiming", {
                get() {
                    return {
                        bootstrapComplete: 0,
                        duration: 1,
                        loopStart: 2,
                        loopExit: 3,
                        name: "Some Name",
                        nodeStart: 4,
                        startTime: 5,
                        v8Start: 6
                    };
                },
                configurable: true
            });

            const spy = jest.spyOn(perfHooks.performance, "nodeTiming", "get");

            it("should return node timing information", () => {
                const api = new PerformanceApi(getManager("NodeTiming"));

                // Check that the resulting call is consistent
                expect(api.getNodeTiming()).toMatchSnapshot();
            });

            it("should throw PerformanceNotCapturedError", () => {
                const api = new PerformanceApi(getManager("NotEnabled", false));

                expect(() => {
                    api.getNodeTiming();
                }).toThrowError(PerformanceNotCapturedError);

                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe("getSysInfo", () => {
            it("should return system information", () => {
                const osMock = getMockWrapper(os);

                const argv = process.argv;
                process.argv = ["a", "b", "c", "d"];

                osMock.cpus.mockReturnValue("CPU Information");
                osMock.loadavg.mockReturnValue("Load Avg Information");
                osMock.hostname.mockReturnValue("Hostname Information");
                osMock.networkInterfaces.mockReturnValue("Network Interfaces Information");
                osMock.type.mockReturnValue("OS Type Information");
                osMock.arch.mockReturnValue("OS Arch Information");
                osMock.release.mockReturnValue("OS Release Information");
                osMock.platform.mockReturnValue("OS Platform Information");
                osMock.userInfo.mockReturnValue({shell: "User Shell Information"});
                osMock.uptime.mockReturnValue("Uptime Information");

                osMock.freemem.mockReturnValue(1);
                osMock.totalmem.mockReturnValue(1);

                // First test that the object format is unchanged
                const api = new PerformanceApi(getManager("SysInfoTest"));
                expect(api.getSysInfo()).toMatchSnapshot();

                const testSet: Set<{free: number, total: number}> = new Set([
                    {free: 0, total: 0},
                    {free: 1, total: 0},
                    {free: 0, total: 1},
                    {free: 1, total: 1}
                ]);

                // Define some normal min/max ranges to be expected from os.freemem/os.totalmem
                const additionalTests = 50;
                const freeMin = 0;
                const freeMax = freeMin + additionalTests - 1;
                const totalMin = freeMax + 1;
                const totalMax = totalMin + additionalTests - 1;

                // Add more randomized tests
                for (let i = 0; i < additionalTests; i ++) {
                    testSet.add({
                        free: randomInteger(freeMin, freeMax),
                        total: randomInteger(totalMin, totalMax)
                    });
                }

                // Next do some testing with the memory calculations.
                for (const [{free, total}] of testSet.entries()) {
                    osMock.freemem.mockReturnValueOnce(free);
                    osMock.totalmem.mockReturnValueOnce(total);

                    const usage = total - free;
                    const usagePercentage = (usage / total) * 100; // tslint:disable-line:no-magic-numbers

                    expect(api.getSysInfo().memory).toEqual({
                        free,
                        total,
                        usage,
                        usagePercentage
                    });
                }

                process.argv = argv;
            });

            it("should throw PerformanceNotCapturedError", () => {
                const api = new PerformanceApi(getManager("NotEnabled", false));

                expect(() => {
                    api.getSysInfo();
                }).toThrowError(PerformanceNotCapturedError);

                // Just sanity check that one of the os functions wasn't called
                expect(os.freemem).not.toHaveBeenCalled();
            });
        });
    });

    describe("point to point measurement", () => {
        it("should do nothing when performance is not enabled", () => {
            const manager = getManager("PerformanceDisabled", false);
            const api: IPerformanceApiPrivate = new PerformanceApi(manager) as any;

            api.mark("Should not have marked");
            expect(perfHooks.performance.mark).not.toHaveBeenCalled();

            api.clearMarks("Should not have cleared marks");
            expect(perfHooks.performance.clearMarks).not.toHaveBeenCalled();

            api.measure("Should not have measured", "a", "b");
            expect(perfHooks.performance.measure).not.toHaveBeenCalled();
        });

        it("should clear all marks", () => {
            const manager = getManager("Jeff");
            const api: IPerformanceApiPrivate = new PerformanceApi(manager) as any;

            (api as any)._addPackageNamespace = jest.fn();

            api.clearMarks();

            expect(api._addPackageNamespace).not.toHaveBeenCalled();
            expect(perfHooks.performance.clearMarks).toHaveBeenCalledTimes(1);
            expect(perfHooks.performance.clearMarks).toHaveBeenCalledWith(undefined);
        });

        it("should clear a single mark", () => {
            const uuid = "Matt";
            const name = "Murray";

            const manager = getManager(uuid);
            const api: IPerformanceApiPrivate = new PerformanceApi(manager) as any;

            jest.spyOn(api, "_addPackageNamespace");

            api.clearMarks(name);

            expect(api._addPackageNamespace).toHaveBeenCalledWith(name);
            expect(perfHooks.performance.clearMarks).toHaveBeenCalledTimes(1);
            expect(perfHooks.performance.clearMarks).toHaveBeenCalledWith(`${uuid}: ${name}`);
        });

        it("should create a single mark", () => {
            const uuid = "Matt";
            const name = "Murray";

            const manager = getManager(uuid);
            const api: IPerformanceApiPrivate = new PerformanceApi(manager) as any;

            jest.spyOn(api, "_addPackageNamespace");

            api.mark(name);

            expect(api._addPackageNamespace).toHaveBeenCalledWith(name);
            expect(perfHooks.performance.mark).toHaveBeenCalledTimes(1);
            expect(perfHooks.performance.mark).toHaveBeenCalledWith(`${uuid}: ${name}`);
        });

        describe("measure", () => {
            it("should measure between two marks", () => {
                // This should be a simple function to test that a measurement was called
                const manager = getManager("Mario");
                const api: IPerformanceApiPrivate = new PerformanceApi(manager) as any;

                const name = "Measure Name";
                const startMark = "Start Mark";
                const endMark = "End Mark";

                jest.spyOn(api, "_addPackageNamespace");

                api.measure(name, startMark, endMark);

                expect(perfHooks.PerformanceObserver).toHaveBeenCalledTimes(1);
                expect(perfHooks.PerformanceObserver).toHaveBeenCalledWith(expect.any(Function));

                expect(api._addPackageNamespace).toHaveBeenCalledWith(name);
                expect(api._addPackageNamespace).toHaveBeenCalledWith(startMark);
                expect(api._addPackageNamespace).toHaveBeenCalledWith(endMark);

                const mapObj = api._measurementObservers.get(name);

                expect(mapObj.entries).toEqual([]);
                expect(mapObj.isConnected).toBe(true);
                expect(mapObj.observer).toBeInstanceOf(perfHooks.PerformanceObserver);
                expect(mapObj.observer.observe).toHaveBeenCalledTimes(1);
                expect(mapObj.observer.observe).toHaveBeenCalledWith({ entryTypes: ["measure"], buffered: true });

                expect(perfHooks.performance.measure).toHaveBeenCalledTimes(1);
                expect(perfHooks.performance.measure).toHaveBeenCalledWith(
                    api._addPackageNamespace(name),
                    api._addPackageNamespace(startMark),
                    api._addPackageNamespace(endMark)
                );
            });

            it("should not create another observer if one is connected", () => {
                // This should be a simple function to test that a measurement was called
                const manager = getManager("Mario");
                const api: IPerformanceApiPrivate = new PerformanceApi(manager) as any;

                const name = "Measure Name";

                const startMark1 = "Start Mark 1";
                const endMark1 = "End Mark 1";

                const startMark2 = "Start Mark 2";
                const endMark2 = "End Mark 2";

                jest.spyOn(api, "_addPackageNamespace");
                jest.spyOn(api._measurementObservers, "set");

                api.measure(name, startMark1, endMark1);
                api.measure(name, startMark2, endMark2);

                expect(api._measurementObservers.set).toHaveBeenCalledTimes(1);
                expect(perfHooks.PerformanceObserver).toHaveBeenCalledTimes(1);

                expect(perfHooks.performance.measure).toHaveBeenNthCalledWith(
                    1,
                    api._addPackageNamespace(name),
                    api._addPackageNamespace(startMark1),
                    api._addPackageNamespace(endMark1)
                );

                expect(perfHooks.performance.measure).toHaveBeenNthCalledWith(
                    2,
                    api._addPackageNamespace(name),
                    api._addPackageNamespace(startMark2),
                    api._addPackageNamespace(endMark2)
                );
            });

            it("should collect metrics from the observer", () => {
                // tslint:disable:no-magic-numbers
                // This should be a simple function to test that a measurement was called
                const manager = getManager("Mario");
                const api: IPerformanceApiPrivate = new PerformanceApi(manager) as any;

                const name = "Measure Name";
                const startMark = "Start Mark";
                const endMark = "End Mark";

                api.measure(name, startMark, endMark);

                const mapObj = api._measurementObservers.get(name);

                const observerFunction = (perfHooks.PerformanceObserver as jest.Mock<any>).mock.calls[0][0];
                const listObj = {
                    getEntriesByName: jest.fn()
                };

                listObj.getEntriesByName.mockReturnValue([]);

                observerFunction(listObj);

                expect(mapObj.isConnected).toBe(true);
                expect(mapObj.observer.disconnect).not.toHaveBeenCalled();

                expect(listObj.getEntriesByName).toHaveBeenCalledTimes(1);
                expect(listObj.getEntriesByName).toHaveBeenCalledWith(api._addPackageNamespace(name));

                // Perform a second measure and give it data this time
                const entries = [
                    {
                        name,
                        startTime: 123,
                        duration: 456
                    },
                    {
                        name,
                        startTime: 789,
                        duration: 123
                    }
                ];

                listObj.getEntriesByName.mockReturnValueOnce(entries);

                observerFunction(listObj);

                expect(mapObj.isConnected).toBe(false);
                expect(mapObj.observer.disconnect).toHaveBeenCalled();

                // Check that the data object output remains unchanged.
                expect(mapObj.entries).toMatchSnapshot("measure data collection is unchanged");

                // tslint:enable:no-magic-numbers
            });
        });
    });

    describe("watching a function", () => {
        it("should map timerify to watch", () => {
            const manager = getManager("ABCDE", false);

            const api = new PerformanceApi(manager);

            expect(api.timerify).toBe(api.watch);
        });

        it("should map untimerify to unwatch", () => {
            const manager = getManager("ABCDE", false);

            const api = new PerformanceApi(manager);

            expect(api.untimerify).toBe(api.unwatch);
        });

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
