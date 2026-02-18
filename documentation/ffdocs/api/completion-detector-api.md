# Completion Detector API Reference

## Overview

The Enhanced Task Completion Detector provides a comprehensive API for programmatic task completion detection, monitoring, and aggregation. This document covers all classes, methods, parameters, and usage patterns.

## Core Classes

### EnhancedTaskCompletionDetector

Main detector class that orchestrates multiple detection strategies.

#### Constructor

```javascript
new EnhancedTaskCompletionDetector(options)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.dataPath` | `string` | `'.flowforge'` | Path to FlowForge data directory |
| `options.checkInterval` | `number` | `30000` | Monitoring interval in milliseconds |
| `options.confidenceThreshold` | `number` | `0.7` | Minimum confidence for completion (0-1) |
| `options.maxRetries` | `number` | `3` | Maximum retry attempts for failed detections |
| `options.enableAggregation` | `boolean` | `true` | Enable SmartBatchAggregator integration |

**Throws:**
- `Error` - When invalid options are provided

**Example:**
```javascript
const detector = new EnhancedTaskCompletionDetector({
  dataPath: '.flowforge',
  checkInterval: 30000,
  confidenceThreshold: 0.8,
  maxRetries: 5,
  enableAggregation: true
});
```

#### Methods

##### checkCompletion(taskId)

Checks if a task is completed using all available detection methods.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | `string` | Yes | The task ID to check for completion |

**Returns:** `Promise<DetectionResult>`

**DetectionResult Object:**
```javascript
{
  completed: boolean,           // Whether task is completed
  confidence: number,          // Confidence score (0-1)
  detectionMethods: string[],  // Methods that detected completion
  metadata: object,           // Additional detection metadata
  errors: string[],           // Any errors encountered
  warnings: string[],         // Any warnings
  retryAttempts: number,      // Number of retry attempts made
  detectionTime: number,      // Detection time in milliseconds
  timestamp: string           // ISO timestamp of detection
}
```

**Example:**
```javascript
const result = await detector.checkCompletion('task-123');

if (result.completed && result.confidence > 0.8) {
  console.log('Task completed with high confidence');
  console.log(`Detection methods: ${result.detectionMethods.join(', ')}`);
  console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
}

// Handle errors
if (result.errors.length > 0) {
  console.error('Detection errors:', result.errors);
}
```

##### startMonitoring(taskId, onCompletion, options)

Starts continuous monitoring of a task for completion.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | `string` | Yes | The task ID to monitor |
| `onCompletion` | `function` | Yes | Callback function called when task completes |
| `options.timeout` | `number` | No | Maximum monitoring time in ms (default: 3600000) |

**onCompletion Callback:**
```javascript
function onCompletion(result: DetectionResult) {
  // Handle completion event
}
```

**Returns:** `void`

**Example:**
```javascript
detector.startMonitoring('task-123', (result) => {
  if (result.completed) {
    console.log(`Task completed with ${result.confidence} confidence`);
    // Trigger next workflow step
    triggerNextTask();
  } else if (result.error) {
    console.error('Monitoring failed:', result.error);
  }
}, {
  timeout: 7200000 // 2 hours
});
```

##### stop()

Stops monitoring and flushes all aggregators.

**Returns:** `Promise<void>`

**Example:**
```javascript
// Graceful shutdown
await detector.stop();
console.log('Detection monitoring stopped');
```

##### stopSync()

Stops monitoring synchronously (for compatibility).

**Returns:** `void`

**Example:**
```javascript
// Quick stop without waiting for aggregator flush
detector.stopSync();
```

##### getStatus()

Gets current monitoring and system status.

**Returns:** `StatusObject`

**StatusObject:**
```javascript
{
  isMonitoring: boolean,           // Currently monitoring a task
  checkInterval: number,          // Current check interval
  confidenceThreshold: number,    // Current confidence threshold
  detectorsAvailable: number,     // Number of available detectors
  aggregatorEnabled: boolean,     // Whether aggregation is enabled
  completionAggregatorEnabled: boolean  // Whether CompletionAggregator is enabled
}
```

**Example:**
```javascript
const status = detector.getStatus();
console.log(`Monitoring: ${status.isMonitoring}`);
console.log(`Detectors available: ${status.detectorsAvailable}`);
console.log(`Aggregation enabled: ${status.aggregatorEnabled}`);
```

