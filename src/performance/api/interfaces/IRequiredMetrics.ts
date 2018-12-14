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
 * Represents the required metrics to be present in a metric entry.
 *
 * @internal
 */
export interface IRequiredMetrics {
    /**
     * The total number of milliseconds elapsed for this metric.
     */
    duration: number;

    /**
     * The high resolution millisecond timestamp marking the starting time of the Performance Entry.
     */
    startTime: number;

    /**
     * The name of the metric.
     */
    name: string;
}
