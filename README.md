<!-- 
 DO NOT MODIFY!
 Generated from /home/jenkins/workspace/we_CLI_-_Performance_master-XVR5DYY5FP3JVHYJIK5P7I4QGOKGZXWQFW7Z2O3UDAQCJCMKMKDQ/docs/build-utilities/typedoc-includes/src/README.md
-->
# Performance Timing Utility

Use the performance timing utility to diagnose problem areas and bottlenecks in applications.

## Installing

You install the utility as a dependency using npm: `npm install @zowe/perf-timing --save`

## Overview

The perf-timing library provides functions that are called within a node application. The functions gather metrics on the run times of the application. The utility can capture the following metrics (this is not an exhaustive list):

- The length of time that an application spends requiring other modules before execution.
- The length of time that elapsed in a block of an application.
- The number of times a specific function was called, and the average time taken per call.
- The number of times a specific block was called, the total and average time elapsed in the block.

After the desired metric gathering calls are in place, you must enable the performance measurements.

By default, the utility does not capture metrics, which allows the application to run without the interference from the overhead of capturing performance metrics. To enable metric gathering, you define the value of the `PERF_TIMING_ENABLED` environmental variable to true. When the application is finished executing, the utility outputs metrics to a JSON file in the directory specified by the `PERF_TIMING_IO_SAVE_DIR` environmental variable. For more information about environmental variables, see the following topics.

### Environmental Variables

The `zowe/@perf-timing` library is controlled by the following environmental variables:

**Note:** All environmental variables are prefixed with `PERF_TIMING`.

#### Performance Variables

The following environmental variables affect the operation of the library:

| Variable Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `PERF_TIMING_ENABLED` | BOOLEAN | "" | Set the value of the variable to `TRUE` to enable the performance metric gathering. Any value other than `TRUE` disables performance monitoring. For implications of this, see the various method documentation in the {@link PerformanceApi} class. |


#### IO Variables

The following environmental variables affect the io operations of the library:

| Variable Name | Type | Default Value | Description |
|---------------|------|---------------|-------------|
| `PERF_TIMING_IO_MAX_HISTORY` | INTEGER | 5 | Defines how many historical data log files that the library retains. When the library creates a log file, it is named metrics.1.json. Existing log numbers are incremented by one and the last log file is deleted as needed. |
| `PERF_TIMING_IO_SAVE_DIR` | STRING | ~/.perf-timing | Defines where to save the metric log files. If the directory does not exist, the library creates the directory. |

**Example:** Retain the last 10 metric runs in a specified directory.

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
