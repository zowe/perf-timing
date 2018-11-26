/**
 * This interface defines the properties that a {@link PerformanceApiManager}
 * must expose to its managed {@link PerformanceTools} instance. This interface
 * must be implemented by any manager object passed to the {@link PerformanceTools}
 * constructor of this package. By default, the {@link PerformanceApiManager}
 * will implement this interface.
 */
export interface IPerformanceApiManager {
    /**
     * Is the performance library enabled?
     */
    isEnabled: boolean;

    /**
     * This is the name and version of the package in the form of `name@version`
     */
    packageUUID: string;
}
