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

jest.mock("../../api/PerformanceApi");
jest.mock("pkg-up");
jest.mock("../../../io");

import { PerformanceApi } from "../../api/PerformanceApi";
import { _GlobalType, PerformanceApiManager } from "../PerformanceApiManager";
import { GLOBAL_SYMBOL } from "../../../constants";
import * as pkgUp from "pkg-up";
import * as path from "path";
import { getMockWrapper } from "../../../../__tests__/utilities/types/MockWrapper";
import { saveMetrics } from "../../../io";

declare var global: _GlobalType;

describe("PerformanceApiManager", () => {
    // The total number of test json files available
    const NUM_JSON = 4;

    // Need to remember this so that we can replace the function after this test is done
    const processOnFunction = process.on;

    // Shorthand for getting the global symbol for purposes of this test.
    const getGlobal = () => global[GLOBAL_SYMBOL];

    // Shorthand for cleaning up after each test.
    const cleanup = () => {
        if (process.env[PerformanceApiManager.ENV_ENABLED]) {
            delete process.env[PerformanceApiManager.ENV_ENABLED];
        }

        if (global[GLOBAL_SYMBOL]) {
            delete global[GLOBAL_SYMBOL];
        }
    };

    /**
     * Calls the function registered to process.on("exit") by an api manager.
     * @param process The process mock instance where process.on exit was called
     * 
     * @returns the process call that is executed in the case that there might be a promise.
     */
    const triggerExit = (process: jest.Mock<any>) => {
        return process.mock.calls[0][1]();
    };

    /**
     * Get the path of a test json file.
     *
     * @param index The package.${index}.json value to get.
     * @returns a formulated path.
     */
    const getTestPath = (index: number) => path.join(__dirname, "test-json", `package.${index}.json`);

    /**
     * Sets the value of the environmental variable {@link PerformanceApiManager.ENV_ENABLED}
     * to the value passed.
     *
     * @param value The value to set to the Environmental variable.
     * @returns The value that was set
     */
    const setEnv = (value: string) => process.env[PerformanceApiManager.ENV_ENABLED] = value;

    beforeAll(() => {
        // Create a wrapper function to see what actually happens during a test call.
        (process as any).on = jest.fn();
    });

    afterAll(() => {
        (process as any).on = processOnFunction;
    });

    beforeEach(() => {
        jest.resetAllMocks();

        expect(getGlobal()).toBeUndefined();
    });

    afterEach(() => {
        cleanup();
    });

    it("should construct with performance disabled", () => {
        const testManager = new PerformanceApiManager();

        // Allows access to underlying private variables.
        const _testManager: any = testManager;

        expect(testManager.isEnabled).toBe(false);
        expect(testManager.packageUUID).toBeUndefined();
        expect(_testManager._api).toBeUndefined();

        // Test the API function
        expect(testManager.api).toBeInstanceOf(PerformanceApi);
        expect(PerformanceApi).toHaveBeenCalledWith(testManager);

        for (const testCase of ["Invalid", "FALSE", "FaLsE", ""]) {
            setEnv(testCase);
            expect((new PerformanceApiManager()).isEnabled).toBe(false);
        }
    });

    it("should construct with performance enabled", () => {
        setEnv(PerformanceApiManager.ENV_ENABLED_KEY);

        const testPath = getTestPath(1);
        const json = require(testPath);

        const mocks = getMockWrapper({
            pkgUpSync: pkgUp.sync,
            processOn: process.on
        });

        mocks.pkgUpSync.mockReturnValue(testPath);

        const testManager = new PerformanceApiManager();
        const _testManager: any = testManager;

        // Check class variables were properly set
        expect(testManager.isEnabled).toBe(true);
        expect(testManager.packageUUID).toBe(`${json.name}@${json.version}`);

        // Check that the global was created
        expect(getGlobal()).toBeInstanceOf(Map);

        // Check that the process.on exit was registered
        expect(mocks.processOn).toHaveBeenCalledTimes(1);
        expect(mocks.processOn).toHaveBeenCalledWith("exit", expect.any(Function));

        // Test that the right function was added
        _testManager._savePerformanceResults = jest.fn();
        triggerExit(mocks.processOn);
        expect(_testManager._savePerformanceResults).toHaveBeenCalled();

        // Test that the api works as expected
        expect(getGlobal().get(_testManager._instanceSymbol)).toBeUndefined();

        expect(testManager.api).toBeInstanceOf(PerformanceApi);
        expect(PerformanceApi).toHaveBeenCalledWith(testManager);

        // Check that this api was added to the global symbol
        expect(_testManager._instanceSymbol.toString()).toEqual(Symbol(testManager.packageUUID).toString());
        expect(getGlobal().get(_testManager._instanceSymbol)).toBe(testManager.api);

        // Now check that the capitalization doesn't affect if the utility gets enabled
        for(const testCase of ["TRUE", "true", "tRuE", "TRUe"]) {
            setEnv(testCase);
            expect((new PerformanceApiManager()).isEnabled).toBe(true);
        }
    });

    it("should default to the perf-timing package symbol when no package was found", () => {
        setEnv("true");

        const mocks = getMockWrapper({
            pkgUpSync: pkgUp.sync
        });

        const testPath = getTestPath(2);
        const testJson = require(testPath);

        mocks.pkgUpSync.mockReturnValueOnce(undefined).mockReturnValueOnce(testPath);

        const testManager = new PerformanceApiManager();

        expect(testManager.isEnabled).toBe(true);
        expect(testManager.packageUUID).toBe(`${testJson.name}@${testJson.version}`);

        expect(mocks.pkgUpSync).toHaveBeenCalledTimes(2);
        expect(mocks.pkgUpSync).toHaveBeenNthCalledWith(1);
        expect(mocks.pkgUpSync).toHaveBeenNthCalledWith(2, path.resolve(__dirname, "../"));
    });

    it("should create one api object", () => {
        const mocks = getMockWrapper({
            pkgUpSync: pkgUp.sync
        });

        // Check that the api is initialized only once for a manager
        const disabledManager = new PerformanceApiManager();

        expect(disabledManager.api).toBeInstanceOf(PerformanceApi);
        expect(disabledManager.api).toBeInstanceOf(PerformanceApi);
        expect(disabledManager.api).toBeInstanceOf(PerformanceApi);

        expect(PerformanceApi).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();

        // Perform the same checks when on the main manager
        setEnv("true");
        mocks.pkgUpSync.mockReturnValueOnce(getTestPath(1));

        // Hook a jest fn in place of the map so we can easily check that set
        // was only called once.
        (global[GLOBAL_SYMBOL] as any) = {
            set: jest.fn()
        };

        const enabledManager = new PerformanceApiManager();

        expect(enabledManager.api).toBeInstanceOf(PerformanceApi);
        expect(enabledManager.api).toBeInstanceOf(PerformanceApi);
        expect(enabledManager.api).toBeInstanceOf(PerformanceApi);

        expect(PerformanceApi).toHaveBeenCalledTimes(1);

        expect(getGlobal().set).toHaveBeenCalledTimes(1);
        expect(getGlobal().set).toHaveBeenCalledWith((enabledManager as any)._instanceSymbol, (enabledManager as any)._api);

    });

    describe("ensure that only one class acts as the main manager.", () => {
        beforeEach(() => {
            setEnv("true");
        });

        it("should register only one metric gathering event", () => {
            const managerArray: PerformanceApiManager[] = [];

            const mocks = getMockWrapper({
                pkgUpSync: pkgUp.sync,
                processOn: process.on
            });

            const numTestJson = NUM_JSON;

            for(let i = 1; i <= numTestJson; i++) {
                const testPath = getTestPath(i);
                const testJson = require(testPath);

                mocks.pkgUpSync.mockReturnValueOnce(testPath);

                const manager = new PerformanceApiManager();

                managerArray.push(manager);

                expect(manager.packageUUID).toBe(`${testJson.name}@${testJson.version}`);
                expect(mocks.processOn).toHaveBeenCalledTimes(1);
            }

            // Ensure that the first manager created is the one that has the save called
            (managerArray[0] as any)._savePerformanceResults = jest.fn();
            triggerExit(mocks.processOn);
            expect((managerArray[0] as any)._savePerformanceResults).toHaveBeenCalledTimes(1);
        });

        it("should register manager's api in the global space when requested", () => {
            const numJson = NUM_JSON;
            const mocks = getMockWrapper({
                pkgUpSync: pkgUp.sync
            });
            const managers: PerformanceApiManager[] = [];

            // we loop more times than we have packages so that a package name@version
            // will be repeated a bit. This allows us to see that we don't have
            // possible clash problems.
            const testLoops = numJson + 2;

            // Initialize every manager
            for(let i = 0; i < testLoops; i++) {
                mocks.pkgUpSync.mockReturnValueOnce(getTestPath(i % numJson + 1));
                managers.push(new PerformanceApiManager());
            }

            // Now loop through each one and see if the api works (calling once will create the manager)
            for(const manager of managers) {
                expect(manager.api).toBeInstanceOf(PerformanceApi);
            }

            // Now that the apis are created, check that they were properly added to the global symbol
            for(const manager of managers) {
                expect(getGlobal().get((manager as any)._instanceSymbol)).toBe((manager as any)._api);
            }
        });
    });

    describe("savePerformanceResults", () => {
        beforeEach(() => {
            setEnv("true");
        });

        const testMap: Map<string, number> = new Map([
            ["should save when there is just one manager", 1],
            ["should save when there are multiple managers. (no name conflicts)", NUM_JSON],
            ["should save when there are multiple managers. (some name conflicts)", NUM_JSON + 2],
        ]);

        for(const [name, numLoops] of testMap) {
            it(name, async () => {
                const mocks = getMockWrapper({
                    pkgUpSync: pkgUp.sync,
                    processOn: process.on,
                    saveMetrics
                });

                for (let i = 0; i < numLoops; i++) {
                    mocks.pkgUpSync.mockReturnValueOnce(getTestPath(i % NUM_JSON + 1));

                    const manager = new PerformanceApiManager();
                    const managerApi = getMockWrapper(manager.api);

                    managerApi.getMetrics.mockReturnValue(`manager ${i}: manager.api.getMetrics()`);
                    managerApi.getNodeTiming.mockReturnValue(`manager ${i}: manager.api.getNodeTiming()`);
                    managerApi.getSysInfo.mockReturnValue(`manager ${i}: manager.api.getSysInfo()`);
                }

                // Simulate the process exit call
                await triggerExit(mocks.processOn);

                expect(mocks.saveMetrics).toHaveBeenCalledTimes(1);
                
                // Validate that the manager was the one that called the function
                expect(mocks.saveMetrics.mock.calls[0][0].nodeTiming).toContain("manager 0:");
                expect(mocks.saveMetrics.mock.calls[0][0].systemInformation).toContain("manager 0:");
                expect(mocks.saveMetrics.mock.calls[0][0]).toMatchSnapshot();
            });
        }
    });
});
