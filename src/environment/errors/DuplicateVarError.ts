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
 * This error represents the condition where an environment variable was
 * registered twice, indicating a conflict.
 *
 * @example
 * ```typescript
 * Environment.register("key1", "val");
 * Environment.register("key2", "val2"); // Throws error
 * ```
 */
export class DuplicateVarError extends Error {
    /**
     * Construct the error.
     * @param key The environment key in conflict
     * @param value The current default value that was set
     * @param newValue The new default value
     */
    constructor(key: string, value: any, newValue: any) {
        super(`"${key}" was previously registered with ${value.toString()}. Unable to re-register it with ${newValue.toString()}`);
    }
}
