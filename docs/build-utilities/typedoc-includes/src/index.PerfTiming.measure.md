### Measuring Code Execution Time
As you discover performance issues within in a node application, the next step is to identify where the performance issues are occurring. One way to identify for issues is to examine how much time elapsed for a given piece of code to execute. `@zowe/perf-timing` provides a means to measure the time it takes to execute a piece of code.

For example, you have an application that loops 10,000 times and increments a counter variable.

```TypeScript
let value = 0;
let i = 0;

for (i = 0; i <= 10000; i++){
    value++
}
```

`@zowe/perf-timing` provides APIs that can track the time taken to execute this list.

```TypeScript
import { PerfTiming } from "@zowe/perf-timing";

// Store the api in a variable for shorthand use
const api = PerfTiming.api;

// Marks point A
api.mark("A");

let value = 0;
let i = 0;

for (i = 0; i <= 10000; i++){
    value++
}

// Marks point B
api.mark("B");

/*
 * Creates a measurement of the time from A to B named "Point A to B". Note
 * that the string "Point A to B" can be measured infinitely. Every measurement
 * of the same name will maintain a reference of each call and a few overall
 * statistics.
 */
api.measure("Point A to B", "A", "B");
```

The time from `api.mark("A")` to `api.mark("B")` is saved when the application exits if `PERF_TIMING_ENABLED` is true.

- See {@link PerformanceApi.mark}
- See {@link PerformanceApi.measure}
