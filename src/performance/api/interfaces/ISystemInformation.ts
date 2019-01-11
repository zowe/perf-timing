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

/**
 * Network information gathered by node.
 */
interface ISystemNetwork {
    /**
     * The system hostname.
     */
    hostname: string;

    /**
     * Information about the network interfaces installed.
     *
     * @see {@link https://nodejs.org/api/os.html#os_os_networkinterfaces os.networkInterfaces()}
     */
    interfaces: ReturnType<typeof os.networkInterfaces>;
}

/**
 * Operating system memory information gathered by node.
 */
interface ISystemMemory {
    /**
     * The total bytes of free memory.
     */
    free: number;

    /**
     * The total bytes of installed memory.
     */
    total: number;

    /**
     * The total bytes of used memory.
     */
    usage: number;

    /**
     * The percentage of installed memory that is used.
     */
    usagePercentage: number;
}

/**
 * Information about the system and environment that can be retrieved by node.
 */
export interface ISystemInformation { // @TODO probably should encapsulate the type definitions from node
    /**
     * The arguments passed into the process.
     */
    argv: typeof process.argv;

    /**
     * Information about the cpu provided by node.
     *
     * @see {@link https://nodejs.org/api/os.html#os_os_cpus os.cpus()}
     */
    cpus: ReturnType<typeof os.cpus>;

    /**
     * The average load on the system. Only relevant on UNIX operating systems.
     *
     * @see {@link https://nodejs.org/api/os.html#os_os_loadavg os.loadavg()}
     */
    loadavg: ReturnType<typeof os.loadavg>;

    /**
     * System memory information.
     */
    memory: ISystemMemory;

    /**
     * System network information.
     */
    network: ISystemNetwork;

    /**
     * Operating system identifier.
     */
    os: string;

    /**
     * Operating system platform.
     *
     * @see {@link https://nodejs.org/api/os.html#os_os_platform os.platform()}
     */
    platform: string;

    /**
     * The current user shell. On windows this will always be null.
     *
     * @see {@link https://nodejs.org/api/os.html#os_os_userinfo_options os.userInfo()}
     */
    shell: any;

    /**
     * The system uptime.
     *
     * @see {@link https://nodejs.org/api/os.html#os_os_uptime os.uptime()}
     */
    uptime: number;
}
