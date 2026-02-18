# Aggregation System API Reference

**Version:** 2.0.0  
**Issue:** #240  
**Last Updated:** 2025-09-06  

## Overview

This document provides complete API reference for the Smart Batch Processing Aggregation System. The API includes three main components:

- **SmartBatchAggregator**: Core batch processing engine
- **CronRecoveryDaemon**: Recovery and health monitoring daemon
- **BatchUtils**: Utility functions for batch operations

## SmartBatchAggregator API

### Constructor

```javascript
new SmartBatchAggregator(options)
```

Creates a new SmartBatchAggregator instance with intelligent batch processing capabilities.

**Parameters:**
- `options` (Object): Configuration options
  - `batchSize` (number, optional): Maximum batch size before flush. Default: `50`
  - `maxAge` (number, optional): Maximum batch age in ms before flush. Default: `30000`
  - `flushThreshold` (number, optional): Threshold percentage for early flush. Default: `0.9`
  - `dataPath` (string, optional): Data storage path. Default: `'.flowforge/aggregated'`
  - `atomicOperations` (boolean, optional): Use atomic file operations. Default: `true`
  - `performance` (Object, optional): Performance configuration
    - `targetTime` (number): Target processing time in ms. Default: `500`
    - `maxTime` (number): Maximum allowed processing time. Default: `1000`

**Throws:**
- `Error`: When configuration parameters are invalid

**Example:**
```javascript
const { SmartBatchAggregator } = require('./src/core/aggregation/SmartBatchAggregator.js');

const aggregator = new SmartBatchAggregator({
  batchSize: 50,
  maxAge: 30000,
  flushThreshold: 0.9,
  dataPath: '.flowforge/aggregated',
  atomicOperations: true,
  performance: {
    targetTime: 500,
    maxTime: 1000
  }
});
```

### Methods

#### add(entry)

Adds an entry to the current batch with automatic flush triggering.

**Parameters:**
- `entry` (Object): Entry to add
  - `userId` (string, required): User identifier
  - `action` (string, required): Action performed
  - `timestamp` (number, required): Unix timestamp
  - `metadata` (Object, optional): Additional metadata

**Returns:** `Promise<void>`

**Throws:**
- `Error`: When entry validation fails

**Example:**
```javascript
await aggregator.add({
  userId: 'user_123',
  action: 'code_edit',
  timestamp: Date.now(),
  metadata: {
    sessionId: 'session_456',
    taskId: 'task_789',
    file: 'app.js'
  }
});
```

#### flush()

Flushes the current batch to storage with retry logic.

**Returns:** `Promise<void>`

**Throws:**
- `Error`: When flush operation fails after all retries

**Example:**
```javascript
try {
  await aggregator.flush();
  console.log('Batch flushed successfully');
} catch (error) {
  console.error('Flush failed:', error.message);
}
```

#### forceFlush()

Forces an immediate flush of the current batch, bypassing normal triggers.

**Returns:** `Promise<void>`

**Example:**
```javascript
// Force flush during shutdown
await aggregator.forceFlush();
```

#### getCurrentBatchSize()

Gets the current batch size.

**Returns:** `number` - Number of entries in current batch

**Example:**
```javascript
const size = aggregator.getCurrentBatchSize();
console.log(`Current batch has ${size} entries`);
```

#### isEmpty()

Checks if the batch is empty.

**Returns:** `boolean` - True if batch is empty

**Example:**
```javascript
if (aggregator.isEmpty()) {
  console.log('No pending entries to flush');
}
```

#### getCurrentBatch()

Gets a copy of the current batch entries.

**Returns:** `Array` - Copy of current batch entries

**Example:**
```javascript
const batch = aggregator.getCurrentBatch();
console.log(`Processing ${batch.length} entries`);
```

#### getBatchAge()

Gets the age of the current batch in milliseconds.

**Returns:** `number` - Batch age in ms, or 0 if batch is empty

**Example:**
```javascript
const age = aggregator.getBatchAge();
if (age > 25000) {
  console.log('Batch will flush soon due to age');
}
```

#### getPerformanceMetrics()

Gets comprehensive performance metrics.

