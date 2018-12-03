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

/**
 * This error represents the condition when an environment variable was requested
 * without first being registered.
 *
 * @example
 * Environment.register("var1", "test");
 *
 * Environment.get("var1"); // returns the env setting or default
 * Environment.get("var2"); // throws error
 */
export class NotRegisteredError extends Error {
    /**
     * Construct the error.
     * @param key The environment key that has not been registered.
     */
    constructor(public key: string) {
        super(`The environment variable "${key}" has not been registered! It must be registered before the value can be retrieved.`);
    }
}
