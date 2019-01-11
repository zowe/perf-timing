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
 * Gets a random integer between min and max (inclusive).
 * @param min The min integer to return (inclusive)
 * @param max The max integer to return (inclusive)
 *
 * @returns A random integer.
 */
export function randomInteger(min = 0, max = 1) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gets a random number between min and max (inclusive).
 * @param min The min number to return (inclusive)
 * @param max The max number to return (inclusive)
 *
 * @returns A random integer.
 */
export function randomNumber(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
}
