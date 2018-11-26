export interface IFunctionTimer {
    observer: perfHooks.PerformanceObserver;
    originalFunction: (...args: any[]) => any;
    totalDuration: number;
    totalCalls: number;
}
