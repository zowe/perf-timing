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

 /**
  * Base error for issues thrown by the Performance API.
  *
  * @external
  */
export class PerformanceApiError extends Error {
    /**
     * Construct the error.
     * @param message Message sent by the child.
     */
    constructor(message: string) {
        super(`Performance Error\n${message}`);
    }
}
