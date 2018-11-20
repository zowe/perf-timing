import { PerformanceTools } from './PerformanceTools';

//////////////////////////////////////////
/////////////// GLOBAL TYPING ////////////
//////////////////////////////////////////
const GLOBAL_SYMBOL = Symbol.for("org.zowe.PerfTiming");

declare module NodeJS {
    interface Global {
        [GLOBAL_SYMBOL]: Map<Symbol, PerformanceTools>;
    }
}

declare var global: NodeJS.Global
//////////////////////////////////////////
/////////////// END TYPING ///////////////
//////////////////////////////////////////

/**
 * This class is a manager of all available performance tools
 */
export class PerfTimingClass { // @TODO implements and separate file
    // @TODO recommend wrapping stuff since we forward up requests through dummy object
    // to reduce overhead on getApi call
    public static readonly ENV_PREFIX = "PERF_TIMING";
    private static readonly INSTANCE_SYMBOL = Symbol("PerfTimingClass"); // used to uniquely identify the instance

    public readonly isPerfEnabled: boolean;
    private readonly _isMainManager: boolean;

    private _managedApi: PerformanceTools;

    constructor() {
        if (
            process.env[PerfTimingClass.ENV_PREFIX] &&
            process.env[PerfTimingClass.ENV_PREFIX].toUpperCase() === "ENABLE"
        ) {
            this.isPerfEnabled = true;

            if (global[GLOBAL_SYMBOL]) {
                this._isMainManager = false;
            } else {
                this._isMainManager = true;

                // Create the global map on first run
                global[GLOBAL_SYMBOL] = new Map();

                process.on("exit", () => {
                    const metrics = global[GLOBAL_SYMBOL].entries();

                    for(const [key, value] of metrics) {
                        console.log(key);
                        console.log(value.getMetrics());
                    }
                })
            }
        } else {
            this.isPerfEnabled = false;
        }
    }

    public getApi(): PerformanceTools {
        if (this._managedApi == null) {
            this._managedApi = new PerformanceTools(this);

            if (this.isPerfEnabled) {
                global[GLOBAL_SYMBOL].set(PerfTimingClass.INSTANCE_SYMBOL, this._managedApi);
            }
        }

        // Can guarentee that this will be unique per package instance :)
        return this._managedApi;
    }

    // public configure(name: string) {
    //     if (global[GLOBAL_SYMBOL].has(name)) {
    //         throw new Error ("CAN'T BE DUPLICATE, NEED ERROR CLASS");
    //     }
    // }

    //TODO EXPORT CLASS HERE SOMEHOW
}