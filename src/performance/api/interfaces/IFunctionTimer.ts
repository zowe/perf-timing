import { PerformanceObserver } from "perf_hooks";

export interface IFunctionTimer {
    observer: PerformanceObserver;
    originalFunction: (...args: any[]) => any;
    totalCalls: number;
    totalDuration: number;
}
