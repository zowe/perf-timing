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
 * Properties that must be present on all Performance entry type objects. The
 * properties listed here are a subset of those listed in the node api. Properties
 * that are omitted were deemed not important or redundant to metrics that are
 * output.
 *
 * Since the {@link https://nodejs.org/api/perf_hooks.html Node Performance Timing API}
 * is an experimental feature, this interface was created to wrap the
 * {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceentry PerformanceEntry}
 * into a stable public API.
 */
export interface IPerformanceEntry {
    /**
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceentry PerformanceEntry}
     */
    duration: number;

    /**
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceentry PerformanceEntry}
     */
    name: string;

    /**
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceentry PerformanceEntry}
     */
    startTime: number;
}
