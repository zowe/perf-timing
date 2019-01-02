<!-- 
 DO NOT MODIFY!
 Generated from C:\Users\WRICH04\Documents\GitHub\perf-timing\docs\build-utilities\typedoc-includes\src\README.md
-->
# Performance Timing Utility

The performance timing utility can be used to diagnose problem areas and bottlenecks in applications.

## Installing

Install as a dependency via npm: `npm install @zowe/perf-timing --save`

## Overview

This library provides functions that are called within a node application. These functions gather metrics on the run times of the application. Some of the metrics that can be captured are:

- How long an application spends requiring other modules before execution.
- How much time elapsed in a block of an application.
- How many times a specific function was called and the average time taken per call.
- How many times a specific block was called as well as the total and average time elapsed in the block.

Once the desired metric gathering calls are in place, performance measurements will need to be enabled.

By default, the utility will not capture metrics, allowing the application to run normally without the performance overhead of capturing performance metrics. To enable metric gathering, the environmental variable, `PERF_TIMING_ENABLED`, must be set to true. When the application is finished executing, metrics will be output in a JSON file in the directory specified by the `PERF_TIMING_IO_SAVE_DIR` environmental variable. For more information on all the environmental variables, see the section below.

### Environmental Variables

The `zowe/@perf-timing` library is controlled by the following environmental variables.

**NOTE:** All environmental variables are prefixed with `PERF_TIMING`.

#### Performance Variables

The following environmental variables affect the operation of the library.

| Variable Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `PERF_TIMING_ENABLED` | BOOLEAN | "" | Setting this variable to `TRUE` will enable the performance metric gathering. Any value besides `TRUE` will leave performance monitoring disabled. For implications of this, please see the various method documentation in the {@link PerformanceApi} class |


#### IO Variables

The following environmental variables affect the io operations of the library.

| Variable Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `PERF_TIMING_IO_MAX_HISTORY` | INTEGER | 5 | Changes how many historical data logs are kept by the library. When a new log is created, it is created as metrics.1.json. Existing log numbers are incremented by one and the last one is deleted when needed. |
| `PERF_TIMING_IO_SAVE_DIR` | STRING | ~/.perf-timing | Changes where the metric logs are saved. If the directory doesn't exist, it is created. |

**EXAMPLE:** Keep the last 10 metric runs in a specified directory.

**Linux:**

```sh
PERF_TIMING_ENABLED=TRUE PERF_TIMING_IO_MAX_HISTORY=10 PERF_TIMING_IO_SAVE_DIR=/path/to/save/location node /path/to/your/app.js
```

**Windows:**

```bat
setlocal
    set PERF_TIMING_ENABLED=TRUE
    set PERF_TIMING_IO_MAX_HISTORY=10
    set PERF_TIMING_IO_SAVE_DIR=C:\path\to\save\location
    call node C:\path\to\your\app.js
endlocal
```


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

Now the time from `A` to `B` will be saved upon exit of the application.

- See {@link PerformanceApi.mark}
- See {@link PerformanceApi.measure}


### Measuring Time Spent in a Specific Function

Another utility that the tool provides is a hook into a specific function call. This is done by watching the function.

While a function is watched, each call will be monitored by node and saved when the application exits. The following metrics are gathered while a function is watched:

- The number of calls.
- The average elapsed time of each call.
- The total time spent in the function.
- An array of each call to the function. Each entry contains the following
  - Parameters
  - Operation start time
  - Total time taken

**Example:**

Say that you have this code in your application:

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

This technique can also be combined with the point to point measurements for a complete picture of an application execution.

- See {@link PerformanceApi.watch}
- See {@link PerformanceApi.unwatch}