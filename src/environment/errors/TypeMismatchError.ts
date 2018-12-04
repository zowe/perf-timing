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
  * This error represents the condition when a getter function of the {@link Environment},
  * like {@link EnvironmentManager.getNumber}, is called and the type of the default didn't match
  * the method return value.
  *
  * @example
  * Environment.register("TEST", "string");
  * Environment.getNumber("TEST"); // Throws TypeMismatchError
  */
export class TypeMismatchError extends Error {
    /**
     * Construct the error.
     * @param key The key in error.
     * @param expectedType The expected type. Usually determined the type of call expected (getNumber, getString, etc).
     * @param actualType The actual type. Usually determined by the `typeof` the registered default.
     */
    constructor(public key: string, public expectedType: string, public actualType: string) {
        super(`Expected "${key}" to be of type "${expectedType}", instead it was "${actualType}"`);
    }
}