##### manualCheck(taskId)

Manually triggers a detection check (alias for checkCompletion).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | `string` | Yes | Task ID to check |

**Returns:** `Promise<DetectionResult>`

**Example:**
```javascript
// Force immediate check
const result = await detector.manualCheck('task-456');
```

## Individual Detector Classes

### GitCommitDetector

Analyzes git commits for completion signals.

#### Constructor

```javascript
new GitCommitDetector(options)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.dataPath` | `string` | `'.flowforge'` | Path to git repository |
| `options.lookbackHours` | `number` | `24` | Hours to look back for commits |
| `options.customPatterns` | `RegExp[]` | `[]` | Custom completion patterns |

#### Methods

##### detect(taskId)

Detects completion based on git commit analysis.

**Returns:** `Promise<DetectorResult>`

**DetectorResult:**
```javascript
{
  detected: boolean,           // Whether completion was detected
  confidence: number,         // Confidence score (0-1)
  metadata: {
    commitCount: number,      // Number of relevant commits
    lastCommit: object,       // Last commit information
    patterns: string[],       // Matched patterns
    timespan: number         // Time span of commits
  }
}
```

### ProviderStatusDetector

Checks external provider systems for task status.

#### Constructor

```javascript
new ProviderStatusDetector(options)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.providers` | `object` | `{}` | Provider configuration |
| `options.timeout` | `number` | `5000` | Request timeout in milliseconds |
| `options.retryCount` | `number` | `2` | Number of retry attempts |

**Provider Configuration:**
```javascript
{
  github: {
    enabled: true,
    token: 'ghp_...',        // GitHub token
    owner: 'username',       // Repository owner
    repo: 'repository',      // Repository name
    confidence: 0.9          // Confidence weight
  },
  notion: {
    enabled: true,
    token: 'secret_...',     // Notion integration token
    database: 'db_id',       // Database ID
    confidence: 0.8
  }
}
```

### FileChangeDetector

Analyzes file system changes for completion patterns.

#### Constructor

```javascript
new FileChangeDetector(options)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.watchPaths` | `string[]` | `['src/', 'test/']` | Paths to monitor |
| `options.ignorePatterns` | `string[]` | `['node_modules/']` | Patterns to ignore |
| `options.significanceThreshold` | `number` | `3` | Minimum files changed |

### TimeThresholdDetector

Uses time-based heuristics for completion detection.

#### Constructor

```javascript
new TimeThresholdDetector(options)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.inactivityThreshold` | `number` | `7200000` | Inactivity period (ms) |
| `options.workdayStart` | `string` | `'09:00'` | Work day start time |
| `options.workdayEnd` | `string` | `'18:00'` | Work day end time |
| `options.minimumWorkDuration` | `number` | `1800000` | Minimum work duration (ms) |

## Utility Classes

### CompletionAuditLogger

Handles audit logging for compliance and debugging.

#### Constructor

```javascript
new CompletionAuditLogger(dataPath)
```

#### Methods

##### log(event)

