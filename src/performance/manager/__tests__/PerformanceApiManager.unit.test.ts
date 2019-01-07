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

import { PerformanceApi } from "../../api/PerformanceApi";
import { _GlobalType, PerformanceApiManager } from "../PerformanceApiManager";
import { GLOBAL_SYMBOL } from "../../../constants";
import * as pkgUp from "pkg-up";
import * as path from "path";
import { getMockWrapper } from "../../../../__tests__/utilities/types/MockWrapper";

declare var global: _GlobalType;

describe("PerformanceApiManager", () => {
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

        const mocks = getMockWrapper({
            pkgUpSync: pkgUp.sync,
            processOn: process.on
        });

        const testPath = path.join(__dirname, "test-json/package.1.json");
        const json = require(testPath);

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
        mocks.processOn.mock.calls[0][1]();
        expect(_testManager._savePerformanceResults).toHaveBeenCalled();

        // Test that the api works as expected
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
});
