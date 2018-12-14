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

import { IPerformanceObserver } from "./IPerformanceObserver";
import { IRequiredMetrics } from "./IRequiredMetrics";

/**
 * A collection observer is a base object responsible for keeping references
 * to the underlying Node performance observer object.
 *
 * @param T The object type of entry data. The type presented must contain the
 *          required fields present in the {@link IRequiredMetrics} interface
 *          for proper statistical analysis of results by the
 *          {@link PerformanceApi.getMetrics} function.
 * 
 * @internal
 */
export interface ICollectionObserver<T extends IRequiredMetrics> {
    /**
     * A collection of performance data captured by the node performance observer.
     */
    entries: T[];

    /**
     * Is the current node performance observer connected. If it is not connected,
     * then a new one must be created to continue collection under this observer.
     */
    isConnected: boolean;

    /**
     * The underlying performance observer responsible for collecting metrics.
     */
    observer: IPerformanceObserver;
}
