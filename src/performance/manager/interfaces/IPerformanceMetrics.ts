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
    metrics: {[key: string]: Array<ReturnType<IPerformanceApi["getMetrics"]>>};
    nodeTiming: ReturnType<IPerformanceApi["getNodeTiming"]>;
    systemInformation: ReturnType<IPerformanceApi["getSysInfo"]>;
}
