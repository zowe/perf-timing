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

import { ENV_PREFIX } from "../constants";
import { Environment } from "../environment";
import * as fs from "fs-extra";
import * as os from "os";
import { IPerformanceMetrics } from "../performance/manager";

/**
 * Environment key prefix for the max history value. Max history refers to the
 * max number of log entries to keep when performance is enabled.
 *
 * @external
 */
const ENV_IO_MAX_HISTORY = `${ENV_PREFIX}_IO_MAX_HISTORY`;

/**
 * Environment key prefix for where the logs are saved.
 *
 * @external
 */
const ENV_IO_SAVE_DIR = `${ENV_PREFIX}_IO_SAVE_DIR`;

// tslint:disable:no-magic-numbers
Environment
    .register(ENV_IO_MAX_HISTORY, 5)
    .register(ENV_IO_SAVE_DIR, `${os.homedir()}/.perf-timing`);
// tslint:enable:no-magic-numbers

/**
 * Save metrics into the next log file.
 *
 * Upon execution this function will first roll any logs based on the value
 * present within environmental {@link ENV_IO_MAX_HISTORY} variable. The directory
 * that is checked will be determined from the {@link ENV_IO_SAVE_DIR} value.
 *
 * @param data The object data to save in a file.
 *
 * @todo This function needs to be enhanced so that an environment variable can
 * influence the file name.
 *
 * @internal
 */
export function saveMetrics(data: IPerformanceMetrics) {
    // @FUTURE This is where file save location will be determined by
    // @FUTURE environment settings for aggregation at a later time.
    const directory = Environment.getValue(ENV_IO_SAVE_DIR);

    fs.ensureDirSync(directory);

    // Prior to saving roll any metrics beforehand
    // Get the starting index
    let historyIndex = Environment.getNumber(ENV_IO_MAX_HISTORY);

    const lastFile = getMetricFileName(directory, historyIndex);

    // Delete the last file when history limit has been reached
    fs.removeSync(lastFile);

    // Move all historical logs down by 1
    while (--historyIndex > 0) {
        const fileName = getMetricFileName(directory, historyIndex);

        if (fs.existsSync(fileName)) {
            fs.renameSync(fileName, getMetricFileName(directory, historyIndex + 1));
        }
    }

    // Write the first metric
    fs.writeFileSync(getMetricFileName(directory, 1), JSON.stringify(data));
}

/**
 * Get a constant file path for a given history item index.
 *
 * @param directory The directory of the file
 * @param index The index of the file in the history
 *
 * @returns The formatted file name that will be saved
 *
 * @internal
 */
function getMetricFileName(directory: string, index: number) {
    return `${directory}/metrics.${index}.json`;
}
