import { ENV_PREFIX } from "../constants";
import { Environment } from "../environment";
import * as mkdirp from "mkdirp";
import * as fs from "fs";
import * as os from "os";

// Prefix for IO related items
const ENV_IO = `${ENV_PREFIX}_IO`;

// Environment variable that will be checked to see how many historical entries
// should be kept.
const ENV_IO_MAX_HISTORY = `${ENV_IO}_MAX_HISTORY`;

// Environment variable that will be used to determine where files are saved.
const ENV_IO_SAVE_DIR = `${ENV_IO}_SAVE_DIR`;

// tslint:disable:no-magic-numbers
Environment
    .register(ENV_IO_MAX_HISTORY, 5)
    .register(ENV_IO_SAVE_DIR, `${os.homedir()}/.perf-timing`);
// tslint:enable:no-magic-numbers


export function saveMetrics(data: object) { // @TODO proper typing and document
    // @FUTURE This is where file save location will be determined by
    // @FUTURE environment settings for aggregation at a later time.
    const directory = Environment.getValue(ENV_IO_SAVE_DIR);

    // If the directory doesn't exist, then no logs will need to roll.
    if (fs.existsSync(directory)) {
        // Prior to saving roll any metrics beforehand
        // Get the starting index
        let historyIndex = Environment.getNumber(ENV_IO_MAX_HISTORY);

        const lastFile = getMetricFileName(directory, historyIndex);

        // Delete the last file when history limit has been reached
        if (fs.existsSync(lastFile)) {
            fs.unlinkSync(lastFile);
        }

        // Move all historical logs down by 1
        while(historyIndex-- > 0) {
            const fileName = getMetricFileName(directory, historyIndex);
            if (fs.existsSync(fileName)) {
                fs.renameSync(fileName, getMetricFileName(directory, historyIndex + 1));
            }
        }
    } else {
        createDirectory(directory);
    }

    // Write the first metric
    fs.writeFileSync(getMetricFileName(directory, 1), JSON.stringify(data));
}

/**
 * Recursively create the save directory if needed.
 *
 * @param directory The directory that will be created
 */
function createDirectory(directory: string) {
    // @FUTURE When Node 8 is no longer supported, this function should be
    // @FUTURE changed to use the recursive property on mkdirSync
    // @FUTURE until then, use the mkdirp package for simplicity
    mkdirp.sync(directory);
}

/**
 * Get a constant file path for a given history item index.
 *
 * @param directory The directory of the file
 * @param index The index of the file in the history
 */
function getMetricFileName(directory: string, index: number) {
    return `${directory}/metrics.${index}.json`;
}
