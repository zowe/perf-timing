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

import { IPerformanceApi } from "./IPerformanceApi";

 /**
  * All performance metrics collected during a single application run.
  */
export interface IPerformanceMetrics {
    /**
     * Metrics captured from all available instances during a run. The keys in
     * this object represent the package uuid of the manager responsible for
     * a performance api.
     */
    metrics: {[key: string]: Array<ReturnType<IPerformanceApi["getMetrics"]>>};

    /**
     * The node timing information provided by the main manager.
     */
    nodeTiming: ReturnType<IPerformanceApi["getNodeTiming"]>;

    /**
     * The system information.
     */
    systemInformation: ReturnType<IPerformanceApi["getSysInfo"]>;
}
