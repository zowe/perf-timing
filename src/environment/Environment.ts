class EnvironmentManager {
    private _environment: {[key: string]: string} = {};

    // Register a KeyValue pair in the environment for later retrieval.
    public register(key: string, defaultValue: string): EnvironmentManager {
        if (this._environment[key] != null) {
            const error: typeof import("./errors").DuplicateVarError = require("./errors").DuplicateVarError;
            throw new error(key, this._environment[key], defaultValue);
        }

        this._environment[key] = defaultValue;

        return this; // returned for chaining
    }

    // Key must be a value within the environment
    // @TODO lint error when jsdoc comment is missing
    public getValue(key: string): string {
        if (typeof this._environment[key] === "undefined") {
            const error: typeof import("./errors").NotRegisteredError = require("./errors").NotRegisteredError;
            throw new error(key);
        }

        // Return the environment var or the default registered
        return process.env[key] || this._environment[key];
    }

    public getNumber(key: string): number {
        let value = +this.getValue(key);

        if (isNaN(value)) {
            value = +this._environment[key];
        }

        return value;
    }
}

export const Environment = new EnvironmentManager(); // tslint:disable-line:variable-name
