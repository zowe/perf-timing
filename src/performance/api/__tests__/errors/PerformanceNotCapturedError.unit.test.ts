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

import { PerformanceApiError, PerformanceNotCapturedError } from "../../errors";

describe("PerformanceNotCapturedError", () => {
    it("should remain unchanged", () => {
        const error = new PerformanceNotCapturedError();

        expect(error).toBeInstanceOf(PerformanceApiError);
        expect(error).toMatchSnapshot();
    });
});
