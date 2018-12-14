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
 * This interface is a wrapper around the NodeJS PerformanceObserver class.
 *
 * Since the {@link https://nodejs.org/api/perf_hooks.html Node Performance Timing API}
 * is an experimental feature, this interface was created to wrap the
 * {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceobserver PerformanceObserver}
 * into a stable public API.
 *
 * @internal
 */
export interface IPerformanceObserver {
    /**
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceobserver PerformanceObserver}
     */
    disconnect(): void;

    /**
     * @see {@link https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceobserver PerformanceObserver}
     */
    observe(options: { buffered?: boolean, entryTypes: string[] }): void;
}
