import { IFunctionMetric } from "./IFunctionMetric";
import { IMeasurementMetric } from "./IMeasurementMetric";

export interface IMetrics {
    functions: IFunctionMetric[];
    measurements: IMeasurementMetric[];
}
