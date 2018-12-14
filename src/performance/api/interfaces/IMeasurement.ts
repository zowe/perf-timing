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
 * A representation of a single measurement from Point A to Point B.
 *
 * A measurement object is created by a call to {@link PerformanceApi.measure} and
 * all measurements of the same name are aggregated into a single {@link MeasurementMetric}.
 */
export interface IMeasurement {
    /**
     * The time taken (in milliseconds) to get from the starting mark to the
     * ending mark.
     */
    duration: number;

    /**
     * The name of the end mark that was captured.
     */
    endMarkName: string;

    /**
     * The name of the measurement.
     */
    name: string;

    /**
     * The name of the starting mark that was captured.
     */
    startMarkName: string;

    /**
     * The time at which the starting mark was captured.
     */
    startTime: number;
}