Logs a detection event.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event` | `object` | Yes | Event object to log |

**Event Object:**
```javascript
{
  taskId: string,
  completed: boolean,
  confidence: number,
  detectionMethods: string[],
  metadata: object,
  errors: string[],
  warnings: string[],
  timestamp: string
}
```

**Returns:** `Promise<void>`

##### getStatistics()

Gets detection statistics.

**Returns:** `Promise<StatisticsObject>`

**StatisticsObject:**
```javascript
{
  totalDetections: number,      // Total detection attempts
  successfulDetections: number, // Successful completions detected
  successRate: number,         // Success rate (0-1)
  averageConfidence: number,   // Average confidence score
  mostUsedMethod: string,      // Most frequently used detection method
  methodCounts: object         // Count by detection method
}
```

##### getRecentLogs(count)

Gets recent detection log entries.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | `number` | `10` | Number of recent logs to return |

**Returns:** `Promise<LogEntry[]>`

### PrivacyFilter

Filters sensitive data from detection metadata.

#### Constructor

```javascript
new PrivacyFilter(options)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.allowedFields` | `string[]` | See default list | Allowed metadata fields |
| `options.sensitivePatterns` | `RegExp[]` | See default patterns | Patterns to filter |

#### Methods

##### filter(data)

Filters sensitive data from an object.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | `object` | Yes | Data object to filter |

**Returns:** `object` - Filtered data object

**Example:**
```javascript
const filter = new PrivacyFilter();
const filteredData = filter.filter({
  taskId: 'task-123',
  password: 'secret123',  // Will be filtered out
  apiKey: 'key_abc',      // Will be filtered out
  timestamp: '2025-01-15T10:30:00Z'  // Will be preserved
});
```

### CompletionAggregator

Aggregates completion data for team reporting.

#### Constructor

```javascript
new CompletionAggregator(options)
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.dataPath` | `string` | `'.flowforge'` | Data directory path |
| `options.enablePrivacy` | `boolean` | `true` | Enable privacy filtering |
| `options.batchSize` | `number` | `10` | Batch size for aggregation |
| `options.flushInterval` | `number` | `60000` | Auto-flush interval (ms) |

#### Methods

##### aggregateCompletion(completion)

Aggregates a completion event.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `completion` | `object` | Yes | Completion event data |

**Completion Object:**
```javascript
{
  taskId: string,
  completed: boolean,
  confidence: number,
  detectionMethods: string[],
  metadata: object,
  timestamp: string
}
```

**Returns:** `Promise<void>`

##### triggerAggregation()

Manually triggers aggregation flush.

**Returns:** `Promise<void>`

##### updateTeamSummary(summary)

Updates team-level summary data.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `summary` | `object` | Yes | Team summary data |

**Returns:** `Promise<void>`

## CLI Interface

### detect-completion Script

Command-line interface for manual detection operations.

**Usage:**
```bash
node scripts/detect-completion.js <task-id> [options]
```

**Options:**

| Option | Short | Description |
|--------|-------|-------------|
| `--help` | `-h` | Show help message |
| `--monitor` | `-m` | Monitor task until completion |
| `--json` | `-j` | Output results in JSON format |
| `--verbose` | `-v` | Show detailed information |
| `--stats` | `-s` | Show detection statistics |
| `--aggregate` | `-a` | Trigger completion data aggregation |
| `--team-summary` | `-t` | Update team summary |
| `--data-path <path>` | | Path to FlowForge data directory |

**Examples:**
```bash
# Check single task
detect-completion 123

# Monitor task with JSON output
detect-completion 123 --monitor --json

# Check task and trigger aggregation
detect-completion 123 --aggregate --team-summary

# Show statistics
detect-completion --stats
```

**Exit Codes:**
- `0` - Task is completed
- `1` - Task is not completed  
- `2` - Error occurred

## Error Handling

### Common Error Types

#### DetectionError

Thrown when detection process fails.

```javascript
class DetectionError extends Error {
  constructor(message, detector, taskId, originalError) {
    super(message);
    this.name = 'DetectionError';
    this.detector = detector;
    this.taskId = taskId;
    this.originalError = originalError;
  }
}
```

#### ConfigurationError

Thrown when configuration is invalid.

```javascript
class ConfigurationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ConfigurationError';
    this.field = field;
    this.value = value;
  }
}
```

#### ProviderError

Thrown when provider integration fails.

```javascript
class ProviderError extends Error {
  constructor(message, provider, statusCode, response) {
    super(message);
    this.name = 'ProviderError';
    this.provider = provider;
    this.statusCode = statusCode;
    this.response = response;
  }
}
```

### Error Handling Best Practices

```javascript
try {
  const result = await detector.checkCompletion('task-123');
  
  // Handle warnings
  if (result.warnings.length > 0) {
    console.warn('Detection warnings:', result.warnings);
  }
  
  // Handle errors in result
  if (result.errors.length > 0) {
    console.error('Detection errors:', result.errors);
  }
  
  // Process successful result
  if (result.completed) {
    handleTaskCompletion(result);
  }
  
} catch (error) {
  if (error instanceof DetectionError) {
    console.error(`Detection failed for ${error.taskId}:`, error.message);
    // Retry with different detector or manual fallback
  } else if (error instanceof ConfigurationError) {
    console.error(`Configuration issue with ${error.field}:`, error.message);
    // Fix configuration and retry
  } else if (error instanceof ProviderError) {
    console.error(`Provider ${error.provider} failed:`, error.message);
    // Try alternative provider or offline mode
  } else {
    console.error('Unexpected error:', error.message);
    // General error handling
  }
}
```

## TypeScript Definitions

```typescript
// Type definitions for Enhanced Task Completion Detector

