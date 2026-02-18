# Using the Aggregation System

**Version:** 2.0.0  
**Issue:** #240  
**Last Updated:** 2025-09-06  

## Overview

This guide provides practical instructions for using the Smart Batch Processing Aggregation System in FlowForge v2.0. Learn how to integrate the system, configure it for your needs, and monitor its performance.

## Quick Start

### Basic Integration

The simplest way to start using the aggregation system is through the Provider Bridge:

```bash
# Start aggregation system
node scripts/provider-bridge.js aggregate

# Check status
node scripts/provider-bridge.js aggregate-status

# View metrics
node scripts/provider-bridge.js aggregate-status --format=json --detailed
```

### Programmatic Usage

For direct integration in your Node.js applications:

```javascript
const { SmartBatchAggregator } = require('./src/core/aggregation/SmartBatchAggregator.js');
const { CronRecoveryDaemon } = require('./src/core/aggregation/CronRecoveryDaemon.js');

// Initialize aggregator
const aggregator = new SmartBatchAggregator({
  batchSize: 50,
  maxAge: 30000,
  flushThreshold: 0.9,
  dataPath: '.flowforge/aggregated'
});

// Initialize recovery daemon
const daemon = new CronRecoveryDaemon({
  scheduleInterval: 300000,  // 5 minutes
  batchRetryLimit: 5
}, aggregator);

// Start the daemon
await daemon.start();

// Add time tracking entries
await aggregator.add({
  userId: 'developer_123',
  action: 'code_edit',
  timestamp: Date.now(),
  metadata: {
    file: 'src/app.js',
    sessionId: 'session_456'
  }
});
```

## Configuration

### SmartBatchAggregator Configuration

#### Basic Configuration

```javascript
const config = {
  // Batch size triggers
  batchSize: 50,              // Maximum entries before auto-flush
  flushThreshold: 0.9,        // Flush at 90% of batchSize (45 entries)
  
  // Time-based triggers
  maxAge: 30000,              // Flush after 30 seconds
  
  // Storage configuration
  dataPath: '.flowforge/aggregated',
  atomicOperations: true,     // Use atomic writes
  
  // Performance configuration
  performance: {
    targetTime: 500,          // Target flush time in ms
    maxTime: 1000            // Maximum allowed flush time
  }
};

const aggregator = new SmartBatchAggregator(config);
```

#### Environment-Based Configuration

```javascript
const config = {
  batchSize: parseInt(process.env.FLOWFORGE_BATCH_SIZE) || 50,
  maxAge: parseInt(process.env.FLOWFORGE_MAX_AGE) || 30000,
  dataPath: process.env.FLOWFORGE_DATA_PATH || '.flowforge/aggregated',
  
  // Development vs Production settings
  atomicOperations: process.env.NODE_ENV !== 'development',
  
  performance: {
    targetTime: process.env.NODE_ENV === 'production' ? 300 : 500,
    maxTime: process.env.NODE_ENV === 'production' ? 800 : 1000
  }
};
```

#### Configuration File

Create a configuration file at `.flowforge/config/aggregation.json`:

```json
{
  "aggregator": {
    "batchSize": 50,
    "maxAge": 30000,
    "flushThreshold": 0.9,
    "dataPath": ".flowforge/aggregated",
    "atomicOperations": true,
    "performance": {
      "targetTime": 500,
      "maxTime": 1000
    }
  },
  "daemon": {
    "scheduleInterval": 300000,
    "batchRetryLimit": 5,
    "healthCheckInterval": 60000,
    "cleanupAge": 604800000
  }
}
```

Load the configuration:

```javascript
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('.flowforge/config/aggregation.json', 'utf8'));

const aggregator = new SmartBatchAggregator(config.aggregator);
const daemon = new CronRecoveryDaemon(config.daemon, aggregator);
```

### CronRecoveryDaemon Configuration

#### Basic Configuration

```javascript
const daemonConfig = {
  // Scheduling
  scheduleInterval: 300000,      // Scan every 5 minutes
  healthCheckInterval: 60000,    // Health check every minute
  
  // Recovery settings
  batchRetryLimit: 5,           // Max retries before abandoning
  
  // Cleanup settings
  cleanupAge: 604800000,        // Clean files older than 7 days
  
  // Paths
  dataPath: '.flowforge/aggregated',
  recoveryPath: '.flowforge/aggregated/recovery',
  healthPath: '.flowforge/aggregated/health',
  
  // Logging
  logLevel: 'info'              // info, warn, error
};

const daemon = new CronRecoveryDaemon(daemonConfig, aggregator);
```

