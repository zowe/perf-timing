export interface IMeasureTimer {
    observer: perfHooks.PerformanceObserver;
    isConnected: boolean;
    measurements: IMeasurment[];
}