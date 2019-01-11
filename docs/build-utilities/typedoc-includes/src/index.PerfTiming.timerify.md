### Measuring Time Spent in a Specific Function

Another utility that the tool provides is a hook into a specific function call. The utility hooks into the function call by watching the function.

While a function is watched, each call will be monitored by node and saved when the application exits. The following metrics are gathered while a function is watched:

- The number of calls.
- The average elapsed time of each call.
- The total time spent in the function.
- An array of each call to the function. Each entry contains the following data:
  - Parameters
  - Operation start time
  - Total time taken

**Example:**

You have the following code in your application:

```TypeScript
const math = {
    double: (x: number) => 2 * x;
}

let i: number;

for(i = 0; i <= 1000; i++) {
    console.log(`${i} doubled is ${math.double(i)}`);
}
```

The `math.double` function can be watched by `@zowe/perf-timing`.

```TypeScript
import { PerfTiming } from "@zowe/perf-timing";

const math = {
    double: (x: number) => 2 * x;
}

// It's always better to check if performance is enabled before
// modifying function variables with watch.
if (PerfTiming.enabled) {
    // Anonymous functions should be given a name.
    // This can be done by naming the function or passing the name parm. Our arrow
    // function has already been named double by definition.
    math.double = PerfTiming.api.watch(math.double);
}

let i: number;

for(i = 0; i <= 1000; i++) {
    // Now every call to double will be tracked by the utility and metrics
    // will be saved on application exit.
    console.log(`${i} doubled is ${math.double(i)}`);
}
```

You can combine this technique with the point to point measurements for a complete picture of an application execution.

- See {@link PerformanceApi.watch}
- See {@link PerformanceApi.unwatch}