#### Advanced Configuration

```javascript
const advancedConfig = {
  // High-frequency monitoring (for production)
  scheduleInterval: 60000,       // 1 minute scans
  healthCheckInterval: 30000,    // 30 second health checks
  
  // Aggressive recovery
  batchRetryLimit: 10,          // More retry attempts
  
  // Extended retention
  cleanupAge: 2592000000,       // 30 days cleanup age
  
  // Custom paths for distributed setup
  dataPath: '/shared/flowforge/aggregated',
  recoveryPath: '/shared/flowforge/recovery',
  healthPath: '/monitoring/flowforge/health',
  
  // Detailed logging
  logLevel: 'debug'
};
```

## Usage Patterns

### Time Tracking Integration

The most common use case is integrating with FlowForge's time tracking system:

```javascript
class TimeTracker {
  constructor() {
    this.aggregator = new SmartBatchAggregator({
      batchSize: 25,    // Smaller batches for real-time feel
      maxAge: 15000,    // Faster flushes for time tracking
      flushThreshold: 0.8
    });
  }
  
  async startSession(userId, taskId) {
    const sessionId = this.generateSessionId();
    
    await this.aggregator.add({
      userId: userId,
      action: 'session_start',
      timestamp: Date.now(),
      metadata: {
        sessionId: sessionId,
        taskId: taskId,
        type: 'time_tracking'
      }
    });
    
    return sessionId;
  }
  
  async endSession(userId, sessionId, duration) {
    await this.aggregator.add({
      userId: userId,
      action: 'session_end',
      timestamp: Date.now(),
      metadata: {
        sessionId: sessionId,
        duration: duration,
        type: 'time_tracking'
      }
    });
    
    // Force flush to ensure immediate persistence
    await this.aggregator.forceFlush();
  }
}
```

### Event Logging

Use the aggregation system for application event logging:

```javascript
class EventLogger {
  constructor() {
    this.aggregator = new SmartBatchAggregator({
      batchSize: 100,   // Larger batches for events
      maxAge: 60000,    // 1 minute batching
      dataPath: '.flowforge/events'
    });
  }
  
  async logEvent(userId, event, details) {
    await this.aggregator.add({
      userId: userId,
      action: event,
      timestamp: Date.now(),
      metadata: {
        ...details,
        source: 'event_logger',
        level: details.level || 'info'
      }
    });
  }
  
  async logError(userId, error, context) {
    await this.aggregator.add({
      userId: userId,
      action: 'error_occurred',
      timestamp: Date.now(),
      metadata: {
        error: error.message,
        stack: error.stack,
        context: context,
        level: 'error'
      }
    });
    
    // Immediately flush errors
    await this.aggregator.forceFlush();
  }
}
```

### Metrics Collection

Collect and batch application metrics:

```javascript
class MetricsCollector {
  constructor() {
    this.aggregator = new SmartBatchAggregator({
      batchSize: 200,   // Large batches for metrics
      maxAge: 120000,   // 2 minute batching
      dataPath: '.flowforge/metrics'
    });
  }
  
  async recordMetric(metricName, value, tags = {}) {
    await this.aggregator.add({
      userId: 'system',
      action: 'metric_recorded',
      timestamp: Date.now(),
      metadata: {
        metric: metricName,
        value: value,
        tags: tags,
        type: 'metric'
      }
    });
  }
  
  async recordPerformance(operation, duration, success) {
    await this.recordMetric('operation_duration', duration, {
      operation: operation,
      success: success
    });
  }
}
```

## Monitoring and Observability

### Health Monitoring

#### Basic Health Check

```javascript
// Simple health check
const health = await daemon.performHealthCheck();
console.log(`System status: ${health.status}`);

if (health.issues.length > 0) {
  console.log('Issues detected:');
  health.issues.forEach(issue => console.log(`- ${issue}`));
}
```

#### Continuous Health Monitoring

