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
import { PerformanceApiManager } from "./performance/manager";

/**
 * An instance of a {@link PerformanceApiManager}. Public functionality is exported
 * under this name.
 */
export const PerfTiming = new PerformanceApiManager(); // tslint:disable-line:variable-name
