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

/**
 * Represents the valid types that may be registered in the environment.
 *
 * @internal
 */
type ValidDefaults = string | number;

/**
 * A string mapping to the valid defaults types.
 *
 * @internal
 */
type ValidDefaultsStrings = "string" | "number";

/**
 * A function that will be used to validate the environmental variable. Only
 * intended to be used by the {@link EnvironmentManager} class.
 *
 * @param key The environment key to check.
 *
 * @throws {@link TypeMismatchError} when validation fails.
 *
 * @internal
 */
type ValidationFunction = (key: string) => void;

/**
 * Manages environmental variables needed by the application. It should be noted
 * that while this class is not exported, a singleton object is exported via
 * {@link Environment}.
 *
 * @internal
 */
class EnvironmentManager {
    /**
     * Internal object that stores default environment values as a key in
     * the underlying object. Environmental variables must be registered
     * in this object before retrieval.
     */
    private _registered: {[key: string]: ValidDefaults} = {};

    /**
     * Gets the numeric value of an environmental variable.
     *
     * @param key The environment key to retrieve.
     *
     * @returns The numeric value of the environment variable.
     *
     * @throws {@link NotRegisteredError} when `key` was not registered using {@link register}.
     * @throws {@link TypeMismatchError} when `key` was not registered as a number.
     *
     * @see {@link getValue}
     *
     * @example
     * Environment.register("SOME_KEY", 5);
     *
     * // Logs the numeric value of process.env["SOME_KEY"] if it is set and is a number.
     * // otherwise the number 5 will be logged.
     * console.log(Environment.getNumber("SOME_KEY"));
     */
    public getNumber(key: string): number {
        let value = +this.getValue(key, (inputKey: string) => {
            this._validateRegistered(inputKey, "number");
        });

        if (isNaN(value)) {
            value = this._registered[key] as number;
        }


        return value;
    }

    /**
     * Gets the string value of an environmental variable.
     *
     * @param key The environment key to retrieve.
     *
     * @returns The string value of the environment variable.
     *
     * @throws {@link NotRegisteredError} when `key` was not registered using {@link register}.
     * @throws {@link TypeMismatchError} when `key` was not registered as a string.
     *
     * @see {@link getValue}
     *
     * @example
     * Environment.register("SOME_KEY", "THIS IS A TEST");
     *
     * // Logs the numeric value of process.env["SOME_KEY"] if it is set.
     * // otherwise "THIS IS A TEST" will be logged.
     * console.log(Environment.getNumber("SOME_KEY"));
     */
    public getString(key: string): string {
        return this.getValue(key, (inputKey: string) => {
            this._validateRegistered(inputKey, "string");
        });
    }

    /**
     * Gets the string value of an environment variable.
     *
     * When called, this method will search for `key` in the environment. If
     * a value was found, it will be returned from `process.env[key]`. When no
     * value was found for `key`, the value that was specified in the second
     * paramter of {@link register} will be returned.
     *
     * An environment variable must be first registered through the {@link register}
     * method. Any attempts to access a non-registered variable will lead to a
     * {@link NotRegisteredError}.
     *
     * @param key The environment key to retrieve.
     * @param validationFunction The validation scheme to use.
     *
     * @returns The string value of the environment variable.
     *
     * @throws {@link NotRegisteredError} when `key` was not registered using {@link register}.
     *
     * @example
     * Environment.register("SOME_KEY", "TEST");
     *
     * // Logs the value of process.env["SOME_KEY"] if it exists
     * // Logs "TEST" otherwise.
     * console.log(Environment.getValue("SOME_KEY"));
     */
    public getValue(
        key: string,
        validationFunction: ValidationFunction = this._validateRegistered.bind(this)
    ): any {
        validationFunction(key);

        // Return the environment var or the default registered
        return process.env[key] || this._registered[key];
    }

    /**
     * Registers an environmental variable to the application.
     *
     * Prior to any `getValue` method calls, an environmental must be registered
     * to the application with a default value. The default value will ensure
     * that type checking happens on the typed methods and that a valid value
     * is always returned by those methods in the absence of the environment key.
     *
     *
     * @param key The key to register.
     * @param defaultValue The default value that is returned when not present in the environment.
     *
     * @returns A reference to the class for method chaining.
     *
     * @throws {@link DuplicateVarError} when `key` was already registered in the application.
     *
     * @example
     * Environment
     *   .register("A", 5)
     *   .register("B", "Hello")
     *   .register("C", "World")
     *
     * // The environmental variables process.env.A, process.env.B, process.env.C
     * // are now registered in the application with defaults of 5, "Hello" and "World"
     * // respectively.
     */
    public register(key: string, defaultValue: ValidDefaults): EnvironmentManager {
        if (this._registered[key] != null) {
            const error: typeof import("./errors").DuplicateVarError = require("./errors").DuplicateVarError;
            throw new error(key, this._registered[key], defaultValue);
        }

        this._registered[key] = defaultValue;

        return this; // returned for chaining
    }

    /**
     * Validates that an environment key is registered and optionally is a
     * certain type.
     * @param key The key to validate internally.
     * @param typeMatch A string to do a `typeof` compare.
     */
    private _validateRegistered(key: string, typeMatch?: ValidDefaultsStrings) {
        if (typeof this._registered[key] === "undefined") {
            const error: typeof import("./errors").NotRegisteredError = require("./errors").NotRegisteredError;
            throw new error(key);
        }

        if (typeMatch && typeof this._registered[key] !== typeMatch) {
            const error: typeof import("./errors").TypeMismatchError = require("./errors").TypeMismatchError;
            throw new error(key, typeMatch, typeof this._registered[key]);
        }
    }
}
/**
 * Exported singleton of the {@link EnvironmentManager}.
 *
 * @internal
 */
export const Environment = new EnvironmentManager(); // tslint:disable-line:variable-name