```javascript
class HealthMonitor {
  constructor(daemon) {
    this.daemon = daemon;
    this.alerts = [];
  }
  
  async startMonitoring() {
    setInterval(async () => {
      try {
        const health = await this.daemon.performHealthCheck();
        await this.processHealthStatus(health);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000); // Every 30 seconds
  }
  
  async processHealthStatus(health) {
    if (health.status === 'unhealthy') {
      await this.handleUnhealthyStatus(health);
    }
    
    if (health.severity === 'critical') {
      await this.handleCriticalIssue(health);
    }
    
    // Track health trends
    this.recordHealthMetrics(health);
  }
  
  async handleUnhealthyStatus(health) {
    const alert = {
      timestamp: Date.now(),
      type: 'health_warning',
      issues: health.issues,
      metrics: health.aggregatorHealth
    };
    
    this.alerts.push(alert);
    await this.sendNotification(alert);
  }
  
  async handleCriticalIssue(health) {
    const alert = {
      timestamp: Date.now(),
      type: 'critical_alert',
      severity: 'critical',
      issues: health.issues,
      requiresImmediate: true
    };
    
    await this.sendUrgentNotification(alert);
  }
}
```

### Performance Monitoring

#### Real-time Metrics

```javascript
class PerformanceMonitor {
  constructor(aggregator, daemon) {
    this.aggregator = aggregator;
    this.daemon = daemon;
    this.metricsHistory = [];
  }
  
  startMonitoring() {
    setInterval(() => {
      this.collectMetrics();
    }, 10000); // Every 10 seconds
  }
  
  collectMetrics() {
    const aggMetrics = this.aggregator.getPerformanceMetrics();
    const daemonMetrics = this.daemon.getRecoveryMetrics();
    const stats = this.aggregator.getStats();
    
    const snapshot = {
      timestamp: Date.now(),
      aggregator: {
        throughput: this.calculateThroughput(aggMetrics),
        latency: {
          average: aggMetrics.averageFlushTime,
          p95: this.calculateP95(aggMetrics.flushTimes),
          p99: this.calculateP99(aggMetrics.flushTimes)
        },
        successRate: aggMetrics.successRate,
        currentBatchSize: stats.currentBatchSize,
        batchAge: stats.batchAge
      },
      recovery: {
        successRate: daemonMetrics.recoverySuccessRate,
        avgRecoveryTime: daemonMetrics.averageRecoveryTime,
        pendingRecoveries: this.getPendingRecoveryCount(),
        abandonedBatches: daemonMetrics.abandonedBatches
      }
    };
    
    this.metricsHistory.push(snapshot);
    this.checkThresholds(snapshot);
    
    // Keep only last hour of metrics
    const oneHourAgo = Date.now() - 3600000;
    this.metricsHistory = this.metricsHistory.filter(m => m.timestamp > oneHourAgo);
  }
  
  checkThresholds(snapshot) {
    const alerts = [];
    
    // Performance thresholds
    if (snapshot.aggregator.latency.average > 500) {
      alerts.push('High average flush time');
    }
    
    if (snapshot.aggregator.successRate < 0.95) {
      alerts.push('Low aggregation success rate');
    }
    
    if (snapshot.recovery.successRate < 0.99) {
      alerts.push('Low recovery success rate');
    }
    
    // Resource thresholds
    if (snapshot.aggregator.currentBatchSize > 40) {
      alerts.push('Large pending batch');
    }
    
    if (snapshot.aggregator.batchAge > 25000) {
      alerts.push('Old pending batch');
    }
    
    if (alerts.length > 0) {
      this.handlePerformanceAlerts(alerts, snapshot);
    }
  }
}
```

#### Custom Dashboards

Create dashboards using the metrics:

```javascript
class Dashboard {
  constructor(performanceMonitor) {
    this.monitor = performanceMonitor;
  }
  
  generateReport() {
    const recent = this.monitor.metricsHistory.slice(-60); // Last 10 minutes
    
    return {
      summary: this.calculateSummary(recent),
      trends: this.calculateTrends(recent),
      alerts: this.getActiveAlerts(),
      recommendations: this.generateRecommendations(recent)
    };
  }
  
  calculateSummary(metrics) {
    const latest = metrics[metrics.length - 1];
    const avg = this.calculateAverages(metrics);
    
    return {
      current: {
        throughput: latest.aggregator.throughput,
        latency: latest.aggregator.latency.average,
        successRate: latest.aggregator.successRate,
        batchSize: latest.aggregator.currentBatchSize
      },
      averages: {
        throughput: avg.throughput,
        latency: avg.latency,
        successRate: avg.successRate
      }
    };
  }
  
  generateRecommendations(metrics) {
    const recommendations = [];
    const avg = this.calculateAverages(metrics);
    
    if (avg.latency > 400) {
      recommendations.push({
        type: 'performance',
        message: 'Consider reducing batch size to improve flush times',
        action: 'Reduce batchSize from current value'
      });
    }
    
    if (avg.throughput < 50) {
      recommendations.push({
        type: 'throughput',
        message: 'Consider increasing batch size to improve throughput',
        action: 'Increase batchSize or reduce flushThreshold'
      });
    }
    
    return recommendations;
  }
}
```

