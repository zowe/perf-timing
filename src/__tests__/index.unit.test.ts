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

import { PerformanceApiManager } from "../performance/manager";
import { PerfTiming } from "../index";

describe("public exports", () => {
    it("should export a constructed api manager", () => {
        // Simply checks that we've exported the API manager object.
        expect(PerfTiming).toBeInstanceOf(PerformanceApiManager);
    });

    it("should have unchanged public exports", () => {
        expect(require("../index")).toMatchSnapshot();
    });
});
