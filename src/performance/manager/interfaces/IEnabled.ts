/**
 * This interface defines a property that should track if the performance
 * library is enabled. This interface must be implemented by any manager object
 * passed to the {@link PerformanceTools} constructor of this package. By default,
 * the {@link PerfTimingClass} will implement this interface, because it is the
 * intended manager of the singleton PerformanceTools instance of this package.
 */
export interface IEnabled {
    /**
     * Is the performance library enabled?
     */
    isEnabled: boolean;
}