## Troubleshooting

### Common Issues and Solutions

#### High Processing Times

**Problem:** Flush operations consistently taking >500ms

**Diagnosis:**
```javascript
const metrics = aggregator.getPerformanceMetrics();
console.log(`Average flush time: ${metrics.averageFlushTime}ms`);
console.log(`Max flush time: ${metrics.maxFlushTime}ms`);
console.log(`Current batch size: ${aggregator.getCurrentBatchSize()}`);
```

**Solutions:**
1. **Reduce batch size:**
   ```javascript
   // Current configuration
   batchSize: 50  // Too large?
   
   // Try smaller batch
   batchSize: 25
   ```

2. **Check disk I/O:**
   ```bash
   # Monitor disk I/O during flush operations
   iostat -x 1 10
   ```

3. **Optimize file path:**
   ```javascript
   // Use faster storage for data path
   dataPath: '/dev/shm/flowforge'  // RAM disk
   // or
   dataPath: '/fast-ssd/flowforge'  // SSD storage
   ```

#### Failed Batches Accumulating

**Problem:** Recovery daemon not processing failed batches

**Diagnosis:**
```javascript
const failedBatches = await daemon.scanForFailedBatches();
console.log(`Found ${failedBatches.length} failed batches`);

const daemonMetrics = daemon.getRecoveryMetrics();
console.log(`Recovery success rate: ${daemonMetrics.recoverySuccessRate}`);
console.log(`Abandoned batches: ${daemonMetrics.abandonedBatches}`);
```

**Solutions:**
1. **Check daemon status:**
   ```javascript
   if (!daemon.isRunning()) {
     await daemon.start();
     console.log('Recovery daemon started');
   }
   ```

2. **Increase retry limits:**
   ```javascript
   const config = {
     batchRetryLimit: 10,  // Increased from 5
     scheduleInterval: 60000  // More frequent scans
   };
   ```

3. **Manual recovery:**
   ```javascript
   // Force recovery of specific batches
   const results = await daemon.reprocessFailedBatches(failedBatches);
   console.log(`Recovered ${results.succeeded} batches`);
   ```

#### Memory Usage Growing

**Problem:** Aggregator consuming excessive memory

**Diagnosis:**
```javascript
const stats = aggregator.getStats();
console.log(`Current batch size: ${stats.currentBatchSize}`);
console.log(`Batch age: ${stats.batchAge}ms`);

// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`Heap used: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
}, 5000);
```

**Solutions:**
1. **Reduce batch size and age:**
   ```javascript
   const config = {
     batchSize: 25,     // Smaller batches
     maxAge: 15000,     // Flush more frequently
     flushThreshold: 0.8 // Flush earlier
   };
   ```

2. **Force periodic flushes:**
   ```javascript
   // Periodic forced flush
   setInterval(async () => {
     if (!aggregator.isEmpty()) {
       await aggregator.forceFlush();
     }
   }, 10000); // Every 10 seconds
   ```

#### Data Validation Errors

**Problem:** Entries being rejected due to validation

**Diagnosis:**
```javascript
try {
  await aggregator.add(entry);
} catch (error) {
  if (error.name === 'ValidationError') {
    console.log('Validation failed:', error.message);
    console.log('Entry:', JSON.stringify(entry, null, 2));
  }
}
```

**Solutions:**
1. **Fix entry format:**
   ```javascript
   // Ensure required fields
   const entry = {
     userId: userId || 'unknown',
     action: action || 'unknown_action',
     timestamp: timestamp || Date.now(),
     metadata: metadata || {}
   };
   ```

2. **Add validation wrapper:**
   ```javascript
   class SafeAggregator {
     constructor(aggregator) {
       this.aggregator = aggregator;
     }
     
     async safeAdd(entry) {
       try {
         // Sanitize entry
         const sanitized = {
           userId: String(entry.userId || 'unknown'),
           action: String(entry.action || 'unknown_action'),
           timestamp: Number(entry.timestamp || Date.now()),
           metadata: entry.metadata || {}
         };
         
         await this.aggregator.add(sanitized);
         return { success: true };
       } catch (error) {
         console.warn('Entry rejected:', error.message);
         return { success: false, error: error.message };
       }
     }
   }
   ```

### Debug Mode

Enable debug mode for detailed logging:

```javascript
class DebugAggregator extends SmartBatchAggregator {
  constructor(config) {
    super(config);
    this.debug = true;
  }
  
