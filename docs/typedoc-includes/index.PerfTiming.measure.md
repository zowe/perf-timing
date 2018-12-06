### Measuring Code Execution Time
As performance issues arise in a node application, the next step is to find out where the performance issues are happening. One way to look for issues is to see how long a given piece of code takes to execute. `@zowe/perf-timing` provides a means to measure the time it takes to execute a piece of code.

As an example, say that you have an application that loops 10000 times and increments a counter variable.

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
const api = PerfTiming.getApi();

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

Now the time from `A` to `B` will be saved upon exit of the application.

- See {@link PerformanceApi.mark}
- See {@link PerformanceApi.measure}
