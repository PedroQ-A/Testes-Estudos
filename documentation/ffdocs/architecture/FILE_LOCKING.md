# File Locking Integration Documentation

## Overview

FlowForge v2.0 implements a robust file locking mechanism to prevent data corruption from concurrent file operations. This is critical for maintaining data integrity when multiple developer sessions or processes access the same files simultaneously.

## Architecture

### Core Components

#### 1. **File Lock Utility** (`/scripts/utils/file-lock.js`)
- Low-level locking primitives
- Advisory locks with PID verification
- Heartbeat monitoring for stale lock detection
- Automatic cleanup of orphaned locks

#### 2. **File Lock Integration** (`/scripts/utils/file-lock-integration.js`)
- High-level integration with FlowForge operations
- Atomic operations for critical files
- Batch operation support
- Metrics and monitoring

#### 3. **FileLockManager Class** (`/scripts/utils/FileLockManager.js`)
- Object-oriented wrapper for easy integration
- Automatic cleanup handlers
- Simplified API for common operations

## Critical Files Protected

### 1. Tasks File (`.flowforge/tasks.json`)
- Task creation and updates
- Status changes
- Dependency management
- Implementation order tracking

### 2. Time Tracking File (`.flowforge/billing/time-tracking.json`)
- Session start/stop operations
- Duration calculations
- Multi-user time tracking
- Billing data integrity

### 3. Active Sessions File (`.flowforge/sessions/active-sessions.json`)
- Concurrent session management
- Session lifecycle tracking
- Cleanup of stale sessions

## Implementation Details

### Lock Mechanism

```javascript
// Lock acquisition with timeout
const lockId = await acquireLock(filePath, 30000);
try {
    // Critical operations here
    const data = await fs.readFile(filePath);
    // ... modify data ...
    await fs.writeFile(filePath, modifiedData);
} finally {
    // Always release lock
    await releaseLock(filePath, lockId);
}
```

### Heartbeat System

- Locks include heartbeat timestamps updated every 5 seconds
- Stale locks (no heartbeat for 30+ seconds) are automatically cleaned
- Process ID verification ensures locks from dead processes are removed

### Lock Files

Lock files are stored in `.flowforge/.locks/` with naming convention:
```
.flowforge/.locks/
├── tasks.json.lock
├── time-tracking.json.lock
└── active-sessions.json.lock
```

## Usage Patterns

### Pattern 1: Simple File Update

```javascript
const { updateTaskFile } = require('./utils/file-lock-integration');

// Atomic task update
await updateTaskFile({
    id: 142,
    status: 'completed',
    completedAt: new Date().toISOString()
});
```

### Pattern 2: Batch Operations

```javascript
const { batchUpdateTasks } = require('./utils/file-lock-integration');

// Single lock for multiple updates
await batchUpdateTasks([
    { id: 1, status: 'completed' },
    { id: 2, status: 'in-progress' },
    { id: 3, status: 'blocked' }
]);
```

### Pattern 3: Custom Operations

```javascript
const lockManager = new FileLockManager();

// Custom operation with locking
const result = await lockManager.withLock('custom.json', async () => {
    const data = await fs.readFile('custom.json', 'utf8');
    const parsed = JSON.parse(data);
    // ... custom logic ...
    await fs.writeFile('custom.json', JSON.stringify(parsed));
    return parsed;
});
```

## Integration Points

### 1. Provider Bridge (`scripts/provider-bridge.js`)
- All task file operations use locking
- Prevents corruption during parallel task queries
- Ensures atomic updates for task status changes

### 2. Time Tracking (`scripts/task-time-locked.js`)
- Atomic session start/stop operations
- Prevents double-booking of time
- Handles instance isolation correctly

### 3. Session Management (`scripts/session-manager-locked.js`)
- Thread-safe session lifecycle management
- Automatic cleanup of stale sessions
- Concurrent session support

## Error Handling

### Lock Acquisition Timeout
```javascript
try {
    await updateTaskFile(data, { timeout: 5000 });
} catch (error) {
    if (error.message.includes('timeout')) {
        console.error('Could not acquire lock - file may be in use');
        // Implement retry logic or user notification
    }
}
```

