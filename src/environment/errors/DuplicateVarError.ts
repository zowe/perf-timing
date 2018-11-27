export class DuplicateVarError extends Error {
    constructor(name: string, value: any, newValue: any) {
        super(`"${name}" was previously registered with ${value.toString()}. Unable to re-register it with ${newValue.toString()}`);
    }
}
