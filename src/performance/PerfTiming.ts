import { PerfTimingClass } from "./manager/PerfTimingClass";

/**
 * An instance of a {@link PerfTimingClass}. This object is the only thing
 * intended to be directly imported by any dependents of this package.
 *
 * @example <caption>Usage</caption>
 * ```typescript
 * import { PerfTiming } from "@zowe/perf-timing";
 *
 * if (PerfTiming.isEnabled) {
 *   // Do stuff with PerfTiming
 *   PerfTiming.getApi().mark("start");
 *   PerfTiming.getApi().mark("end");
 *   PerfTiming.getApi().measure("beginning to end", "start", "end");
 * }
 * ```
 */
export const PerfTiming = new PerfTimingClass(); // tslint:disable-line:variable-name
