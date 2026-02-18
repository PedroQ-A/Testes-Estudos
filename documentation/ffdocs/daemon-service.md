# FlowForge Daemon Service Documentation

## Overview

The FlowForge Daemon is a lightweight background service that handles various maintenance and monitoring tasks for the FlowForge framework. It runs independently of your development sessions, ensuring optimal performance and data integrity.

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                   FlowForge Daemon                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ File Monitor │  │ Idle Monitor │  │ GitHub Sync  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Cleanup    │  │   Metrics    │  │Health Check  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    Event Emitter                         │
├─────────────────────────────────────────────────────────┤
│               Configuration Manager                      │
└─────────────────────────────────────────────────────────┘
```

### Component Description

#### Core Components

1. **File Monitor Worker**
   - Watches specified directories for changes
   - Triggers automatic migrations when needed
   - Interval: 5 seconds (configurable)

2. **Idle Monitor Worker**
   - Tracks user activity
   - Auto-pauses timers after 5 minutes of inactivity
   - Prevents unnecessary time tracking
   - Interval: 1 minute (configurable)

3. **GitHub Sync Worker**
   - Periodically syncs with GitHub issues
   - Updates local issue data
   - Maintains consistency between local and remote
   - Interval: 5 minutes (configurable)

4. **Cleanup Worker**
   - Removes old backup files
   - Cleans temporary files
   - Manages log rotation
   - Interval: 1 hour (configurable)
   - Retention: 7 days (configurable)

5. **Metrics Worker**
   - Collects performance metrics
   - Monitors memory usage
   - Tracks task processing statistics
   - Interval: 1 minute (configurable)

6. **Health Check System**
   - Monitors daemon health
   - Reports status to health file
   - Enables external monitoring
   - Interval: 30 seconds (fixed)

## Installation and Setup

### Basic Installation

The daemon is automatically installed with FlowForge v2.0. No additional installation is required.

### Manual Start

```bash
# Start the daemon
./scripts/daemon/flowforge-daemon-control.sh start

# Check status
./scripts/daemon/flowforge-daemon-control.sh status

# Stop the daemon
./scripts/daemon/flowforge-daemon-control.sh stop
```

### System Service Setup

#### Linux (systemd)

```bash
# Enable systemd service (requires sudo)
sudo ./scripts/daemon/flowforge-daemon-control.sh enable-systemd

# Control via systemd
systemctl start flowforge-daemon
systemctl stop flowforge-daemon
systemctl status flowforge-daemon
systemctl enable flowforge-daemon  # Auto-start on boot
```

#### macOS (launchd)

```bash
# Enable launchd service
./scripts/daemon/flowforge-daemon-control.sh enable-launchd

# Control via launchctl
launchctl start com.flowforge.daemon
launchctl stop com.flowforge.daemon
```

## Configuration

### Configuration File

The daemon configuration is stored in `/config/daemon.json`:

```json
{
  "enabled": true,
  "workers": {
    "fileMonitor": {
      "enabled": true,
      "interval": 5000
    },
    "idleMonitor": {
      "enabled": true,
      "interval": 60000,
      "idleThreshold": 300000
    },
    "githubSync": {
      "enabled": true,
      "interval": 300000
    },
    "cleanup": {
      "enabled": true,
      "interval": 3600000,
      "maxAge": 7
    },
    "metrics": {
      "enabled": true,
      "interval": 60000
    }
  },
  "performance": {
    "maxMemoryMB": 128,
    "maxCpuPercent": 10,
    "workerTimeout": 30000
  },
  "logging": {
    "level": "info",
    "maxFiles": 10,
    "maxSizeMB": 10
  }
}
```

### Configuration Options

#### Worker Configuration

- **enabled**: Enable/disable specific worker
- **interval**: Execution interval in milliseconds
- **idleThreshold**: Time before considering session idle (idle monitor only)
- **maxAge**: Days to retain files (cleanup worker only)

#### Performance Configuration

- **maxMemoryMB**: Maximum memory usage (MB)
- **maxCpuPercent**: Maximum CPU usage percentage
- **workerTimeout**: Maximum time for worker execution (ms)

#### Logging Configuration

- **level**: Log level (debug, info, warn, error)
- **maxFiles**: Maximum number of log files to retain
- **maxSizeMB**: Maximum size per log file (MB)

### Reloading Configuration

Configuration can be reloaded without restarting:

```bash
./scripts/daemon/flowforge-daemon-control.sh reload
```

## Usage

### Command Line Interface

```bash
# Start daemon
./scripts/daemon/flowforge-daemon-control.sh start

# Stop daemon
./scripts/daemon/flowforge-daemon-control.sh stop

# Restart daemon
./scripts/daemon/flowforge-daemon-control.sh restart

# Check status
./scripts/daemon/flowforge-daemon-control.sh status

# View logs (last 50 lines)
./scripts/daemon/flowforge-daemon-control.sh logs

# View logs (last 100 lines)
./scripts/daemon/flowforge-daemon-control.sh logs 100

# Show metrics
./scripts/daemon/flowforge-daemon-control.sh metrics

# Clean old logs
./scripts/daemon/flowforge-daemon-control.sh clean

