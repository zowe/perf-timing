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
 * This is the environmental prefix that will be added to any configuration
 * settings for performance.
 *
 * @external
 */
export const ENV_PREFIX = "PERF_TIMING";


/**
 * Symbol used to ensure uniqueness across all possible instances of this package.
 *
 * @internal
 */
export const GLOBAL_SYMBOL = Symbol.for("org.zowe.perf-timing");
