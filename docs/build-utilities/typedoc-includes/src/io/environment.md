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