**Returns:** `Object` - Performance metrics
- `totalOperations` (number): Total flush operations performed
- `averageFlushTime` (number): Average flush time in ms
- `averageProcessingTime` (number): Alias for averageFlushTime
- `maxFlushTime` (number): Maximum flush time recorded
- `minFlushTime` (number): Minimum flush time recorded
- `successRate` (number): Success rate as decimal (0-1)
- `retryCount` (number): Total number of retries
- `failedFlushes` (number): Number of failed flush operations
- `totalErrors` (number): Alias for failedFlushes

**Example:**
```javascript
const metrics = aggregator.getPerformanceMetrics();
console.log(`Success rate: ${(metrics.successRate * 100).toFixed(2)}%`);
console.log(`Average flush time: ${metrics.averageFlushTime.toFixed(2)}ms`);
```

#### getStats()

Gets aggregation statistics summary.

**Returns:** `Object` - Aggregation statistics
- `processed` (number): Estimated entries processed
- `failed` (number): Number of failed operations
- `avgProcessingTime` (number): Average processing time
- `currentBatchSize` (number): Current batch size
- `batchAge` (number): Current batch age

**Example:**
```javascript
const stats = aggregator.getStats();
console.log(`Processed ${stats.processed} entries with ${stats.failed} failures`);
```

#### processBatch(batch)

Processes a batch for recovery operations (used by CronRecoveryDaemon).

**Parameters:**
- `batch` (Object): Batch to process
  - `entries` (Array): Array of entries to process
  - `batchId` (string, optional): Batch identifier
  - `version` (string, optional): Data format version

**Returns:** `Promise<Object>` - Processing result
- `success` (boolean): Whether processing succeeded
- `entriesProcessed` (number): Number of entries processed (if success)
- `error` (string): Error message (if failed)

**Example:**
```javascript
const result = await aggregator.processBatch({
  entries: [...],
  batchId: 'recovery_123',
  version: '2.0.0'
});

if (result.success) {
  console.log(`Recovered ${result.entriesProcessed} entries`);
} else {
  console.error(`Recovery failed: ${result.error}`);
}
```

#### shutdown()

Shuts down the aggregator gracefully, flushing any pending data.

**Returns:** `Promise<void>`

**Example:**
```javascript
// Graceful shutdown
await aggregator.shutdown();
console.log('Aggregator shut down successfully');
```

#### stop()

Alias for shutdown() method.

**Returns:** `Promise<void>`

## CronRecoveryDaemon API

### Constructor

```javascript
new CronRecoveryDaemon(config, aggregator)
```

Creates a new CronRecoveryDaemon instance for batch recovery and health monitoring.

**Parameters:**
- `config` (Object): Configuration options
  - `scheduleInterval` (number, optional): Recovery scan interval in ms. Default: `300000` (5 minutes)
  - `batchRetryLimit` (number, optional): Maximum retries per batch. Default: `5`
  - `healthCheckInterval` (number, optional): Health check interval in ms. Default: `60000` (1 minute)
  - `cleanupAge` (number, optional): Age for cleanup in ms. Default: `604800000` (7 days)
  - `dataPath` (string, optional): Base data path. Default: `'.flowforge/aggregated'`
  - `recoveryPath` (string, optional): Path for recovery files
  - `healthPath` (string, optional): Path for health status files
  - `logLevel` (string, optional): Logging level. Default: `'info'`
- `aggregator` (SmartBatchAggregator, optional): Aggregator instance for reprocessing

**Throws:**
- `Error`: When configuration parameters are invalid

**Example:**
```javascript
const { CronRecoveryDaemon } = require('./src/core/aggregation/CronRecoveryDaemon.js');

const daemon = new CronRecoveryDaemon({
  scheduleInterval: 300000,    // 5 minutes
  batchRetryLimit: 5,
  healthCheckInterval: 60000,  // 1 minute
  cleanupAge: 604800000,      // 7 days
  dataPath: '.flowforge/aggregated'
}, aggregator);
```

### Methods

#### initialize()

Initializes required directories for the daemon.

**Returns:** `Promise<void>`

**Example:**
```javascript
await daemon.initialize();
console.log('Daemon directories initialized');
```

#### start()

Starts the daemon with scheduled tasks.

**Returns:** `Promise<void>`

**Throws:**
- `Error`: When daemon is already running

**Example:**
```javascript
try {
  await daemon.start();
  console.log('Recovery daemon started');
} catch (error) {
  console.error('Failed to start daemon:', error.message);
}
```

