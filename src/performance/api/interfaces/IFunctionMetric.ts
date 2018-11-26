export interface IFunctionMetric {
    name: string;
    calls: number;
    totalDuration: number; // Both in ms
    averageDuration: number;
}
