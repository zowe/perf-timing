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

import { Environment } from "../Environment";
import { DuplicateVarError, NotRegisteredError, TypeMismatchError } from "../errors";

describe("Environment", () => {
    beforeEach(() => {
        // Resets the environment variable before each test
        (Environment as any)._registered = {};
    });

    it("should register default values", () => {
        const testString = "ABCDE";
        const testNumber = 5;

        Environment
            .register("test_string", testString)
            .register("test_number", testNumber);

        expect((Environment as any)._registered.test_string).toBe(testString);
        expect((Environment as any)._registered.test_number).toBe(testNumber);
    });

    it("should get values out of the environment", () => {
        // tslint:disable:no-magic-numbers

        // Register environment
        Environment
            .register("NUMBER1", 59)
            .register("NUMBER2", 0)
            .register("NUMBER3", 1)
            .register("STRING1", "30")
            .register("STRING2", "Murray")
            .register("STRING3", "");

        // Add variables to the environment
        process.env.NUMBER1 = "58";
        process.env.NUMBER2 = "71";
        process.env.NUMBER3 = "0";
        process.env.STRING1 = "Sidney Crosby";
        process.env.STRING2 = "87";
        process.env.STRING3 = "";

        // Run tests
        expect(Environment.getValue("NUMBER1")).toBe("58");
        expect(Environment.getNumber("NUMBER1")).toBe(58);

        expect(Environment.getValue("NUMBER2")).toBe("71");
        expect(Environment.getNumber("NUMBER2")).toBe(71);

        expect(Environment.getValue("NUMBER3")).toBe("0");
        expect(Environment.getNumber("NUMBER3")).toBe(0);

        expect(Environment.getValue("STRING1")).toBe("Sidney Crosby");
        expect(Environment.getString("STRING1")).toBe("Sidney Crosby");

        expect(Environment.getValue("STRING2")).toBe("87");
        expect(Environment.getString("STRING2")).toBe("87");

        expect(Environment.getValue("STRING3")).toBe("");
        expect(Environment.getString("STRING3")).toBe("");

        // Clean up after our test
        delete process.env.NUMBER1;
        delete process.env.NUMBER2;
        delete process.env.NUMBER3;
        delete process.env.STRING1;
        delete process.env.STRING2;
        delete process.env.STRING3;
        // tslint:enable:no-magic-numbers
    });

    describe("defaults", () => {
        const registerObject = (obj: { [key: string]: any }) => {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    Environment.register(key, obj[key]);
                }
            }
        };

        it("should retrieve string value defaults", () => {
            const testObject = {
                KEY1: "",
                KEY2: "15",
                KEY3: "The quick brown fox jumped over the lazy dog"
            };

            registerObject(testObject);

            expect(Environment.getString("KEY1")).toBe(testObject.KEY1);
            expect(Environment.getString("KEY2")).toBe(testObject.KEY2);
            expect(Environment.getString("KEY3")).toBe(testObject.KEY3);
        });

        it("should retrieve number value defaults", () => {
            const testObject = {
                KEY1: 0,
                KEY2: 1,
                KEY3: 200
            };

            registerObject(testObject);

            expect(Environment.getNumber("KEY1")).toBe(testObject.KEY1);
            expect(Environment.getNumber("KEY2")).toBe(testObject.KEY2);
            expect(Environment.getNumber("KEY3")).toBe(testObject.KEY3);
        });

        it("should return the default number value if the environment evaluates to NaN", () => {
            // tslint:disable:no-magic-numbers
            Environment.register("NOT_A_NUMBER", 15);

            process.env.NOT_A_NUMBER = "hello world";

            expect(Environment.getValue("NOT_A_NUMBER")).toBe("hello world");
            expect(Environment.getNumber("NOT_A_NUMBER")).toBe(15);

            delete process.env.NOT_A_NUMBER;

            // tslint:enable:no-magic-numbers
        });
    });

    describe("errors", () => {
        it("should fail to register an environmental variable twice", () => {
            const val1 = "VAL1";
            const val2 = "VAL2";
            const key = "TEST_KEY";

            expect(() => {
                Environment
                    .register(key, val1)
                    .register(key, val2);
            }).toThrowError(DuplicateVarError);

            expect((Environment as any)._registered[key]).toBe(val1);
        });

        it("should fail retrieving variables that aren't registered", () => {
            expect(() => {
                Environment.getValue("NOT_REGISTERED_1");
            }).toThrowError(NotRegisteredError);

            expect(() => {
                Environment.getNumber("NOT_REGISTERED_2");
            }).toThrowError(NotRegisteredError);

            expect(() => {
                Environment.getString("NOT_REGISTERED_3");
            }).toThrowError(NotRegisteredError);
        });

        describe("type mismatches", () => {
            const key = "TEST_INVALID_TYPE";

            it("should reject accessing strings as a different type", () => {
                Environment.register(key, "String Type");
                expect(() => Environment.getNumber(key)).toThrowError(TypeMismatchError);
            });

            it("should reject accessing numbers as a different type", () => {
                Environment.register(key, 0);
                expect(() => Environment.getString(key)).toThrowError(TypeMismatchError);
            });
        });
    });
});
