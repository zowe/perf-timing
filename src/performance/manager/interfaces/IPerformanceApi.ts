/**
 * This interface defines the methods that should exist on any {@link PerformanceApi}
 * class. Once initially published, changes to the prototype's of these methods
 * should not be changed so easily. Any changes to the public facing operation
 * of these methods will result in incompatibilities with previous versions that
 * might be loaded and called upon exit of the main program.
 * 
 * @see {PerfTimingClass#_savePerformanceResults}
 */
export interface IPerformanceApi {
    /**
     * Called on each {@link PerformanceTools} object found in the global symbol
     * location. This method should return a JSON object of the metrics that
     * the particular performance class captured.
     */
    getMetrics(): object;

    /**
     * This method must exist on the managedApi of the main {@link PerfTimingClass}
     * management class. It must return the values specified in the {@link INodeTiming}
     * interface.
     */
    getNodeTiming(): object;
}
