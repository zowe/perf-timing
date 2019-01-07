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

import { PerformanceApi } from "../../api/PerformanceApi";
import { global, PerformanceApiManager } from "../PerformanceApiManager";
import { GLOBAL_SYMBOL } from "../../../constants";


describe("PerformanceApiManager", () => {
    const processOnFunction = process.on;

    // Shorthand for getting the global symbol for purposes of this test.
    const getGlobal = () => global[GLOBAL_SYMBOL];

    beforeAll(() => {
        // Create a wrapper function to see what actually happens during a test call.
        (process as any).on = jest.fn();
    });

    afterAll(() => {
        (process as any).on = processOnFunction;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should should construct with performance disabled", () => {
        const testManager = new PerformanceApiManager();

        // Allows access to underlying private variables.
        const _testManager: any = testManager;

        expect(testManager.isEnabled).toBe(false);
        expect(testManager.packageUUID).toBeUndefined();
        expect(_testManager._api).toBeUndefined();

        // Test the API function
        expect(testManager.api).toBeTruthy();
    });
});
