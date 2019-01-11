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

jest.mock("fs-extra");

import { Environment } from "../../environment/Environment";
import { saveMetrics } from "../saveMetrics";
import * as os from "os";
import * as fs from "fs-extra";
import { getMockWrapper } from "../../../__tests__/utilities/types/MockWrapper";

describe("saveMetrics", () => {
    const MAX_HISTORY_KEY = "PERF_TIMING_IO_MAX_HISTORY";
    const SAVE_DIR_KEY = "PERF_TIMING_IO_SAVE_DIR";

    const MAX_HISTORY_DEFAULT = 5;
    const SAVE_DIR_DEFAULT = `${os.homedir()}/.perf-timing`;

    afterEach(() => {
        // Clean up the environment after every test
        if (process.env[MAX_HISTORY_KEY]) {
            delete process.env[MAX_HISTORY_KEY];
        }

        if (process.env[SAVE_DIR_KEY]) {
            delete process.env[SAVE_DIR_KEY];
        }
    });

    it("should register environmental variables", () => {
        expect(saveMetrics).toBeTruthy(); // Loads the save metrics file triggering the environment to be set.
        expect(Environment.getNumber(MAX_HISTORY_KEY)).toBe(MAX_HISTORY_DEFAULT);
        expect(Environment.getString(SAVE_DIR_KEY)).toBe(SAVE_DIR_DEFAULT);
    });

    /**
     * This interface represents the values available in the map. The keys
     * of this object represent all environmental variables registered in
     * the save metrics function.
     *
     * When a value is set in this interface, it is injected into process.env
     * so that the test can run properly.
     */
    interface IEnvKeys {
        /**
         * The value of the save directory variable.
         */
        [SAVE_DIR_KEY]?: string;

        /**
         * The value of the max history variable.
         */
        [MAX_HISTORY_KEY]?: number;
    }

    /**
     * This map defines the test object to run.
     *
     * The key is the name of the describe block that should be created for the
     * test.
     *
     * The value is the environmental variables that should be tested.
     */
    const saveMetricsTestRunner: Map<string, IEnvKeys> = new Map([
        ["using default values", {}],
        [
            "different directory in environment",
            {
                [SAVE_DIR_KEY]: "new-directory"
            }
        ],
        [
            "different history in in environment",
            {
                [MAX_HISTORY_KEY]: 10
            }
        ],
        [
            "both values overridden in environment",
            {
                [SAVE_DIR_KEY]: "another-directory",
                [MAX_HISTORY_KEY]: 7
            }
        ]
    ]);

    // Loop through each test of the runner object
    for (const [key, value] of saveMetricsTestRunner) {
        describe(key, () => {
            const MAX_HISTORY = value[MAX_HISTORY_KEY] || MAX_HISTORY_DEFAULT;
            const SAVE_DIR = value[SAVE_DIR_KEY] || SAVE_DIR_DEFAULT;

            const testData = {
                dummyObject: true,
                string: "This object doesn't represent the output of the utility. It's just an object we can use to check if the write was proper."
            };

            const mocks = getMockWrapper({
                ensureDirSync: fs.ensureDirSync,
                removeSync: fs.removeSync,
                existsSync: fs.existsSync,
                renameSync: fs.renameSync,
                writeFileSync: fs.writeFileSync
            });

            beforeEach(() => {
                jest.resetAllMocks();

                // Set the environmental variables accordingly
                if (value[MAX_HISTORY_KEY]) {
                    process.env[MAX_HISTORY_KEY] = value[MAX_HISTORY_KEY].toString();
                }

                if (value[SAVE_DIR_KEY]) {
                    process.env[SAVE_DIR_KEY] = value[SAVE_DIR_KEY];
                }
            });

            it("should write data to the initial log file", () => {
                saveMetrics(testData as any);

                expect(mocks.ensureDirSync).toBeCalledTimes(1);
                expect(mocks.ensureDirSync).toHaveBeenCalledWith(SAVE_DIR);

                expect(mocks.removeSync).toHaveBeenCalledTimes(1);
                expect(mocks.removeSync).toHaveBeenCalledWith(`${SAVE_DIR}/metrics.${MAX_HISTORY}.json`);

                const expectedCalls = MAX_HISTORY - 1;

                expect(mocks.existsSync).toHaveBeenCalledTimes(expectedCalls);
                for (let i = 0; i < expectedCalls; i++) {
                    expect(mocks.existsSync.mock.calls[i][0]).toBe(`${SAVE_DIR}/metrics.${MAX_HISTORY - i - 1}.json`);
                }

                expect(mocks.renameSync).not.toHaveBeenCalled();

                expect(mocks.writeFileSync).toBeCalledTimes(1);
                expect(mocks.writeFileSync).toHaveBeenCalledWith(
                    `${SAVE_DIR}/metrics.1.json`, JSON.stringify(testData)
                );
            });

            it("should roll logs", () => {
                mocks.existsSync.mockReturnValue(true);
                saveMetrics(testData as any);

                const expectedCalls = MAX_HISTORY - 1;

                expect(mocks.existsSync).toHaveBeenCalledTimes(expectedCalls);
                expect(mocks.renameSync).toHaveBeenCalledTimes(expectedCalls);

                for (let i = 0; i < expectedCalls; i++) {
                    // Check that the exists sync is proper
                    expect(mocks.existsSync.mock.calls[i][0]).toBe(`${SAVE_DIR}/metrics.${MAX_HISTORY - i - 1}.json`);

                    // Check that the rename is proper
                    expect(mocks.renameSync.mock.calls[i][0]).toBe(`${SAVE_DIR}/metrics.${MAX_HISTORY - i - 1}.json`);
                    expect(mocks.renameSync.mock.calls[i][1]).toBe(`${SAVE_DIR}/metrics.${MAX_HISTORY - i}.json`);
                }

                expect(mocks.writeFileSync).toBeCalledTimes(1);
                expect(mocks.writeFileSync).toHaveBeenCalledWith(
                    `${SAVE_DIR}/metrics.1.json`, JSON.stringify(testData)
                );
            });
        });
    }
});
