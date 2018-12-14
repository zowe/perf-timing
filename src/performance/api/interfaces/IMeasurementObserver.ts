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
import { IMeasurementEntry } from "./IMeasurementEntry";

/**
 * Properties of a named measurement observer that was created with the
 * {@link PerformanceApi.measure} function.
 *
 * @internal
 */
export interface IMeasurementObserver extends ICollectionObserver<IMeasurementEntry>{}
