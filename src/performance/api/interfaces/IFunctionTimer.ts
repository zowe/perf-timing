import { IPerformanceObserver } from "./IPerformanceObserver";

export interface IFunctionTimer {
    observer: IPerformanceObserver;
    originalFunction: (...args: any[]) => any;
    totalCalls: number;
    totalDuration: number;
}
