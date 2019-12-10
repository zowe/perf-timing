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
export interface IPerformanceObserverObserveOptions {
    /**
     * If true, the notification callback will be called using setImmediate() and multiple PerformanceEntry instance notifications
     * will be buffered internally. If false, notifications will be immediate and synchronous.
     */
    buffered?: boolean;

    /**
     * An array of strings identifying the types of PerformanceEntry instances the observer is interested in.
     */
    entryTypes: string[];
}
