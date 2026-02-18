# FlowForge Developer Namespace Separation

## Overview

Developer Namespace Separation (Issue #548) provides complete isolation for multiple developers working simultaneously on the same FlowForge repository. This STANDARD implementation ensures zero conflicts when 6+ developers are actively working.

## Architecture

### Directory Structure

```
.flowforge/
├── dev-{id}/                     # Developer namespace
│   ├── sessions/
│   │   ├── current.json          # Current session state
│   │   ├── history/              # Session history archive
│   │   └── locks/                # Session-specific locks
│   ├── cache/
│   │   ├── time-tracking.json    # Time tracking cache
│   │   ├── provider-cache.json   # Provider data cache
│   │   └── command-cache.json    # Command output cache
│   ├── workspace/
│   │   ├── temp/                 # Temporary files
│   │   └── drafts/               # Work drafts
│   ├── logs/                     # Developer-specific logs
│   └── config.json               # Developer configuration
│
├── shared/                       # Shared team resources
│   ├── active-developers.json   # Active developer registry
│   ├── task-assignments.json    # Task ownership tracking
│   └── coordination.json        # Inter-developer messages
│
└── locks/                        # Global critical file locks
    └── critical-files.lock
```

## Core Components

### 1. Namespace Manager (`scripts/namespace/manager.sh`)

The core namespace management system provides:

- **Developer Detection**: Automatic detection via git config or environment variable
- **Namespace Initialization**: Creates isolated directory structure
- **Path Resolution**: Maps resources to namespaced paths
- **Lock Management**: Session and critical file locking
- **Cache Management**: Isolated cache with TTL support
- **Cleanup**: Automatic temporary file cleanup

#### Key Functions

```bash
# Get current developer ID
dev_id=$(get_developer_id)

# Initialize namespace
initialize_namespace "$dev_id"

# Get namespaced paths
session_file=$(get_session_file)
cache_file=$(get_cache_file "my-data.json")

# Lock management
acquire_session_lock "$dev_id" "$session_id"
release_session_lock "$dev_id" "$session_id"

# Critical file locking
acquire_critical_lock "tasks.json"
release_critical_lock "tasks.json"
```

### 2. Session Isolation (`scripts/namespace/lib/isolation.sh`)

Provides complete session isolation:

```bash
# Create isolated session
session_id=$(create_isolated_session "$dev_id" "$task_id")

# End and archive session
end_isolated_session "$dev_id" "$session_id"

# Resource management
claim_resource "$dev_id" "issue-123"
release_resource "$dev_id" "issue-123"

# Check for conflicts
owner=$(check_resource_lock "issue-123")

# Team coordination
broadcast_message "$dev_id" "Starting work on auth module"
messages=$(read_messages "$dev_id")
```

### 3. Cache Management (`scripts/namespace/lib/cache.sh`)

Isolated cache system with metadata and TTL:

```bash
# Cache with TTL
write_cache_with_metadata "data.json" "$data" 3600  # 1 hour TTL

# Read with TTL check
data=$(read_cache_with_ttl "data.json")

# Provider caching
cache_provider_data "github" "$github_data"
cached=$(get_provider_cache "github")

# Time tracking (never expires)
cache_time_tracking "$session_id" "$time_data"
recovered=$(recover_time_tracking "$session_id")

# Cache maintenance
enforce_cache_limits "$dev_id" 104857600  # 100MB limit
clear_developer_cache "$dev_id"
```

## Usage

### Setting Up Developer Environment

#### Method 1: Environment Variable
```bash
export FLOWFORGE_DEVELOPER=dev1
./scripts/namespace/integrate.sh init
```

#### Method 2: Git Config
```bash
git config --global user.email "alice@flowforge.dev"
# Developer auto-detected from team config
```

#### Method 3: Direct Initialization
```bash
./scripts/namespace/integrate.sh init dev1
```

### Integration with FlowForge Commands

The namespace system integrates seamlessly with existing commands:

```bash
# Session management
source scripts/namespace/integrate.sh
integrate_session_start "$task_id"
integrate_session_end

# Check for conflicts
check_task_conflict "issue-123"

# View active developers
show_active_developers
```

### Migrating Existing Data

For developers with existing FlowForge data:

```bash
# Migrate current data to namespace
./scripts/namespace/integrate.sh migrate dev1

# Or auto-detect developer
FLOWFORGE_DEVELOPER=dev1
./scripts/namespace/integrate.sh migrate
```

## Team Configuration

The system uses the team configuration file (`.flowforge/team/config.json`) to map developers:

```json
{
  "team": {
    "developers": {
      "dev1": {
        "name": "Alice Johnson",
        "email": "alice@flowforge.dev",
        "github": "alice-dev",
        "namespace": "dev1"
      }
    }
  }
}
```

## Backward Compatibility

The system maintains full backward compatibility:

1. **Legacy Mode**: If no developer ID is detected, falls back to traditional paths
2. **Gradual Migration**: Existing data can be migrated when ready
3. **Mixed Mode**: Some developers can use namespaces while others use legacy

## Conflict Prevention

### Task Locking
```bash
# Check if task is locked
owner=$(check_resource_lock "issue-123")
if [[ -n "$owner" ]]; then
    echo "Task is being worked on by $owner"
fi

# Claim task
result=$(claim_resource "$dev_id" "issue-123")
if [[ "$result" == "success" ]]; then
    echo "Task claimed successfully"
fi
```

### Critical File Protection
```bash
# Protect critical files during modification
acquire_critical_lock "tasks.json"
# Modify tasks.json
release_critical_lock "tasks.json"
```

### Parallel Work Detection
```bash
# Find who's working on related tasks
detect_parallel_work "feature-auth-*"
# Output: dev1:feature-auth-login
#         dev2:feature-auth-oauth
```

## Team Coordination

### Active Developer Registry
```bash
# Register when starting work
register_active_developer "$dev_id"

# Deregister when ending session
deregister_active_developer "$dev_id"
```

### Inter-Developer Messaging
```bash
# Broadcast message to team
broadcast_message "$dev_id" "Deploying to staging, please hold commits"

# Read unread messages
messages=$(read_messages "$dev_id")
echo "$messages" | jq '.[] | "\(.from): \(.message)"'
```

## Best Practices

1. **Always Initialize**: Run namespace init when setting up FlowForge
2. **Set Developer ID**: Use environment variable or git config
3. **Check Conflicts**: Always check for task conflicts before starting work
4. **Clean Regularly**: Namespaces auto-clean, but manual cleanup helps
5. **Communicate**: Use messaging for coordination

## Performance Considerations

- **Cache Limits**: 100MB per developer by default
- **TTL Management**: Provider cache: 5 minutes, Command cache: 1 minute
- **Lock Timeouts**: 30 seconds for critical files
- **Stale Lock Detection**: Automatically removes locks older than 5 minutes

## Troubleshooting

### Developer Not Detected
```bash
# Check detection
source scripts/namespace/manager.sh
echo "Developer ID: $(get_developer_id)"

# Force developer ID
export FLOWFORGE_DEVELOPER=dev1
```

### Lock Conflicts
```bash
# Check lock status
ls -la .flowforge/locks/
ls -la .flowforge/dev-dev1/sessions/locks/

# Force release (emergency only)
rm -f .flowforge/locks/tasks.json.lock
```

### Cache Issues
```bash
# Check cache size
du -sh .flowforge/dev-dev1/cache/

# Clear cache
./scripts/namespace/integrate.sh clean dev1
```

## Testing

Run the comprehensive test suite:

```bash
# Run all namespace tests
bash tests/namespace/manager.test.sh

# Expected output: All 32 tests pass
```

## Security Considerations

1. **File Permissions**: Namespace directories use standard Unix permissions
2. **No Cross-Namespace Access**: Developers cannot access other namespaces
3. **Atomic Operations**: All lock operations are atomic
4. **Safe Cleanup**: Only removes temporary files, preserves history

## Future Enhancements

- [ ] Web dashboard for namespace monitoring
- [ ] Automatic namespace archival for inactive developers
- [ ] Cross-namespace file sharing with permissions
- [ ] Real-time collaboration features
- [ ] Namespace quotas and resource limits

---

*Implementation Date: September 2024*
*Issue: #548 - Developer Namespace Separation*
*Status: Phase 1 Complete - Core Implementation*