/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/
import { PerformanceApiManager } from "./performance/manager/PerformanceApiManager";

// @TODO edit the doc
/**
 * An instance of a {@link PerformanceApiManager}. This object is the only thing
 * intended to be directly imported by any dependents of this package.
 *
 * @example
 * import { PerfTiming } from "@zowe/perf-timing";
 *
 * if (PerfTiming.isEnabled) {
 *   // Do stuff with PerfTiming
 *   PerfTiming.getApi().mark("start");
 *   PerfTiming.getApi().mark("end");
 *   PerfTiming.getApi().measure("beginning to end", "start", "end");
 * }
 */
export const PerfTiming = new PerformanceApiManager(); // tslint:disable-line:variable-name
