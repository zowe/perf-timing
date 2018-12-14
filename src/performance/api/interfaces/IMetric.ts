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

import { IRequiredMetrics } from "./IRequiredMetrics";

export interface IMetric <T extends IRequiredMetrics> {
    /**
     * The average duration (in milliseconds) spent in each call of the function.
     */
    averageDuration: number;

    /**
     * The total number of calls to the function.
     */
    calls: number;

    /**
     * The raw data provided by node for each function call.
     *
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceentry Node Documentation}
     */
    entries: T[];

    /**
     * The name of the function timer. Equivalent to the function name or the name
     * variable passed into {@link PerformanceApi.watch}.
     */
    name: string;

    /**
     * The total time (in milliseconds) spent in the function call.
     */
    totalDuration: number;
}
