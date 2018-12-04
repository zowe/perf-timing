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


import { IMeasurement } from "./IMeasurement";

export interface IMeasurementMetric {
    averageDuration: number; // Average time of measurements
    calls: number; // Number of measurements with this name
    data: IMeasurement[]; // The raw measurement data
    name: string;
    totalDuration: number; // Total time of measurements in ms
}
