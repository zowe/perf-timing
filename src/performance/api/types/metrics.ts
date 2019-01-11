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

import { IMeasurementEntry, IMetric, IPerformanceEntry } from "../interfaces";

/**
 * Data collected for all functions that were monitored with the
 * {@link PerformanceApi.watch} function.
 */
export type FunctionMetric = IMetric<IPerformanceEntry>;

/**
 * Data collected for all measurements taken through the
 * {@link PerformanceApi.measure} function.
 */
export type MeasurementMetric = IMetric<IMeasurementEntry>;