# Reload configuration
./scripts/daemon/flowforge-daemon-control.sh reload
```

### Monitoring

#### Health Status

The daemon writes health status to `/tmp/flowforge-daemon.health`:

```json
{
  "status": "healthy",
  "pid": 12345,
  "uptime": 3600000,
  "memory": 45.67,
  "workers": ["fileMonitor", "idleMonitor", "githubSync", "cleanup", "metrics"],
  "lastCheck": "2024-01-20T10:30:00.000Z"
}
```

#### Metrics

Performance metrics are stored in `~/.flowforge/logs/metrics.json`:

```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 3600000,
  "memory": {
    "heapUsed": 47890432,
    "heapTotal": 67108864
  },
  "stats": {
    "tasksProcessed": 150,
    "migrationsPerformed": 3,
    "errorsEncountered": 0
  }
}
```

#### Logs

Logs are stored in `~/.flowforge/logs/`:

- `daemon-YYYY-MM-DD.log`: Daily daemon logs
- `daemon-startup.log`: Startup logs
- `daemon-systemd.log`: Systemd service logs (Linux)
- `daemon-launchd.log`: Launchd service logs (macOS)

## Features

### Automatic File Migration

The daemon monitors key FlowForge files and automatically migrates them when changes are detected:

- Configuration files (`.json`)
- Command files (`.md`)
- Session data
- Task definitions

### Idle Detection

Prevents unnecessary time tracking by automatically pausing sessions when idle:

- Default threshold: 5 minutes
- Configurable via `idleThreshold`
- Creates notification when paused
- Preserves session state

### GitHub Integration

Keeps local data synchronized with GitHub:

- Syncs issue data every 5 minutes
- Updates issue status
- Maintains consistency
- Requires GitHub token configuration

### Performance Monitoring

Tracks system performance and resource usage:

- Memory usage monitoring
- CPU usage tracking
- Task processing statistics
- Error rate monitoring
- Automatic garbage collection when needed

### Automatic Cleanup

Maintains system hygiene:

- Removes old backup files (7+ days)
- Cleans temporary files
- Rotates log files
- Manages disk space

## Troubleshooting

### Common Issues

#### Daemon Won't Start

1. Check if another instance is running:
```bash
ps aux | grep flowforge-daemon
```

2. Remove stale PID file:
```bash
rm /tmp/flowforge-daemon.pid
```

3. Check logs for errors:
```bash
tail -100 ~/.flowforge/logs/daemon-*.log
```

#### High Memory Usage

1. Check current memory usage:
```bash
./scripts/daemon/flowforge-daemon-control.sh status
```

2. Adjust memory limit in config:
```json
{
  "performance": {
    "maxMemoryMB": 64
  }
}
```

3. Restart daemon:
```bash
./scripts/daemon/flowforge-daemon-control.sh restart
```

#### Workers Not Running

1. Check worker status in health file:
```bash
cat /tmp/flowforge-daemon.health | jq '.workers'
```

2. Verify worker configuration:
```bash
cat config/daemon.json | jq '.workers'
```

3. Check for errors in logs:
```bash
grep ERROR ~/.flowforge/logs/daemon-*.log
```

### Debug Mode

Enable debug logging for detailed information:

1. Edit `/config/daemon.json`:
```json
{
  "logging": {
    "level": "debug"
  }
}
```

2. Reload configuration:
```bash
./scripts/daemon/flowforge-daemon-control.sh reload
```

### Signal Handling

The daemon responds to various signals:

- **SIGTERM**: Graceful shutdown
- **SIGINT**: Graceful shutdown (Ctrl+C)
- **SIGUSR1**: Reload configuration
- **SIGUSR2**: Dump statistics to console

Example:
```bash
# Reload configuration
kill -USR1 $(cat /tmp/flowforge-daemon.pid)

# Dump stats
kill -USR2 $(cat /tmp/flowforge-daemon.pid)
```

## Performance Considerations

### Resource Usage

- **Memory**: Typically uses 20-50MB
- **CPU**: Less than 1% during normal operation
- **Disk I/O**: Minimal, mostly log writes
- **Network**: Only for GitHub sync (if enabled)

### Optimization Tips

1. **Adjust Worker Intervals**: Increase intervals for less critical workers
2. **Disable Unused Workers**: Turn off workers you don't need
3. **Limit Log Retention**: Reduce `maxFiles` and `maxAge`
4. **Monitor Metrics**: Review metrics regularly for anomalies

## Security

### Best Practices

1. **File Permissions**: Ensure proper permissions on configuration files
2. **Token Security**: Store GitHub tokens securely
3. **Log Privacy**: Be aware logs may contain sensitive data
4. **Service Account**: Run daemon as non-root user

### Audit Trail

The daemon maintains an audit trail of:
- Configuration changes
- Migration operations
- Error conditions
- Session modifications

## Integration

### FlowForge Commands

The daemon integrates with FlowForge commands:

- Session management aware
- Timer synchronization
- Task tracking integration
- Rule enforcement support

### External Monitoring

The daemon can be monitored by external tools:

- Health endpoint: `/tmp/flowforge-daemon.health`
- Metrics file: `~/.flowforge/logs/metrics.json`
- Standard logging output
- Process monitoring via PID file

## API Reference

### Node.js API

```javascript
const FlowForgeDaemon = require('./scripts/daemon/flowforge-daemon');

// Create daemon instance
const daemon = new FlowForgeDaemon();

// Event listeners
daemon.on('started', () => console.log('Daemon started'));
daemon.on('stopped', () => console.log('Daemon stopped'));

// Start daemon
await daemon.start();

// Stop daemon
await daemon.stop();
```

### Worker Development

To add a custom worker:

```javascript
// In flowforge-daemon.js
async customWorkerTask() {
  // Your worker logic here
  console.log('Custom worker executing');
}

// Register worker in start() method
if (this.config.workers.customWorker?.enabled) {
  this.startWorker('customWorker', this.customWorkerTask.bind(this));
}
```

## Version History

### v2.0.0 (Current)
- Initial daemon implementation
- Five core workers
- Systemd/launchd support
- Automatic migration system
- Performance monitoring

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Open an issue on GitHub
4. Contact the FlowForge team

---

*FlowForge Daemon Service - Keeping your development environment optimized and synchronized*