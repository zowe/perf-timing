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
  * Thrown when a function timer was removed that was never added.
  *
  * @external
  *
  * @example
  * function bad() {
  *   // Does stuff
  * }
  *
  * bad = PerfTiming.getApi().untimerify(bad);
  */
export class TimerDoesNotExistError extends PerformanceApiError {

    /**
     * Construct the error object with a specific message.
     * @param name The name of the timer that was not found.
     */
    constructor(name: string) {
        super(`A function timer with the name "${name}", does not exist. Please create the timer first.`);
    }
}
