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
 * This interface defines the properties that a {@link PerformanceApiManager}
 * must expose to its managed {@link PerformanceApi} instance. This interface
 * must be implemented by any manager object passed to the {@link PerformanceApi}
 * constructor of this package. By default, the {@link PerformanceApiManager}
 * will implement this interface.
 */
export interface IPerformanceApiManager {
    /**
     * Is the performance library enabled?
     */
    isEnabled: boolean;

    /**
     * This is the name and version of the package in the form of `name@version`
     */
    packageUUID: string;
}
