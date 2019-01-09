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

import * as crypto from "crypto";

/**
 * Returns a random hex string.
 * @param length The length of the string.
 * 
 * @returns the random hex string.
 */
export function getRandomHexString(length: number) {
    return crypto.randomBytes(length * 2).toString("hex");
}