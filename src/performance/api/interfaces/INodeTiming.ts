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

import { IPerformanceEntry } from "./IPerformanceEntry";

/**
 * The collection of various node performance metric information.
 *
 * Since the {@link https://nodejs.org/api/perf_hooks.html Node Performance Timing API}
 * is an experimental feature, this interface was created to wrap the
 * {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performancenodetiming_extends_performanceentry PerformanceNodeTiming}
 * into a stable public API.
 */
export interface INodeTiming extends IPerformanceEntry {
    /**
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performancenodetiming_extends_performanceentry PerformanceNodeTiming}
     */
    bootstrapComplete: number;

    /**
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performancenodetiming_extends_performanceentry PerformanceNodeTiming}
     */
    loopExit: number;

    /**
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performancenodetiming_extends_performanceentry PerformanceNodeTiming}
     */
    loopStart: number;

    /**
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performancenodetiming_extends_performanceentry PerformanceNodeTiming}
     */
    nodeStart: number;

    /**
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performancenodetiming_extends_performanceentry PerformanceNodeTiming}
     */
    v8Start: number;
}
