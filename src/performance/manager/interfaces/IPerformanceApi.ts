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

import { INodeTiming, ISystemInformation, IMetrics } from "../../api/interfaces";

/**
 * This interface defines the methods that should exist on any {@link PerformanceApi}
 * class. Once initially published, changes to the prototype's of these methods
 * should not be changed so easily. Any changes to the public facing operation
 * of these methods will result in incompatibilities with previous versions that
 * might be loaded and called upon exit of the main program.
 *
 * @see {PerformanceApiManager#_savePerformanceResults}
 */
export interface IPerformanceApi {
    /**
     * Called on each {@link PerformanceApi} object found in the global symbol
     * location. This method should return a JSON object of the metrics that
     * the particular performance class captured.
     */
    getMetrics(): IMetrics;

    /**
     * This method must exist on the managedApi of the main {@link PerformanceApiManager}
     * management class. It must return the values specified in the {@link INodeTiming}
     * interface or throw an error if performance is not enabled.
     */
    getNodeTiming(): INodeTiming;

    /**
     * This method must exist on the managedApi of the main {@link PerformanceApiManager}
     * management class. It must return the values specified in the {@link ISystemInformation}
     * interface or throw an error if performance is not enabled.
     */
    getSysInfo(): ISystemInformation;
}