  async add(entry) {
    if (this.debug) {
      console.log('Adding entry:', JSON.stringify(entry));
      console.log(`Current batch size: ${this.getCurrentBatchSize()}`);
      console.log(`Batch age: ${this.getBatchAge()}ms`);
    }
    
    return await super.add(entry);
  }
  
  async flush() {
    if (this.debug) {
      const startTime = Date.now();
      console.log(`Starting flush with ${this.getCurrentBatchSize()} entries`);
    }
    
    try {
      await super.flush();
      if (this.debug) {
        const duration = Date.now() - startTime;
        console.log(`Flush completed in ${duration}ms`);
      }
    } catch (error) {
      if (this.debug) {
        console.error('Flush failed:', error);
      }
      throw error;
    }
  }
}
```

### Log Analysis

Analyze aggregation logs for patterns:

```bash
# Find performance issues
grep "flush.*[5-9][0-9][0-9]ms" .flowforge/logs/aggregation.log

# Find validation errors
grep "ValidationError" .flowforge/logs/aggregation.log

# Count recovery operations
grep "recovery.*success" .flowforge/logs/recovery.log | wc -l

# Check error patterns
grep "ERROR" .flowforge/logs/*.log | head -20
```

## Best Practices

### Configuration Best Practices

1. **Environment-specific settings:**
   ```javascript
   const config = {
     // Development: Fast feedback, detailed logging
     development: {
       batchSize: 10,
       maxAge: 5000,
       logLevel: 'debug'
     },
     
     // Production: Optimized for throughput
     production: {
       batchSize: 100,
       maxAge: 60000,
       logLevel: 'info'
     },
     
     // Testing: Predictable behavior
     test: {
       batchSize: 5,
       maxAge: 1000,
       atomicOperations: false
     }
   }[process.env.NODE_ENV];
   ```

2. **Resource-based configuration:**
   ```javascript
   const os = require('os');
   
   // Adjust based on system resources
   const config = {
     batchSize: os.cpus().length * 10,  // Scale with CPU cores
     dataPath: os.platform() === 'win32' 
       ? 'C:\\temp\\flowforge' 
       : '/tmp/flowforge',
     
     // Memory-based limits
     maxBatches: Math.floor(os.totalmem() / (1024 * 1024 * 10)) // 10MB per batch
   };
   ```

### Performance Best Practices

1. **Batch size optimization:**
   ```javascript
   // Monitor and adjust batch size dynamically
   class AdaptiveBatchSize {
     constructor(aggregator) {
       this.aggregator = aggregator;
       this.targetFlushTime = 300; // 300ms target
       this.currentBatchSize = 50;
     }
     
     async adjustBatchSize() {
       const metrics = this.aggregator.getPerformanceMetrics();
       const avgFlushTime = metrics.averageFlushTime;
       
       if (avgFlushTime > this.targetFlushTime * 1.2) {
         // Too slow, reduce batch size
         this.currentBatchSize = Math.max(10, this.currentBatchSize - 5);
       } else if (avgFlushTime < this.targetFlushTime * 0.8) {
         // Too fast, increase batch size
         this.currentBatchSize = Math.min(200, this.currentBatchSize + 10);
       }
       
       // Update aggregator configuration
       this.aggregator.config.batchSize = this.currentBatchSize;
     }
   }
   ```

2. **Memory management:**
   ```javascript
   // Monitor and prevent memory leaks
   setInterval(() => {
     const usage = process.memoryUsage();
     const heapUsedMB = usage.heapUsed / 1024 / 1024;
     
     if (heapUsedMB > 100) { // 100MB threshold
       console.warn(`High memory usage: ${heapUsedMB.toFixed(2)}MB`);
       
       // Force garbage collection if available
       if (global.gc) {
         global.gc();
       }
       
       // Force flush to free memory
       if (!aggregator.isEmpty()) {
         aggregator.forceFlush();
       }
     }
   }, 30000);
   ```

### Error Handling Best Practices

1. **Graceful degradation:**
   ```javascript
   class ResilientTimeTracker {
     constructor() {
       this.aggregator = new SmartBatchAggregator(config);
       this.fallbackStorage = [];
       this.aggregatorHealthy = true;
     }
     
     async trackTime(entry) {
       try {
         if (this.aggregatorHealthy) {
           await this.aggregator.add(entry);
         } else {
           // Fallback to memory storage
           this.fallbackStorage.push(entry);
           await this.attemptRecovery();
         }
       } catch (error) {
         this.aggregatorHealthy = false;
         this.fallbackStorage.push(entry);
         console.warn('Aggregator failed, using fallback storage');
       }
     }
     
     async attemptRecovery() {
       try {
         // Try to restore aggregator
         const test = await this.aggregator.add({
           userId: 'test',
           action: 'health_check',
           timestamp: Date.now()
         });
         
         // If successful, flush fallback storage
         for (const entry of this.fallbackStorage) {
           await this.aggregator.add(entry);
         }
         
         this.fallbackStorage = [];
         this.aggregatorHealthy = true;
         console.log('Aggregator recovered successfully');
       } catch (error) {
         // Recovery failed, keep using fallback
       }
     }
   }
   ```

2. **Circuit breaker pattern:**
   ```javascript
   class AggregatorCircuitBreaker {
     constructor(aggregator, threshold = 5, timeout = 30000) {
       this.aggregator = aggregator;
       this.threshold = threshold;
       this.timeout = timeout;
       this.failures = 0;
       this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
       this.nextAttempt = 0;
     }
     
     async add(entry) {
       if (this.state === 'OPEN') {
         if (Date.now() < this.nextAttempt) {
           throw new Error('Circuit breaker is OPEN');
         }
         this.state = 'HALF_OPEN';
       }
       
       try {
         await this.aggregator.add(entry);
         this.onSuccess();
       } catch (error) {
         this.onFailure();
         throw error;
       }
     }
     
     onSuccess() {
       this.failures = 0;
       this.state = 'CLOSED';
     }
     
     onFailure() {
       this.failures++;
       if (this.failures >= this.threshold) {
         this.state = 'OPEN';
         this.nextAttempt = Date.now() + this.timeout;
       }
     }
   }
   ```

### Monitoring Best Practices

1. **Comprehensive metrics collection:**
   ```javascript
   class MetricsCollector {
     constructor(aggregator, daemon) {
       this.aggregator = aggregator;
       this.daemon = daemon;
       this.metrics = {
         business: {},    // Business metrics
         technical: {},   // Technical metrics
         operational: {}  // Operational metrics
       };
     }
     
     collectBusinessMetrics() {
       const stats = this.aggregator.getStats();
       
       this.metrics.business = {
         totalTimeTracked: this.calculateTotalTime(),
         activeUsers: this.getActiveUserCount(),
         sessionsPerHour: this.calculateSessionRate(),
         averageSessionDuration: this.calculateAvgDuration()
       };
     }
     
     collectTechnicalMetrics() {
       const perf = this.aggregator.getPerformanceMetrics();
       const recovery = this.daemon.getRecoveryMetrics();
       
       this.metrics.technical = {
         throughput: perf.totalOperations,
         latency: {
           p50: this.calculateP50(perf.flushTimes),
           p95: this.calculateP95(perf.flushTimes),
           p99: this.calculateP99(perf.flushTimes)
         },
         errorRate: 1 - perf.successRate,
         recoveryRate: recovery.recoverySuccessRate
       };
     }
     
     collectOperationalMetrics() {
       this.metrics.operational = {
         memoryUsage: process.memoryUsage(),
         diskUsage: this.getDiskUsage(),
         uptime: process.uptime(),
         daemonHealth: this.daemon.isRunning()
       };
     }
   }
   ```

---

**Last Updated:** 2025-09-06  
**Next Review:** 2025-10-06  
**Maintainer:** FlowForge Development Team