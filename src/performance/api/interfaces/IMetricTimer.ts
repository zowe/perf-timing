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

export interface IMetricTimer<T extends IRequiredMetrics> {
    entries: T[];
    isConnected: boolean;
    observer: IPerformanceObserver;
}