### Stale Lock Recovery
```javascript
// Automatic cleanup on startup
const { cleanupStaleLocks } = require('./utils/file-lock');
await cleanupStaleLocks();
```

### Process Exit Cleanup
```javascript
// Automatic cleanup handlers registered
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
```

## Performance Considerations

### Lock Contention
- Default timeout: 30 seconds
- Retry interval: 100ms
- Maximum concurrent locks: Unlimited (OS dependent)

### Optimization Strategies
1. **Batch Operations**: Group multiple updates under single lock
2. **Read Caching**: Cache frequently read files with TTL
3. **Lock Granularity**: Lock specific sections vs entire files

### Metrics

```javascript
const { getLockMetrics } = require('./utils/file-lock-integration');

const metrics = getLockMetrics();
console.log(`Average lock wait time: ${metrics.averageWaitTime}ms`);
console.log(`Total timeouts: ${metrics.totalTimeouts}`);
```

## Migration Guide

### Updating Existing Code

#### Before (No Locking):
```javascript
// Unsafe - can corrupt data
const data = JSON.parse(fs.readFileSync('.flowforge/tasks.json'));
data.tasks.push(newTask);
fs.writeFileSync('.flowforge/tasks.json', JSON.stringify(data));
```

#### After (With Locking):
```javascript
// Safe - atomic operation
await updateTaskFile(newTask);
```

### Gradual Migration

1. **Phase 1**: Integrate locking in critical paths (time tracking, billing)
2. **Phase 2**: Update provider operations
3. **Phase 3**: Migrate all file operations
4. **Phase 4**: Remove legacy non-locked operations

## Testing

### Unit Tests
```bash
npm test scripts/utils/file-lock.test.js
npm test scripts/utils/file-lock-integration.test.js
```

### Integration Tests
```bash
# Test concurrent operations
node scripts/test/concurrent-lock-test.js

# Test stale lock cleanup
node scripts/test/stale-lock-test.js
```

### Load Testing
```javascript
// Simulate high concurrency
const promises = [];
for (let i = 0; i < 100; i++) {
    promises.push(updateTaskFile({ id: i, status: 'test' }));
}
await Promise.all(promises);
```

## Troubleshooting

### Common Issues

#### 1. Lock Files Not Cleaned Up
```bash
# Manual cleanup
rm -rf .flowforge/.locks/*.lock

# Or use utility
node -e "require('./scripts/utils/file-lock').cleanupStaleLocks()"
```

#### 2. Persistent Lock Timeout
- Check for processes holding locks
- Increase timeout for long operations
- Verify file system permissions

#### 3. Performance Degradation
- Monitor lock wait times
- Implement caching for read-heavy operations
- Consider lock-free alternatives for read-only access

## Best Practices

1. **Always Use Try/Finally**: Ensure locks are released
2. **Keep Critical Sections Small**: Minimize time holding locks
3. **Handle Timeouts Gracefully**: Implement retry logic
4. **Monitor Lock Metrics**: Track performance impacts
5. **Test Concurrent Scenarios**: Verify behavior under load

## Security Considerations

### Lock File Permissions
- Lock files inherit parent directory permissions
- Ensure `.flowforge/.locks/` is not world-writable
- Consider using file system ACLs for multi-user environments

### PID Spoofing Protection
- Locks include hostname and username verification
- Heartbeat mechanism prevents lock hijacking
- Process existence check validates PID

## Future Enhancements

### Planned Features
1. **Distributed Locking**: Redis/Etcd backend for multi-machine setups
2. **Read/Write Locks**: Separate locks for read vs write operations
3. **Lock Prioritization**: Priority queue for lock acquisition
4. **Dead Letter Queue**: Failed operation recovery mechanism

### Performance Improvements
1. **Lock-Free Reads**: MVCC-style versioning for read operations
2. **Adaptive Timeouts**: Dynamic timeout based on operation history
3. **Lock Coalescing**: Combine multiple operations automatically

## Conclusion

The file locking mechanism is a critical component of FlowForge v2.0, ensuring data integrity in concurrent environments. By following the patterns and best practices outlined in this document, developers can safely implement parallel operations without fear of data corruption.

For additional support or questions, refer to the test files or contact the FlowForge team.