#### stop()

Stops the daemon and all scheduled tasks.

**Returns:** `Promise<void>`

**Example:**
```javascript
await daemon.stop();
console.log('Recovery daemon stopped');
```

#### isRunning()

Checks if the daemon is currently running.

**Returns:** `boolean` - True if daemon is running

**Example:**
```javascript
if (daemon.isRunning()) {
  console.log('Daemon is active');
} else {
  console.log('Daemon is stopped');
}
```

#### scanForFailedBatches()

Scans for failed batches that need recovery.

**Returns:** `Promise<Array>` - Array of failed batch objects

**Example:**
```javascript
const failedBatches = await daemon.scanForFailedBatches();
console.log(`Found ${failedBatches.length} failed batches`);

// Each failed batch contains:
// {
//   batchId: string,
//   timestamp: number,
//   entries: Array,
//   retryCount: number,
//   lastError: string,
//   filePath: string
// }
```

#### reprocessFailedBatches(batches)

Reprocesses a collection of failed batches.

**Parameters:**
- `batches` (Array): Array of failed batches to reprocess

**Returns:** `Promise<Object>` - Processing results
- `processed` (number): Number of batches processed
- `succeeded` (number): Number of successful recoveries
- `failed` (number): Number of failed recoveries
- `abandoned` (number): Number of abandoned batches

**Example:**
```javascript
const failedBatches = await daemon.scanForFailedBatches();
const results = await daemon.reprocessFailedBatches(failedBatches);

console.log(`Processed: ${results.processed}, Success: ${results.succeeded}`);
```

#### reprocessBatch(batch)

Reprocesses a single failed batch.

**Parameters:**
- `batch` (Object): Failed batch to reprocess

**Returns:** `Promise<Object>` - Reprocessing result
- `success` (boolean): Whether reprocessing succeeded
- `abandoned` (boolean): Whether batch was abandoned
- `retryCount` (number): Current retry count
- `error` (string, optional): Error message if failed

**Example:**
```javascript
const result = await daemon.reprocessBatch(batch);
if (result.success) {
  console.log('Batch recovered successfully');
} else if (result.abandoned) {
  console.log('Batch abandoned after max retries');
} else {
  console.log(`Retry ${result.retryCount}: ${result.error}`);
}
```

#### prioritizeBatches(batches)

Prioritizes batches for processing based on age and retry count.

**Parameters:**
- `batches` (Array): Batches to prioritize

**Returns:** `Array` - Prioritized batches (oldest first, then by retry count)

**Example:**
```javascript
const batches = await daemon.scanForFailedBatches();
const prioritized = daemon.prioritizeBatches(batches);
console.log(`Processing ${prioritized.length} batches in priority order`);
```

#### performHealthCheck()

Performs a comprehensive health check on the daemon and aggregator.

**Returns:** `Promise<Object>` - Health status object
- `timestamp` (number): Check timestamp
- `status` (string): Health status ('healthy' or 'unhealthy')
- `severity` (string, optional): Issue severity ('critical')
- `issues` (Array): Array of detected issues
- `daemonHealth` (Object): Daemon-specific health metrics
- `aggregatorHealth` (Object): Aggregator health metrics
- `systemHealth` (Object): System resource metrics

**Example:**
```javascript
const health = await daemon.performHealthCheck();
console.log(`System status: ${health.status}`);

if (health.issues.length > 0) {
  console.log('Issues detected:');
  health.issues.forEach(issue => console.log(`- ${issue}`));
}
```

#### sendAlert(alert)

Sends an alert for critical issues.

**Parameters:**
- `alert` (Object): Alert details
  - `severity` (string): Alert severity
  - `message` (string): Alert message
  - `details` (Object): Additional alert details

**Returns:** `Promise<boolean>` - True if alert sent successfully

**Example:**
```javascript
await daemon.sendAlert({
  severity: 'critical',
  message: 'High failure rate detected',
  details: { failureRate: 0.15, threshold: 0.1 }
});
```

#### identifyFilesForCleanup()

Identifies files for cleanup based on age.

**Returns:** `Promise<Array>` - Array of file paths to clean up

**Example:**
```javascript
const filesToClean = await daemon.identifyFilesForCleanup();
console.log(`Found ${filesToClean.length} files for cleanup`);
```

