import { IMeasurement } from "./IMeasurement";
import { IPerformanceObserver } from "./IPerformanceObserver";

export interface IMeasureTimer {
    isConnected: boolean;
    measurements: IMeasurement[];
    observer: IPerformanceObserver;
}
