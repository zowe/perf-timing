import { IEnabled, IPerformanceApi } from "../manager/interfaces";
import { PerformanceApi } from "../api/PerformanceApi";
import * as pkgUp from "pkg-up";
import { isArray } from "util";

//////////////////////////////////////////
/////////////// GLOBAL TYPING ////////////
//////////////////////////////////////////
const GLOBAL_SYMBOL = Symbol.for("org.zowe.PerfTimingClass");

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
 * @see {@link PerfTimingClass#_savePerformanceResults}
 */
declare namespace NodeJS {
    interface Global {
        [GLOBAL_SYMBOL]: Map<symbol, IPerformanceApi>;
    }
}

declare var global: NodeJS.Global;
// tslint:enable

//////////////////////////////////////////
/////////////// END TYPING ///////////////
//////////////////////////////////////////

/**
 * This class is a manager of all available performance tools
 */
export class PerfTimingClass implements IEnabled {
    // @TODO recommend wrapping stuff since we forward up requests through dummy object
    // to reduce overhead on getApi call
    public static readonly ENV_ENABLED_KEY = "ENABLED";
    public static readonly ENV_PREFIX = "PERF_TIMING";
    public readonly isEnabled: boolean;

    private _instanceSymbol: symbol; // used to uniquely identify the instance

    private _managedApi: PerformanceApi;

    // Document
    constructor() {
        // First check if the environment prefx is set to the ENV_ENABLED_KEY value
        if (
            process.env[PerfTimingClass.ENV_PREFIX] &&
            process.env[PerfTimingClass.ENV_PREFIX].toUpperCase() === PerfTimingClass.ENV_ENABLED_KEY
        ) {
            // The environment was set so performance metrics are enabled.
            this.isEnabled = true;

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
                const pkg = require(pkgUp.sync());
                this._instanceSymbol = Symbol(`${pkg.name}@${pkg.version}`);

                // Save the managedApi in the global space. It has been typed so that
                // changes to the wrapper methods of IPerformanceTools cannot be easily
                // changed.
                global[GLOBAL_SYMBOL].set(this._instanceSymbol, this._managedApi);
            }
        }

        // Can guarentee that this will be unique per package instance :)
        return this._managedApi;
    }

    private _savePerformanceResults(): void {
        const metrics = global[GLOBAL_SYMBOL].entries();
        const outputMetrics: any = {}; // @TODO proper typing

        // Get timing first to not skew the results
        outputMetrics.nodeTiming = this.getApi().getNodeTiming();

        for(const [key, value] of metrics) {
            const symbolValue = key.toString();

            // Place into an array to handle the case where the same
            // package might have existed twice.

            if (!isArray(outputMetrics[symbolValue])) {
                outputMetrics[symbolValue] = [];
            }

            outputMetrics[symbolValue].push(value.getMetrics());
        }

        // @TODO save to file
        console.dir(outputMetrics, {
            depth: 4,
            colors: true
        });
        console.log(JSON.stringify(outputMetrics)); // @TODO ensure there are no running timers before we print metrics
    }
}
