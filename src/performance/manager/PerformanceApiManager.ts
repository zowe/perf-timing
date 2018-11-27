import { IPerformanceApi, IPerformanceApiManager } from "./interfaces";
import { PerformanceApi } from "../api/PerformanceApi";
import * as pkgUp from "pkg-up";
import { isArray } from "util";
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
 * @see {@link PerformanceApiManager#_savePerformanceResults}
 */
declare namespace NodeJS {
    interface Global {
        [GLOBAL_SYMBOL]: Map<symbol, IPerformanceApi>;
    }
}

declare var global: NodeJS.Global;
// tslint:enable

/////////////////////////////// ///////////
/////////////// END TYPING ///////////////
//////////////////////////////////////////

/**
 * This class is a manager of all available performance tools
 */
export class PerformanceApiManager implements IPerformanceApiManager {
    // @TODO recommend wrapping stuff since we forward up requests through dummy object
    // @TODO to reduce overhead on getApi call
    public static readonly ENV_ENABLED = `${ENV_PREFIX}_ENABLED`;
    public static readonly ENV_ENABLED_KEY = "TRUE";
    public readonly isEnabled: boolean;
    public readonly packageUUID: string;

    private _instanceSymbol: symbol; // used to uniquely identify the instance

    private _managedApi: PerformanceApi;

    // @TODO Document
    constructor() {
        // First check if the environment prefix is set to the ENV_ENABLED_KEY value
        if (Environment.getValue(PerformanceApiManager.ENV_ENABLED).toUpperCase() === PerformanceApiManager.ENV_ENABLED_KEY) {
            // The environment was set so performance metrics are enabled.
            this.isEnabled = true;

            // Generate the packageUUID
            const pkg = require(pkgUp.sync());
            this.packageUUID = `${pkg.name}@${pkg.version}`;

            // Check if the global scope has been created. If it hasn't been created
            // this is the first manager called so it will become the main manager.
            if (!global[GLOBAL_SYMBOL]) {
                // Create the global map on first run
                global[GLOBAL_SYMBOL] = new Map();
                process.on("exit", () => this._savePerformanceResults());
            }
        } else {
            // Performance was not enabled.
            this.isEnabled = false;
        }
    }

    public getApi(): PerformanceApi {
        if (this._managedApi == null) {
            // Defers the import until it is needed, will improve performance when
            // performance api hasn't yet been called.
            const performanceApi: typeof PerformanceApi = require("../api/PerformanceApi").PerformanceApi;
            this._managedApi = new performanceApi(this);


            // Create a unique entry in the global map
            if (this.isEnabled) {
                this._instanceSymbol = Symbol(this.packageUUID);

                // Save the managedApi in the global space. It has been typed so that
                // changes to the wrapper methods of IPerformanceTools cannot be easily
                // changed.
                global[GLOBAL_SYMBOL].set(this._instanceSymbol, this._managedApi);
            }
        }

        // Can guarantee that this will be unique per package instance :)
        return this._managedApi;
    }

    private async _savePerformanceResults(): Promise<void> {
        const metrics = global[GLOBAL_SYMBOL].entries();
        const outputMetrics: any = {}; // @TODO proper typing

        // Get timing first to not skew the results
        outputMetrics.nodeTiming = this.getApi().getNodeTiming();

        for (const [key, value] of metrics) {
            const symbolValue = key.toString();

            // Place into an array to handle the case where the same
            // package might have existed twice.

            if (!isArray(outputMetrics[symbolValue])) {
                outputMetrics[symbolValue] = [];
            }

            outputMetrics[symbolValue].push(value.getMetrics());
        }

        console.dir(outputMetrics, {
            depth: 4,
            colors: true
        });

        // Require the IO utility at this point to reduce total number of
        // requires in the calling library when performance monitoring
        // is not enabled.
        (await import("../../io/saveMetrics")).saveMetrics(outputMetrics);

        // @TODO ensure there are no running timers before we print metrics
    }
}

// Register the PERF_TIMING_ENABLED variable
Environment.register(PerformanceApiManager.ENV_ENABLED, "");