interface DetectionOptions {
  dataPath?: string;
  checkInterval?: number;
  confidenceThreshold?: number;
  maxRetries?: number;
  enableAggregation?: boolean;
}

interface DetectionResult {
  completed: boolean;
  confidence: number;
  detectionMethods: string[];
  metadata: Record<string, any>;
  errors: string[];
  warnings: string[];
  retryAttempts: number;
  detectionTime: number;
  timestamp: string;
}

interface DetectorResult {
  detected: boolean;
  confidence: number;
  metadata: Record<string, any>;
}

interface StatusObject {
  isMonitoring: boolean;
  checkInterval: number;
  confidenceThreshold: number;
  detectorsAvailable: number;
  aggregatorEnabled: boolean;
  completionAggregatorEnabled: boolean;
}

interface CompletionEvent {
  taskId: string;
  completed: boolean;
  confidence: number;
  detectionMethods: string[];
  metadata: Record<string, any>;
  timestamp: string;
}

class EnhancedTaskCompletionDetector {
  constructor(options?: DetectionOptions);
  checkCompletion(taskId: string): Promise<DetectionResult>;
  startMonitoring(taskId: string, onCompletion: (result: DetectionResult) => void, options?: { timeout?: number }): void;
  stop(): Promise<void>;
  stopSync(): void;
  getStatus(): StatusObject;
  manualCheck(taskId: string): Promise<DetectionResult>;
}
```

## Performance Considerations

### Resource Usage

**Memory Usage:**
- Base detector: ~32MB
- Per monitored task: ~2MB
- Aggregation buffers: ~10MB per 1000 events

**CPU Usage:**
- Single detection: ~50ms CPU time
- Continuous monitoring: ~2% CPU usage
- Aggregation: ~100ms CPU time per batch

**Network Usage:**
- Provider checks: ~1KB per request
- Aggregation uploads: ~5KB per batch

### Optimization Tips

```javascript
// Optimize for high-frequency detection
const optimizedDetector = new EnhancedTaskCompletionDetector({
  checkInterval: 60000,              // Reduce frequency
  maxRetries: 1,                     // Fewer retries
  enableAggregation: false,          // Disable if not needed
  
  // Selective detector enabling
  detectorWeights: {
    GitCommitDetector: 0.6,          // Focus on most reliable
    ProviderStatusDetector: 0.4,
    FileChangeDetector: 0,           // Disable resource-intensive detectors
    TimeThresholdDetector: 0
  }
});

// Batch processing for multiple tasks
const tasks = ['task-1', 'task-2', 'task-3'];
const results = await Promise.all(
  tasks.map(taskId => detector.checkCompletion(taskId))
);
```

## Integration Examples

### Express.js API Integration

```javascript
const express = require('express');
const { EnhancedTaskCompletionDetector } = require('../src/core/detection/EnhancedTaskCompletionDetector');

const app = express();
const detector = new EnhancedTaskCompletionDetector();

// Check task completion endpoint
app.get('/api/tasks/:taskId/completion', async (req, res) => {
  try {
    const result = await detector.checkCompletion(req.params.taskId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start monitoring endpoint
app.post('/api/tasks/:taskId/monitor', (req, res) => {
  const { taskId } = req.params;
  const { timeout } = req.body;
  
  detector.startMonitoring(taskId, (result) => {
    // Notify via websocket or webhook
    notifyCompletion(taskId, result);
  }, { timeout });
  
  res.json({ status: 'monitoring_started' });
});
```

### GitHub Actions Integration

```yaml
name: Task Completion Check
on:
  push:
    branches: [main, develop]

jobs:
  check-completion:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check Task Completion
        run: |
          TASK_ID=$(git log --format="%s" -n 1 | grep -o '#[0-9]\+' | cut -d'#' -f2)
          if [ ! -z "$TASK_ID" ]; then
            node scripts/detect-completion.js $TASK_ID --aggregate --team-summary
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

*This API reference is part of the FlowForge v2.0 documentation suite. For conceptual information, see the [Feature Documentation](../features/task-completion-detector.md).*