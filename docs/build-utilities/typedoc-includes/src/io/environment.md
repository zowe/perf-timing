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