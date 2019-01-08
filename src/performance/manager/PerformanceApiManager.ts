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

 // @TODO a new manager should be created for each different package that could be created
 // @TODO this is hard because every time we would have to look up the tree on getApi which
 // @TODO is probably really slow. Need to figure out a good way to do this kind of lookup.

// These imports have been carefully crafted to represent the libraries needed
// when performance is disabled for performance reasons. Any additional runtime
// objects needed when performance is enabled should be done dynamically.
import { IPerformanceApi, IPerformanceApiManager, IPerformanceMetrics } from "./interfaces";
import { PerformanceApi } from "../api/PerformanceApi";
import * as pkgUp from "pkg-up";
import { ENV_PREFIX, GLOBAL_SYMBOL } from "../../constants";
import { Environment } from "../../environment";

//////////////////////////////////////////
/////////////// GLOBAL TYPING ////////////
//////////////////////////////////////////
// tslint:disable:no-namespace interface-name
// We need to add stuff to the global scope so that one package can manage
// all possible loaded packages. To do this, we need to disable a few rules.

/**
 * Because of how package dependencies work, there could be multiple instances
 * of this package within an application. To avoid each of these packages having
 * a process.exit hook, we add all of them to the global scope under a unique
 * symbol. The first instance created will be the manager of all of these global
 * packages. This allows for a single `process.on('exit')` hook to be registered.
 *
 * @internal
 *
 * @see {@link PerformanceApiManager._savePerformanceResults}
 */
declare namespace NodeJS {
    /**
     * The global node interface.
     */
    interface Global {
        /**
         * A single global symbol is used to track all instances of an {@link IPerformanceApi}
         * in a map. The key is a symbol defined by each manager and the value is the managed
         * api. When gathering metrics during `process.on('exit')`, each of these apis {@link IPerformanceApi.getMetrics}
         * method will be called and will produce a new entry in the {@link IPerformanceMetrics.metrics}
         * object.
         */
        [GLOBAL_SYMBOL]: Map<symbol, IPerformanceApi>;
    }
}

/**
 * Definition of the global typings needed for this class.
 *
 * @internal
 */
declare var global: NodeJS.Global;

/**
 * Exported so tests can make use of the global type defined here.
 *
 * @internal
 */
export type _GlobalType = typeof global;
// tslint:enable

//////////////////////////////////////////
/////////////// END TYPING ///////////////
//////////////////////////////////////////

/**
 * The manager responsible for the {@link PerformanceApi} created by the current package instance.
 *
 * **NOTE:**
 *
 * This class is not intended to be instantiated directly. It should be accessed
 * through the {@link PerfTiming} variable instantiated by this package. Failure
 * to do so will result in lost metrics in the final file output.
 */
export class PerformanceApiManager implements IPerformanceApiManager {
    /**
     * The environment variable that will be checked to determine if performance
     * is enabled.
     */
    public static readonly ENV_ENABLED = `${ENV_PREFIX}_ENABLED`;

    /**
     * The value that the environment variable must be in order for performance
     * gathering to be enabled.
     */
    public static readonly ENV_ENABLED_KEY = "TRUE";

    /**
     * A boolean set by the {@link constructor} indicating if performance is enabled.
     */
    public readonly isEnabled: boolean;

    /**
     * The unique identifier of this current package instance. This will be the
     * `name@version` of the closest package.json relative to the location of the
     * first file that imported this package.
     */
    public readonly packageUUID: string;

    /**
     * A reference to the performance api that is managed by this specific manager.
     */
    private _api: PerformanceApi;

    /**
     * A symbol to uniquely identify the {@link _api} in the {@link NodeJS.Global}
     * symbol.
     *
     * @internal
     */
    private _instanceSymbol: symbol;

