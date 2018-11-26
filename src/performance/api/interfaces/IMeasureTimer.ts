import { PerformanceObserver } from "perf_hooks";
import { IMeasurement } from "./IMeasurement";

export interface IMeasureTimer {
    isConnected: boolean;
    measurements: IMeasurement[];
    observer: PerformanceObserver;
}