#### performCleanup()

Performs cleanup of old files.

**Returns:** `Promise<Object>` - Cleanup results
- `filesRemoved` (number): Number of files removed
- `spaceFreed` (number): Bytes freed
- `errors` (number): Number of errors during cleanup

**Example:**
```javascript
const results = await daemon.performCleanup();
console.log(`Cleaned up ${results.filesRemoved} files, freed ${results.spaceFreed} bytes`);
```

#### getMetrics()

Gets current daemon metrics.

**Returns:** `Object` - Current metrics
- `isRunning` (boolean): Whether daemon is running
- `uptime` (number): Daemon uptime in ms
- `scheduledTasksExecuted` (number): Number of scheduled tasks executed
- `healthChecksPerformed` (number): Number of health checks performed
- `cleanupOperations` (number): Number of cleanup operations
- `recovery` (Object): Recovery-specific metrics

**Example:**
```javascript
const metrics = daemon.getMetrics();
console.log(`Uptime: ${Math.round(metrics.uptime / 1000)}s`);
console.log(`Health checks: ${metrics.healthChecksPerformed}`);
```

#### getRecoveryMetrics()

Gets recovery-specific metrics.

**Returns:** `Object` - Recovery metrics
- `totalRecoveryAttempts` (number): Total recovery attempts
- `successfulRecoveries` (number): Successful recoveries
- `failedRecoveries` (number): Failed recoveries
- `abandonedBatches` (number): Permanently failed batches
- `recoverySuccessRate` (number): Success rate as decimal
- `averageRecoveryTime` (number): Average recovery time in ms

**Example:**
```javascript
const metrics = daemon.getRecoveryMetrics();
console.log(`Recovery success rate: ${(metrics.recoverySuccessRate * 100).toFixed(2)}%`);
```

#### exportMetrics()

Exports metrics in standard format for monitoring systems.

**Returns:** `Object` - Exported metrics
- `timestamp` (number): Export timestamp
- `version` (string): System version
- `daemon` (Object): Daemon health metrics
- `recovery` (Object): Recovery metrics
- `health` (Object): Health status

**Example:**
```javascript
const exportedMetrics = daemon.exportMetrics();
console.log(JSON.stringify(exportedMetrics, null, 2));

// Send to monitoring system
await sendToPrometheus(exportedMetrics);
```

## BatchUtils API

### Functions

#### generateBatchFileName(prefix)

Generates a unique batch file name with timestamp and random suffix.

**Parameters:**
- `prefix` (string, optional): Optional prefix for the filename. Default: `'batch'`

**Returns:** `string` - Unique batch filename

**Example:**
```javascript
const { generateBatchFileName } = require('./src/core/aggregation/BatchUtils.js');

const fileName = generateBatchFileName('user_batch');
// Returns: 'user_batch_1704067200000_a3f8b2.json'
```

#### validateEntry(entry)

Validates a time entry data structure.

**Parameters:**
- `entry` (Object): Entry to validate
  - `userId` (string, required): User identifier
  - `action` (string, required): Action performed
  - `timestamp` (number, required): Unix timestamp
  - `metadata` (Object, optional): Additional metadata

**Returns:** `boolean` - True if entry is valid

**Throws:**
- `ValidationError`: When entry structure is invalid

**Example:**
```javascript
const { validateEntry } = require('./src/core/aggregation/BatchUtils.js');

try {
  const isValid = validateEntry({
    userId: 'user_123',
    action: 'code_edit',
    timestamp: Date.now(),
    metadata: { file: 'app.js' }
  });
  console.log('Entry is valid');
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

#### formatAggregationResult(data)

Formats aggregation result data for output.

**Parameters:**
- `data` (Object): Raw aggregation data
  - `entries` (Array): Array of time entries
  - `metadata` (Object): Aggregation metadata

**Returns:** `Object` - Formatted aggregation result
- `entries` (Array): Processed entries
- `metadata` (Object): Enhanced metadata with formatting info
- `summary` (Object): Summary statistics
  - `totalEntries` (number): Total number of entries
  - `uniqueUsers` (number): Number of unique users
  - `timeRange` (Object): Time range information
  - `actionCounts` (Object): Count of each action type

**Example:**
```javascript
const { formatAggregationResult } = require('./src/core/aggregation/BatchUtils.js');

