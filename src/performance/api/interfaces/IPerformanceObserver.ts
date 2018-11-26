/**
 * This interface is a wrapper around the NodeJS PerformanceObserver class.
 *
 * @see https://nodejs.org/dist/latest-v10.x/docs/api/perf_hooks.html#perf_hooks_class_performanceobserver
 */
export interface IPerformanceObserver {
    disconnect(): void;
    observe(options: { buffered?: boolean, entryTypes: string[] }): void;
}
