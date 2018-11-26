import { IMeasurement } from "./IMeasurement";

export interface IMeasurementMetric {
    averageDuration: number; // Average time of measurements
    calls: number; // Number of measurements with this name
    data: IMeasurement[]; // The raw measurement data
    name: string;
    totalDuration: number; // Total time of measurements in ms
}