const formatted = formatAggregationResult({
  entries: [...],
  metadata: { startTime: 1704067200000, endTime: 1704070800000 }
});

console.log(`Total entries: ${formatted.summary.totalEntries}`);
console.log(`Unique users: ${formatted.summary.uniqueUsers}`);
```

#### calculateBatchSize(entries)

Calculates optimal batch size based on entry characteristics.

**Parameters:**
- `entries` (Array): Array of entries to analyze

**Returns:** `number` - Recommended batch size (10-500 range)

**Example:**
```javascript
const { calculateBatchSize } = require('./src/core/aggregation/BatchUtils.js');

const optimalSize = calculateBatchSize(sampleEntries);
console.log(`Recommended batch size: ${optimalSize}`);
```

#### mergeBatches(batch1, batch2)

Merges two batches together, handling duplicates and ordering.

**Parameters:**
- `batch1` (Object): First batch
- `batch2` (Object): Second batch

**Returns:** `Object` - Merged batch
- `entries` (Array): Merged and deduplicated entries
- `metadata` (Object): Combined metadata

**Example:**
```javascript
const { mergeBatches } = require('./src/core/aggregation/BatchUtils.js');

const merged = mergeBatches(batch1, batch2);
console.log(`Merged ${merged.entries.length} unique entries`);
```

#### createPerformanceTimer(label)

Creates a high-resolution performance timer.

**Parameters:**
- `label` (string, optional): Timer label for identification. Default: `'timer'`

**Returns:** `Object` - Timer object
- `label` (string): Timer label
- `startTime` (bigint): High-resolution start time
- `startDate` (number): Start timestamp

**Example:**
```javascript
const { createPerformanceTimer, getElapsedTimeMs } = require('./src/core/aggregation/BatchUtils.js');

const timer = createPerformanceTimer('batch_processing');
// ... perform operations ...
const elapsed = getElapsedTimeMs(timer);
console.log(`Operation took ${elapsed.toFixed(2)}ms`);
```

#### getElapsedTimeMs(timer)

Gets elapsed time in milliseconds from a performance timer.

**Parameters:**
- `timer` (Object): Timer object created by createPerformanceTimer

**Returns:** `number` - Elapsed time in milliseconds

**Example:**
```javascript
const timer = createPerformanceTimer('operation');
await someAsyncOperation();
const elapsedMs = getElapsedTimeMs(timer);
console.log(`Async operation completed in ${elapsedMs.toFixed(2)}ms`);
```

#### calculatePercentile(values, percentile)

Calculates percentile value from an array of numbers.

**Parameters:**
- `values` (Array<number>): Array of numeric values
- `percentile` (number): Percentile to calculate (0-100)

**Returns:** `number` - Value at the specified percentile

**Throws:**
- `Error`: When percentile is not between 0 and 100

**Example:**
```javascript
const { calculatePercentile } = require('./src/core/aggregation/BatchUtils.js');

const responseTimes = [100, 150, 200, 250, 300, 400, 500];
const p95 = calculatePercentile(responseTimes, 95);
const p99 = calculatePercentile(responseTimes, 99);

console.log(`95th percentile: ${p95}ms`);
console.log(`99th percentile: ${p99}ms`);
```

### ValidationError Class

Custom error class for validation failures.

**Properties:**
- `name` (string): Always 'ValidationError'
- `message` (string): Error description

**Example:**
```javascript
const { ValidationError } = require('./src/core/aggregation/BatchUtils.js');

try {
  validateEntry(invalidEntry);
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation error:', error.message);
  }
}
```

## Provider Bridge Integration

The aggregation system integrates with the Provider Bridge through four main actions:

### aggregate

Triggers batch aggregation of time data.

**Command:**
```bash
node scripts/provider-bridge.js aggregate [options]
```

**Options:**
- `--force`: Force immediate flush of pending batches
- `--config`: Path to configuration file

**Example:**
```bash
# Trigger normal aggregation
node scripts/provider-bridge.js aggregate

