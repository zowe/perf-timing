export interface IMeasurmentMetric {
    name: string;
    calls: number; // Number of measurements with this name
    totalDuration: number; // Total time of measurements in ms
    averageDuration: number; // Average time of measurements
    data: IMeasurment[]; // The raw measurement data
}