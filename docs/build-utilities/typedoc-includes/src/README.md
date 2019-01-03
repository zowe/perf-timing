# Performance Timing Utility

Use the performance timing utility to diagnose problem areas and bottlenecks in applications.

## Installing

You install the utility as a dependency using npm: `npm install @zowe/perf-timing --save`

## Overview

the perf-timing library provides functions that are called within a node application. The functions gather metrics on the run times of the application. The utility can capture the following metrics (this is not an exhaustive list):

- The length of time that an application spends requiring other modules before execution.
- The length of time that elapsed in a block of an application.
- The number of times a specific function was called, and the average time taken per call.
- The number of times a specific block was called, the total and average time elapsed in the block.

After the desired metric gathering calls are in place, you must enable the performance measurements.

By default, the utility does not capture metrics, which allows the application to run without the interference from the overhead of capturing performance metrics. To enable metric gathering, you define the value of the `PERF_TIMING_ENABLED` environmental variable to true. When the application is finished executing, the utility outputs metrics to a JSON file in the directory specified by the `PERF_TIMING_IO_SAVE_DIR` environmental variable. For more information about environmental variables, see the following topics.

<meta name="include" content="./environment.md"/>

<meta name="include" content="./index.PerfTiming.measure.md"/>

<meta name="include" content="./index.PerfTiming.timerify.md"/>