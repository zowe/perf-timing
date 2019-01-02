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

<meta name="include" content="./environment.md"/>

<meta name="include" content="./index.PerfTiming.measure.md"/>

<meta name="include" content="./index.PerfTiming.timerify.md"/>