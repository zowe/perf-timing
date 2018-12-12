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

import * as os from "os";

interface ISystemNetwork {
    hostname: string;
    interfaces: ReturnType<typeof os.networkInterfaces>;
}

interface ISystemMemory {
    free: number;
    total: number;
    usage: number;
    usagePercentage: number;
}

export interface ISystemInformation {
    argv: typeof process.argv;
    cpus: ReturnType<typeof os.cpus>;
    loadavg: ReturnType<typeof os.loadavg>;
    memory: ISystemMemory;
    network: ISystemNetwork;
    os: string;
    platform: string;
    shell: any;
    uptime: number;
}
