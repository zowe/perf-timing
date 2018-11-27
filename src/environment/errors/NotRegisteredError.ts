export class NotRegisteredError extends Error {
    constructor(name: string) {
        super(`The environment variable "${name}" has not been registered! It must be registered before the value can be retrieved.`);
    }
}