# Force immediate flush
node scripts/provider-bridge.js aggregate --force
```

### aggregate-status

Gets aggregation status and metrics.

**Command:**
```bash
node scripts/provider-bridge.js aggregate-status [options]
```

**Options:**
- `--format=<format>`: Output format (json|text|markdown)
- `--detailed`: Include detailed metrics

**Returns:**
- Aggregator performance metrics
- Recovery daemon status
- Health check results
- System resource usage

**Example:**
```bash
# Get basic status
node scripts/provider-bridge.js aggregate-status

# Get detailed metrics in JSON format
node scripts/provider-bridge.js aggregate-status --format=json --detailed
```

### aggregate-force

Forces immediate flush of pending batches.

**Command:**
```bash
node scripts/provider-bridge.js aggregate-force
```

**Example:**
```bash
# Force flush all pending batches
node scripts/provider-bridge.js aggregate-force
```

### aggregate-recover

Manually triggers recovery of failed batches.

**Command:**
```bash
node scripts/provider-bridge.js aggregate-recover [options]
```

**Options:**
- `--batch-id=<id>`: Recover specific batch
- `--max-age=<ms>`: Maximum age of batches to recover

**Example:**
```bash
# Recover all failed batches
node scripts/provider-bridge.js aggregate-recover

# Recover specific batch
node scripts/provider-bridge.js aggregate-recover --batch-id=1704067200000_abc123
```

## Error Handling

### Common Error Codes

#### FLUSH_ERROR
**Description:** Batch flush operation failed  
**Causes:** File system issues, permission problems, disk space  
**Properties:**
- `code`: 'FLUSH_ERROR'
- `batchSize`: Number of entries in failed batch
- `retryable`: Boolean indicating if retry is possible
- `timestamp`: Error occurrence timestamp

#### VALIDATION_ERROR
**Description:** Entry validation failed  
**Causes:** Missing required fields, invalid data types  
**Properties:**
- `name`: 'ValidationError'
- `message`: Detailed validation error

#### DAEMON_ERROR
**Description:** Recovery daemon operation failed  
**Causes:** Configuration issues, file system problems  

### Error Recovery Strategies

#### Automatic Recovery
```javascript
try {
  await aggregator.add(entry);
} catch (error) {
  if (error.retryable) {
    // Will be picked up by recovery daemon
    console.log('Entry queued for recovery');
  } else {
    // Log and handle non-retryable errors
    console.error('Permanent failure:', error.message);
  }
}
```

#### Manual Recovery
```javascript
// Get failed batches
const failedBatches = await daemon.scanForFailedBatches();

// Filter by criteria
const recentFailures = failedBatches.filter(batch => 
  Date.now() - batch.timestamp < 3600000 // Last hour
);

// Reprocess specific batches
const results = await daemon.reprocessFailedBatches(recentFailures);
```

## Performance Monitoring

### Key Metrics to Track

#### Throughput Metrics
- Entries processed per second
- Batches flushed per minute
- Recovery operations per hour

#### Latency Metrics
- Average flush time
- P95/P99 processing times
- Recovery processing time

#### Error Metrics
- Flush failure rate
- Recovery success rate
- Abandoned batch count

#### System Metrics
- Memory usage
- Disk I/O
- File system usage

### Monitoring Integration

#### Prometheus Metrics
```javascript
// Export metrics for Prometheus
const metrics = aggregator.getPerformanceMetrics();
const daemonMetrics = daemon.getRecoveryMetrics();

// Custom metric export format
const prometheusMetrics = `
# HELP flowforge_aggregation_operations_total Total aggregation operations
# TYPE flowforge_aggregation_operations_total counter
flowforge_aggregation_operations_total ${metrics.totalOperations}

# HELP flowforge_aggregation_flush_time_seconds Batch flush time
# TYPE flowforge_aggregation_flush_time_seconds histogram
flowforge_aggregation_flush_time_seconds_bucket{le="0.5"} ${metrics.under500ms}
`;
```

#### Health Check Endpoint
```javascript
app.get('/health/aggregation', async (req, res) => {
  const health = await daemon.performHealthCheck();
  const status = health.status === 'healthy' ? 200 : 503;
  
  res.status(status).json({
    status: health.status,
    timestamp: health.timestamp,
    uptime: daemon.getMetrics().uptime,
    issues: health.issues
  });
});
```

---

**Last Updated:** 2025-09-06  
**Next Review:** 2025-10-06  
**Maintainer:** FlowForge Development Team