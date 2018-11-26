import { PerformanceTools } from "./PerformanceTools";
import { IEnabled } from "./interfaces";
import * as pkgUp from "pkg-up";
import { isArray } from "util";

//////////////////////////////////////////
/////////////// GLOBAL TYPING ////////////
//////////////////////////////////////////
const GLOBAL_SYMBOL = Symbol.for("org.zowe.PerfTimingClass");

declare module NodeJS {
    interface Global {
        [GLOBAL_SYMBOL]: Map<Symbol, PerformanceTools>;
    }
}

declare var global: NodeJS.Global;
//////////////////////////////////////////
/////////////// END TYPING ///////////////
//////////////////////////////////////////

/**
 * This class is a manager of all available performance tools
 */
export class PerfTimingClass implements IEnabled {
    // @TODO recommend wrapping stuff since we forward up requests through dummy object
    // to reduce overhead on getApi call
    public static readonly ENV_PREFIX = "PERF_TIMING";
    public readonly isEnabled: boolean;

    private _instanceSymbol: symbol; // used to uniquely identify the instance
    private readonly _isMainManager: boolean;

    private _managedApi: PerformanceTools;

    // Document
    constructor() {
        if (
            process.env[PerfTimingClass.ENV_PREFIX] &&
            process.env[PerfTimingClass.ENV_PREFIX].toUpperCase() === "ENABLED"
        ) {
            this.isEnabled = true;

            if (global[GLOBAL_SYMBOL]) {
                this._isMainManager = false;
            } else {
                this._isMainManager = true;

                // Create the global map on first run
                global[GLOBAL_SYMBOL] = new Map();

                process.on("exit", () => {
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

                    console.dir(outputMetrics, {
                        depth: 4,
                        colors: true
                    });
                    console.log(JSON.stringify(outputMetrics)); // @TODO ensure there are no running timers before we print metrics
                });
            }
        } else {
            this.isEnabled = false;
        }
    }

    // @TODO -> change to getter method
    public getApi(): PerformanceTools {
        if (this._managedApi == null) {
            // Defers the import until it is needed, will improve performance when
            // performance api hasn't yet been called.
            const PerfImport: typeof PerformanceTools = require("./PerformanceTools").PerformanceTools;
            this._managedApi = new PerfImport(this);


            // Create a unique entry in the global map
            if (this.isEnabled) {
                const pkg = require(pkgUp.sync());
                this._instanceSymbol = Symbol(`${pkg.name}@${pkg.version}`);
                global[GLOBAL_SYMBOL].set(this._instanceSymbol, this._managedApi);
            }
        }

        // Can guarentee that this will be unique per package instance :)
        return this._managedApi;
    }
}
