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
 * Thrown when metric output methods were called and performance was not enabled.
 *
 * @example
 * const perfApi = new PerformanceApi({enabled: false, packageUUID: "bogus"});
 *
 * // Calling these methods will cause this error to be thrown.
 * perfApi.getMetrics();
 * perfApi.getNodeTiming();
 * perfApi.getSysInfo();
 */
export class PerformanceNotCapturedError extends PerformanceApiError {
    constructor() {
        super("Unable to access performance metrics when performance monitoring is not enabled!");
    }
}