    /**
     * The constructor will instantiate this manager and determine if performance monitoring is
     * enabled.
     *
     * If the monitoring is enabled, it will also calculate the name of the global symbol. Also, if
     * the global symbol has not been instantiated, this manager will be the default one and will
     * be the one responsible for saving all data to the files.
     *
     */
    constructor() {
        // First check if the environment prefix is set to the ENV_ENABLED_KEY value
        if (Environment.getValue(PerformanceApiManager.ENV_ENABLED).toUpperCase() === PerformanceApiManager.ENV_ENABLED_KEY) {
            // The environment was set so performance metrics are enabled.
            this.isEnabled = true;

            // Generate the packageUUID
            const pkg = require(pkgUp.sync() || pkgUp.sync(__dirname));
            this.packageUUID = `${pkg.name}@${pkg.version}`;

            // Check if the global scope has been created. If it hasn't been created
            // this is the first manager called so it will become the main manager.
            if (!global[GLOBAL_SYMBOL]) {
                // Create the global map on first run
                global[GLOBAL_SYMBOL] = new Map();
                process.on("exit", () => this._savePerformanceResults()); // @TODO log any errors that might have been thrown
            }
        } else {
            // Performance was not enabled.
            this.isEnabled = false;
        }
    }

    /**
     * Gets the {@link _api}.
     *
     * **NOTE:**
     *
     * It is recommended that calls to the getApi method are contained within an if check to see
     * if performance is enabled. This method will provide the least overhead for when performance
     * is disabled but will add a some overhead when performance is enabled.
     *
     * **NOTE:**
     *
     * If performance is not enabled, this method will still return a {@link PerformanceApi}
     * object and all methods can still be called the same way with performance enabled or disabled.
     * With this in mind, it is not required that calls to this method are wrapped in a check to see
     * if this is enabled, but it is still recommended.
     *
     * @returns The performance api that is managed by this class.
     */
    public get api(): PerformanceApi {
        if (this._api == null) {
            // Defers the import until it is needed, will improve performance when
            // performance api hasn't yet been called.
            const performanceApi: typeof PerformanceApi = require("../api/PerformanceApi").PerformanceApi;
            this._api = new performanceApi(this);


            // Create a unique entry in the global map
            if (this.isEnabled) {
                this._instanceSymbol = Symbol(this.packageUUID);

                // Save the managedApi in the global space. It has been typed so that
                // changes to the wrapper methods of IPerformanceTools cannot be easily
                // changed.
                global[GLOBAL_SYMBOL].set(this._instanceSymbol, this._api);
            }
        }

        // Can guarantee that this will be unique per package instance :)
        return this._api;
    }

    /**
     * Responsible for gathering and saving all metrics present within the
     * environment.
     *
     * This method is only called by `process.on('exit')` defined in the {@link constructor} of the
     * main manager. The nodeTiming and systemInformation portions of the {@link IPerformanceMetrics}
     * object are gathered from the {@link _api} of this manager.
     *
     * Metrics are gathered by examining each API present in the {@link NodeJS.global} object. This
     * design comes from the fact that there could be multiple instances of the PerfTiming package
     * due to how npm dependencies work. So the main manager can find out about all possible metrics
     * and output them in a single file as opposed to each manager creating it's own file. It is
     * because of this fact that the methods in {@link IPerformanceApi} must not change too often for
     * compatibility reasons.
     *
     * @returns a promise of completion.
     *
     * @internal
     */
    private async _savePerformanceResults(): Promise<void> {
        // Get timing first to not skew the results
        const outputMetrics: IPerformanceMetrics = {
            nodeTiming: this.api.getNodeTiming(),
            systemInformation: this.api.getSysInfo(),
            metrics: {}
        };

        const metrics = global[GLOBAL_SYMBOL].entries();

        for (const [key, value] of metrics) {
            const symbolValue = key.toString();

            // Place into an array to handle the case where the same
            // package might have existed twice.
            if (outputMetrics.metrics[symbolValue] == null) {
                outputMetrics.metrics[symbolValue] = [];
            }

            outputMetrics.metrics[symbolValue].push(value.getMetrics());
        }

        // Require the IO utility at this point to reduce total number of
        // requires in the calling library when performance monitoring
        // is not enabled.
        (await import("../../io")).saveMetrics(outputMetrics);
    }
}

// Register the PERF_TIMING_ENABLED variable
Environment.register(PerformanceApiManager.ENV_ENABLED, "");
