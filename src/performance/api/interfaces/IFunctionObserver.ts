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

import { ICollectionObserver } from "./ICollectionObserver";
import { IPerformanceEntry } from "./IPerformanceEntry";

/**
 * Properties of a named function observer that was created with the
 * {@link PerformanceApi.watch} function.
 *
 * @internal
 */
export interface IFunctionObserver extends ICollectionObserver<IPerformanceEntry> {
    /**
     * The original function that was watched. Used by {@link PerformanceApi.unwatch}
     * to reinstate the original function when requested.
     */
    originalFunction: (...args: any[]) => any;
}
