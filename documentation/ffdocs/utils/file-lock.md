# File Lock Utility

## Overview

The File Lock utility provides robust file locking mechanism for FlowForge to handle concurrent access from multiple developers. It uses advisory file locking with PID verification and heartbeat monitoring to ensure safe concurrent operations.

## Features

- **Advisory File Locking**: Non-blocking, cooperative locking mechanism
- **PID Verification**: Validates process ownership of locks
- **Heartbeat Monitoring**: 5-second interval heartbeats ensure lock validity
- **Automatic Cleanup**: Removes stale locks older than 30 seconds
- **Cross-Platform**: Works on Windows, Linux, and macOS
- **High Performance**: Lock acquisition < 100ms in normal conditions

## API Reference

### `acquireLock(filePath, timeout = 30000)`

Acquires a lock on the specified file.

**Parameters:**
- `filePath` (string): Path to the file to lock
- `timeout` (number): Maximum wait time in milliseconds (default: 30000)

**Returns:** Promise<string> - Unique lock identifier

**Example:**
```javascript
const lockId = await acquireLock('/path/to/file.txt', 5000);
```

### `releaseLock(filePath, lockId)`

Releases a lock on the specified file.

**Parameters:**
- `filePath` (string): Path to the file to unlock
- `lockId` (string): Lock identifier from acquireLock

**Returns:** Promise<boolean> - True if successfully released

**Example:**
```javascript
const released = await releaseLock('/path/to/file.txt', lockId);
```

### `isLocked(filePath)`

Checks if a file is currently locked.

**Parameters:**
- `filePath` (string): Path to the file to check

**Returns:** Promise<boolean> - True if file is locked

**Example:**
```javascript
if (await isLocked('/path/to/file.txt')) {
  console.log('File is locked');
}
```

### `cleanupStaleLocks()`

Removes stale locks older than 30 seconds with dead processes.

**Returns:** Promise<void>

**Example:**
```javascript
await cleanupStaleLocks();
```

## Lock File Structure

Lock files are stored in `.flowforge/.locks/` directory with the following JSON format:

```json
{
  "pid": 12345,
  "lockId": "unique-identifier",
  "timestamp": 1640000000000,
  "holder": "username",
  "file": "/path/to/file",
  "heartbeat": 1640000005000
}
```

## Usage Patterns

### Safe File Update

```javascript
const { acquireLock, releaseLock } = require('./scripts/utils/file-lock');

async function safeUpdate(filePath, content) {
  let lockId = null;

  try {
    lockId = await acquireLock(filePath);
    await fs.writeFile(filePath, content);
  } finally {
    if (lockId) {
      await releaseLock(filePath, lockId);
    }
  }
}
```

### Concurrent Access Control

```javascript
async function processFile(filePath) {
  // Check if file is available
  if (await isLocked(filePath)) {
    console.log('File is being processed by another user');
    return;
  }

  // Acquire lock and process
  const lockId = await acquireLock(filePath, 10000);
  try {
    // Process file safely
    await performOperations(filePath);
  } finally {
    await releaseLock(filePath, lockId);
  }
}
```

## Performance Characteristics

- **Lock Acquisition**: < 100ms for unlocked files
- **Heartbeat Interval**: 5 seconds
- **Stale Lock Threshold**: 30 seconds
- **CPU Usage**: Minimal (heartbeat uses setInterval)
- **Memory Usage**: O(n) where n = number of active locks

## Error Handling

The utility handles various error conditions gracefully:

- **ENOENT**: File doesn't exist
- **EEXIST**: Lock already exists (waits and retries)
- **EACCES**: Permission denied
- **Corrupted Locks**: Automatically removed
- **Dead Processes**: Stale locks cleaned up

## Testing

Comprehensive test suite covers:
- Basic lock acquisition and release
- Timeout handling
- Concurrent access scenarios
- Cross-platform compatibility
- Performance requirements
- Error conditions

Run tests with:
```bash
npm run test:file-lock
```

## Integration with FlowForge

This utility is designed to integrate with FlowForge's workflow:

1. **Session Management**: Locks project files during active sessions
2. **Time Tracking**: Prevents concurrent modifications to time records
3. **Task Updates**: Ensures atomic updates to task files
4. **Configuration**: Safe concurrent access to config files

## Best Practices

1. **Always Release Locks**: Use try/finally blocks
2. **Set Appropriate Timeouts**: Based on operation duration
3. **Check Lock Status First**: For better user experience
4. **Handle Timeouts Gracefully**: Inform users about conflicts
5. **Regular Maintenance**: Run cleanupStaleLocks periodically

## Troubleshooting

### Lock Not Releasing

If a lock isn't releasing:
1. Check if process owns the lock (correct lockId)
2. Verify process has write permissions
3. Check `.flowforge/.locks/` directory permissions

### Timeout Errors

If experiencing frequent timeouts:
1. Increase timeout value
2. Check for long-running operations holding locks
3. Verify heartbeat mechanism is working

### Stale Locks

If locks persist after process termination:
1. Run `cleanupStaleLocks()` manually
2. Check if process is actually terminated
3. Verify 30-second threshold is appropriate

## Implementation Details

- **Atomic Operations**: Uses 'wx' flag for exclusive file creation
- **Process Detection**: Uses process.kill(pid, 0) for verification
- **Cleanup Handlers**: Registered for exit, SIGINT, SIGTERM
- **Path Normalization**: Handles cross-platform path differences
- **Unicode Support**: Works with Unicode file paths

---

*File Lock Utility v1.0.0 - FlowForge Team*