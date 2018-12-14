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

import { IMetric } from "./IMetric";
import { PerformanceEntry } from "perf_hooks";
import { IMeasurement } from "./IMeasurement";

/**
 * Performance metrics captured by an instance of {@link PerformanceApi}.
 */
export interface IMetrics {
    /**
     * A collection of all function metrics generated from all watched functions.
     *
     * @see {@link PerformanceApi.watch}
     */
    functions: Array<IMetric<PerformanceEntry>>;

    /**
     * A collection of all measurement metrics gathered.
     *
     * @see {@link PerformanceApi.measure}
     */
    measurements: Array<IMetric<IMeasurement>>;
}
