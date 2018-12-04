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
 * @see https://nodejs.org/dist/latest-v10.x/docs/api/perf_hooks.html#perf_hooks_class_performanceobserver
 */
export interface IPerformanceObserver {
    disconnect(): void;
    observe(options: { buffered?: boolean, entryTypes: string[] }): void;
}
