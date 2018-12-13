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


import { PerformanceApiError } from "./PerformanceApiError";

/**
 * Thrown when a duplicate function timer would have been created.
 *
 * @external
 *
 * @example
 * function test() {
 *   // does stuff
 * }
 *
 * PerfTiming.getApi().timerify(test);
 * PerfTiming.getApi().timerify(test);
 */
export class TimerNameConflictError extends PerformanceApiError {
    /**
     * Construct the error message.
     * @param name The name of the timer that would be a duplicate.
     */
    constructor(name: string) {
        super(`A timer with the name "${name} was previously created. Please create unique timer names.`);
    }
}
