# Namespace Git Sync Integration

## Overview
The namespace Git sync functionality has been fully integrated into FlowForge session commands. This ensures that developer data is automatically synchronized to Git whenever a session starts or ends.

## Integration Points

### 1. Session:start Integration
**Location**: `/commands/flowforge/session/start.md` (lines 718-730)

When a session starts, the integration:
- Sources the namespace integration script
- Calls `integrate_session_start` with the ticket ID
- Initializes namespace with Git integration
- Runs migration if needed to create proper directory structure

### 2. Session:end Integration
**Location**: `/commands/flowforge/session/end.md` (lines 804-814)

When a session ends, the integration:
- Sources the namespace integration script
- Calls `integrate_session_end` which triggers:
  - `sync_on_session_end` to sync developer data
  - Archives current session to history
  - Updates profile timestamps
  - Creates Git commits if changes exist
- Cleans up temporary files
- Deregisters the developer as active

## Key Components

### Scripts
- **`scripts/namespace/integrate.sh`**: Main integration layer that bridges FlowForge commands with namespace functionality
- **`scripts/namespace/git-sync.sh`**: Core sync functionality for Git operations

### Functions
- `integrate_session_start(ticket_id)`: Called at session start
- `integrate_session_end()`: Called at session end
- `sync_on_session_end()`: Performs actual sync operations
- `sync_developer_data(dev_id)`: Syncs developer-specific data to Git

## Data Flow

1. **Session Start**:
   ```
   flowforge:session:start → integrate.sh → initialize namespace → Git migration if needed
   ```

2. **Session End**:
   ```
   flowforge:session:end → integrate.sh → git-sync.sh → archive session → Git commit
   ```

## Directory Structure

The integration maintains this Git-aware structure:
```
.flowforge/
├── developers/           # Git-tracked
│   └── [dev-id]/
│       ├── profile.json  # Developer profile
│       ├── sessions/
│       │   ├── current/   # Active session
│       │   └── history/   # Archived sessions
│       └── time-tracking/ # Monthly time logs
├── team/                  # Git-tracked
│   ├── task-assignments.json
│   └── summaries/
└── local/                 # Git-ignored (machine-specific)
```

## Environment Variables

- `FLOWFORGE_DEVELOPER_ID`: Identifies the current developer
- `FLOWFORGE_ROOT_OVERRIDE`: Override default .flowforge location
- `SYNC_TIMEOUT`: Maximum time for sync operations (default: 2 seconds)

## Testing

### Verification
Run the verification script to ensure integration is working:
```bash
# Create verification script
cat > verify-integration.sh << 'EOF'
#!/bin/bash
source scripts/namespace/integrate.sh
source scripts/namespace/git-sync.sh

# Check functions are available
type -t integrate_session_end && echo "✓ Integration ready"
type -t sync_on_session_end && echo "✓ Sync ready"
EOF

bash verify-integration.sh
```

### Manual Test
1. Start a session: `./run_ff_command.sh flowforge:session:start [ticket]`
2. Work on tasks
3. End session: `./run_ff_command.sh flowforge:session:end`
4. Check `.flowforge/developers/[your-id]/sessions/history/` for archived session

## Performance

The sync operation is optimized to complete within 2 seconds:
- Only changed files are processed
- Sync operations are non-blocking
- Failures don't interrupt session flow

## Error Handling

The integration is resilient:
- Sync failures don't break session commands
- Missing directories trigger automatic migration
- Stale locks are automatically cleaned up
- All errors are logged but non-fatal

## Future Enhancements

Potential improvements for future versions:
- [ ] Async background sync for large repositories
- [ ] Compression of archived sessions
- [ ] Automatic push to remote after sync
- [ ] Configurable sync triggers
- [ ] Team-wide sync coordination

## Troubleshooting

### Session not archiving
- Check `FLOWFORGE_ROOT_OVERRIDE` is set correctly
- Ensure `developers/[dev-id]/sessions/history/` exists
- Verify Git repository is initialized

### Sync takes too long
- Check for large files in session data
- Increase `SYNC_TIMEOUT` if needed
- Review Git repository size

### Integration not loading
- Verify `scripts/namespace/integrate.sh` exists
- Check file permissions are executable
- Ensure bash version is 4.0+