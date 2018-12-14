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

/**
 * Data captured for a specific metric name.
 *
 * The common fields present for all metrics exist in this interface with the
 * entries being an array of a type that extends {@link IRequiredMetrics}
 *
 * @param T The object type of entry data. The type presented must contain the
 *          required fields present in the {@link IRequiredMetrics} interface
 *          for proper statistical analysis of results by the
 *          {@link PerformanceApi.getMetrics} function.
 */
export interface IMetric <T extends IRequiredMetrics> {
    /**
     * The average duration (in milliseconds) of each entry present {@link IMetric.entries}.
     */
    averageDuration: number;

    /**
     * The total number of {@link IMetric.entries} captured.
     */
    calls: number;

    /**
     * Collection of all metrics entries captured for the {@link IMetric.name}
     * within a specific group (e.g function metrics, measurement metrics, etc).
     *
     * Some metrics may be an instance of a Node
     * {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceentry PerformanceEntry}.
     * For information about those formats, see the Node documentation linked.
     */
    entries: T[];

    /**
     * The name of the metric.
     *
     * This name is guaranteed to be unique within a measurement group. When a metric
     * generation function is called in {@link PerformanceApi}, the name of the
     * metric will be used as a lookup key to see if the new measurement should
     * be aggregated with previous measurements.
     */
    name: string;

    /**
     * The total time (in milliseconds) represented by the sum of the durations
     * of each entry within {@link IMetric.entries}.
     */
    totalDuration: number;
}
