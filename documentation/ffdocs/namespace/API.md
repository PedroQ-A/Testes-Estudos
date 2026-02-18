# FlowForge Namespace API Reference

## 📚 Complete Function Reference

This document provides comprehensive API documentation for all FlowForge namespace separation functions, commands, and interfaces.

## 🎯 Command Line Interface

### Core Commands

#### `dev:namespace-init`

Initialize a developer namespace with isolated workspace.

**Syntax:**
```bash
./run_ff_namespace.sh dev:namespace-init [dev_id] [--auto]
```

**Parameters:**
- `dev_id` (optional): Developer identifier (string, 1-50 chars, alphanumeric + dash/underscore)
- `--auto` (optional): Skip interactive prompts

**Returns:**
- Exit code 0: Success
- Exit code 1: Error (invalid dev_id, permission denied, etc.)

**Example:**
```bash
# Interactive initialization
./run_ff_namespace.sh dev:namespace-init

# Specific developer
./run_ff_namespace.sh dev:namespace-init alice

# Automated initialization
./run_ff_namespace.sh dev:namespace-init bob --auto
```

**Output:**
```
╔══════════════════════════════════════════════════════╗
║            Namespace Initialized Successfully        ║
╚══════════════════════════════════════════════════════╝

Developer: alice
Name: Alice Johnson
Email: alice@company.com
Role: fullstack

Namespace structure created:
  /project/.flowforge/dev-alice/
  ├── sessions/       # Session management
  ├── cache/          # Developer-specific cache
  ├── workspace/      # Working files
  ├── logs/           # Developer logs
  └── config.json     # Namespace configuration
```

#### `dev:switch`

Switch between developer namespaces seamlessly.

**Syntax:**
```bash
./run_ff_namespace.sh dev:switch <dev_id>
```

**Parameters:**
- `dev_id` (required): Target developer identifier

**Returns:**
- Exit code 0: Switch successful
- Exit code 1: Developer not found or namespace error

**Example:**
```bash
./run_ff_namespace.sh dev:switch carol
```

**Output:**
```
╔══════════════════════════════════════════════════════╗
║           FlowForge Namespace Switch                ║
╚══════════════════════════════════════════════════════╝

Switching from: bob → carol
✅ Environment updated
✅ Session preserved
✅ Cache synchronized

Current namespace status:
  Developer: carol
  Namespace: /project/.flowforge/dev-carol/
```

#### `dev:namespace-status`

Display comprehensive namespace status and team information.

**Syntax:**
```bash
./run_ff_namespace.sh dev:namespace-status [--verbose]
```

**Parameters:**
- `--verbose` (optional): Show detailed information

**Returns:**
- Exit code 0: Always successful
- Outputs JSON or formatted text

**Example:**
```bash
./run_ff_namespace.sh dev:namespace-status
```

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║                    FlowForge Team Status                     ║
╚══════════════════════════════════════════════════════════════╝

Active Developers (3/6):
👤 alice - Working on: AUTH-123 (2h 15m)
👤 bob - Working on: API-456 (45m)
👤 carol - Working on: UI-789 (1h 30m)

Your Status:
🔧 Developer: alice
📂 Namespace: /project/.flowforge/dev-alice/
📋 Active Session: AUTH-123
💾 Cache Size: 156.2 MB
🕒 Session Time: 2h 15m
```

#### `dev:namespace-clean`

Clean namespace temporary files and optimize storage.

**Syntax:**
```bash
./run_ff_namespace.sh dev:namespace-clean [dev_id] [--cache|--logs|--temp|--all]
```

**Parameters:**
- `dev_id` (optional): Specific developer (defaults to current)
- `--cache`: Clean cache files only
- `--logs`: Clean log files only
- `--temp`: Clean temporary files only
- `--all`: Clean all removable files

**Returns:**
- Exit code 0: Cleanup successful
- Exit code 1: Permission error or invalid developer

**Example:**
```bash
# Clean current developer's temporary files
./run_ff_namespace.sh dev:namespace-clean --temp

# Clean specific developer's cache
./run_ff_namespace.sh dev:namespace-clean bob --cache

# Full cleanup
./run_ff_namespace.sh dev:namespace-clean --all
```

### Session Commands

#### `session:start`

Start a development session with namespace awareness.

**Syntax:**
```bash
./run_ff_namespace.sh session:start <task_id> [--branch=<name>] [--provider=<name>]
```

**Parameters:**
- `task_id` (required): Task/ticket identifier
- `--branch` (optional): Custom branch name
- `--provider` (optional): Task provider (github, notion, linear)

**Returns:**
- Exit code 0: Session started
- Exit code 1: Task not found, already active session, etc.

**Example:**
```bash
./run_ff_namespace.sh session:start AUTH-123
./run_ff_namespace.sh session:start AUTH-124 --branch=feature/auth-v2
./run_ff_namespace.sh session:start NOTION-456 --provider=notion
```

#### `session:end`

End current development session with proper cleanup.

**Syntax:**
```bash
./run_ff_namespace.sh session:end [message] [--no-commit] [--force]
```

**Parameters:**
- `message` (optional): Session end message
- `--no-commit`: Skip automatic commit
- `--force`: Force end even with uncommitted changes

**Returns:**
- Exit code 0: Session ended
- Exit code 1: No active session or commit failed

**Example:**
```bash
./run_ff_namespace.sh session:end "Completed authentication module"
./run_ff_namespace.sh session:end --no-commit
./run_ff_namespace.sh session:end --force
```

#### `session:pause`

Pause current session temporarily.

**Syntax:**
```bash
./run_ff_namespace.sh session:pause [reason]
```

**Parameters:**
- `reason` (optional): Pause reason for tracking

**Example:**
```bash
./run_ff_namespace.sh session:pause "Lunch break"
```

#### `session:resume`

Resume paused session.

**Syntax:**
```bash
./run_ff_namespace.sh session:resume
```

**Example:**
```bash
./run_ff_namespace.sh session:resume
```

## 🔧 Bash API Functions

### Namespace Manager Functions

#### `initialize_namespace(dev_id)`

Create complete namespace structure for developer.

**Parameters:**
- `dev_id`: Developer identifier (validated)

**Returns:**
- 0: Success
- 1: Error (invalid ID, permission denied, etc.)

**Usage:**
```bash
source scripts/namespace/manager.sh
initialize_namespace "alice"
```

**Creates:**
- Directory structure
- Configuration files
- Initial session state
- Cache directories
- Log files

#### `get_developer_id()`

Get currently active developer identifier.

**Returns:**
- String: Developer ID or empty if none active

**Usage:**
```bash
source scripts/namespace/manager.sh
current_dev=$(get_developer_id)
if [[ -n "$current_dev" ]]; then
    echo "Current developer: $current_dev"
fi
```

#### `ensure_namespace()`

Verify and repair namespace integrity.

**Returns:**
- 0: Namespace valid or repaired
- 1: Namespace corrupted beyond repair

**Usage:**
```bash
source scripts/namespace/manager.sh
if ensure_namespace; then
    echo "Namespace ready"
else
    echo "Namespace repair failed"
fi
```

#### `cleanup_namespace(dev_id, cleanup_type)`

Clean namespace files based on type.

**Parameters:**
- `dev_id`: Developer identifier
- `cleanup_type`: "cache", "logs", "temp", or "all"

**Returns:**
- 0: Cleanup successful
- 1: Error during cleanup

**Usage:**
```bash
source scripts/namespace/manager.sh
cleanup_namespace "alice" "cache"
```

#### `validate_developer_id(dev_id)`

Validate developer identifier format and constraints.

**Parameters:**
- `dev_id`: Developer identifier to validate

**Returns:**
- 0: Valid developer ID
- 1: Invalid format or reserved name

**Usage:**
```bash
source scripts/namespace/manager.sh
if validate_developer_id "$user_input"; then
    echo "Valid developer ID"
else
    echo "Invalid developer ID format"
fi
```

### Session Integration Functions

#### `get_session_file_with_namespace()`

Get namespace-aware session file path.

**Returns:**
- String: Path to current session file

**Usage:**
```bash
source scripts/namespace/session-integration.sh
session_file=$(get_session_file_with_namespace)
echo "Session file: $session_file"
```

#### `start_session_with_namespace(task_id, branch_name)`

Start session with namespace isolation.

**Parameters:**
- `task_id`: Task identifier
- `branch_name`: Git branch name (optional)

**Returns:**
- 0: Session started successfully
- 1: Error (task not found, session active, etc.)

**Usage:**
```bash
source scripts/namespace/session-integration.sh
start_session_with_namespace "AUTH-123" "feature/auth"
```

#### `end_session_with_namespace(message, options)`

End session with namespace cleanup.

**Parameters:**
- `message`: End session message
- `options`: Array of options (no-commit, force, etc.)

**Returns:**
- 0: Session ended successfully
- 1: Error during session end

**Usage:**
```bash
source scripts/namespace/session-integration.sh
end_session_with_namespace "Task completed" ("force")
```

### Git Integration Functions

#### `create_developer_branch(dev_id, task_id, branch_name)`

Create namespace-aware Git branch.

**Parameters:**
- `dev_id`: Developer identifier
- `task_id`: Task identifier
- `branch_name`: Custom branch name (optional)

**Returns:**
- 0: Branch created successfully
- 1: Git error or branch exists

**Usage:**
```bash
source scripts/namespace/git-sync.sh
create_developer_branch "alice" "AUTH-123" "feature/auth"
```

#### `sync_developer_branches(dev_id)`

Synchronize developer branches with remote.

**Parameters:**
- `dev_id`: Developer identifier

**Returns:**
- 0: Sync successful
- 1: Sync error or conflicts

**Usage:**
```bash
source scripts/namespace/git-sync.sh
sync_developer_branches "alice"
```

#### `backup_git_state(dev_id)`

Backup current Git state for developer.

**Parameters:**
- `dev_id`: Developer identifier

**Returns:**
- 0: Backup created
- 1: Backup failed

**Usage:**
```bash
source scripts/namespace/git-sync.sh
backup_git_state "alice"
```

### Team Coordination Functions

#### `get_active_developers()`

Get list of currently active developers.

**Returns:**
- JSON array of active developer objects

**Usage:**
```bash
source scripts/namespace/team-reporting.sh
active_devs=$(get_active_developers)
echo "$active_devs" | jq '.[]'
```

#### `register_developer_activity(dev_id, activity)`

Register developer activity for coordination.

**Parameters:**
- `dev_id`: Developer identifier
- `activity`: Activity description

**Returns:**
- 0: Activity registered
- 1: Registration failed

**Usage:**
```bash
source scripts/namespace/team-reporting.sh
register_developer_activity "alice" "Started task AUTH-123"
```

#### `coordinate_task_assignment(task_id, dev_id)`

Coordinate task assignments to prevent conflicts.

**Parameters:**
- `task_id`: Task identifier
- `dev_id`: Developer identifier

**Returns:**
- 0: Task available or assigned
- 1: Task conflict or error

**Usage:**
```bash
source scripts/namespace/team-reporting.sh
if coordinate_task_assignment "AUTH-123" "alice"; then
    echo "Task assigned successfully"
else
    echo "Task conflict detected"
fi
```

## 📁 File System API

### Configuration Files

#### Team Configuration (`team/config.json`)

**Location:** `.flowforge/team/config.json`

**Schema:**
```json
{
  "team": {
    "name": "string",
    "max_developers": "number",
    "default_namespace_quota": "string",
    "session_timeout": "string",
    "developers": {
      "{dev_id}": {
        "name": "string",
        "email": "string",
        "role": "string",
        "timezone": "string",
        "preferences": {
          "auto_cleanup": "boolean",
          "git_auto_push": "boolean",
          "session_backup": "boolean"
        }
      }
    }
  },
  "security": {
    "require_team_membership": "boolean",
    "max_concurrent_sessions": "number",
    "audit_logging": "boolean"
  },
  "performance": {
    "cache_ttl": "number",
    "cleanup_interval": "string",
    "log_rotation_size": "string"
  }
}
```

#### Namespace Configuration (`dev-{id}/config.json`)

**Location:** `.flowforge/dev-{dev_id}/config.json`

**Schema:**
```json
{
  "developer": {
    "id": "string",
    "namespace_version": "string",
    "created_at": "ISO8601",
    "last_active": "ISO8601"
  },
  "settings": {
    "auto_cleanup": "boolean",
    "session_timeout": "string",
    "git_auto_push": "boolean",
    "cache_size_limit": "string",
    "log_level": "string"
  },
  "state": {
    "active_session": "string|null",
    "last_task_id": "string",
    "git_branch": "string",
    "workspace_size": "string"
  }
}
```

#### Session State (`dev-{id}/sessions/current.json`)

**Location:** `.flowforge/dev-{dev_id}/sessions/current.json`

**Schema:**
```json
{
  "active": "boolean",
  "sessionId": "string|null",
  "startTime": "ISO8601|null",
  "taskId": "string|null",
  "developerId": "string",
  "branch": "string|null",
  "provider": "string|null",
  "metadata": {
    "task_title": "string",
    "estimated_time": "string",
    "actual_time": "string"
  }
}
```

### Cache Files

#### Git Status Cache (`dev-{id}/cache/git-status.json`)

**Schema:**
```json
{
  "timestamp": "ISO8601",
  "branch": "string",
  "status": "string",
  "uncommitted_changes": "number",
  "untracked_files": "number",
  "remote_status": "string"
}
```

#### Task Data Cache (`dev-{id}/cache/task-data.json`)

**Schema:**
```json
{
  "tasks": {
    "{task_id}": {
      "title": "string",
      "description": "string",
      "status": "string",
      "assignee": "string",
      "provider": "string",
      "cached_at": "ISO8601"
    }
  }
}
```

## 🌐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FLOWFORGE_DEVELOPER` | Current active developer ID | `alice` |
| `FLOWFORGE_NAMESPACE_DIR` | Active namespace directory | `/project/.flowforge/dev-alice` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `FLOWFORGE_ROOT_OVERRIDE` | Override project root | Auto-detect | `/custom/project/path` |
| `FLOWFORGE_LOG_LEVEL` | Logging verbosity | `INFO` | `DEBUG` |
| `FLOWFORGE_CACHE_TTL` | Cache TTL in seconds | `3600` | `1800` |
| `FLOWFORGE_SESSION_TIMEOUT` | Session timeout | `8h` | `4h` |
| `FLOWFORGE_AUTO_CLEANUP` | Enable auto cleanup | `true` | `false` |
| `LOCK_TIMEOUT` | File lock timeout | `30` | `60` |

### Provider Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `GITHUB_TOKEN` | GitHub API token | GitHub provider |
| `NOTION_TOKEN` | Notion API token | Notion provider |
| `LINEAR_API_KEY` | Linear API key | Linear provider |

## 🔌 Hook API

### Pre-commit Hook

Validates namespace state before commits.

**Location:** `.git/hooks/pre-commit`

**Integration:**
```bash
# Add to pre-commit hook
source scripts/namespace/hooks-integration.sh
validate_namespace_before_commit
```

### Post-commit Hook

Updates team coordination after commits.

**Location:** `.git/hooks/post-commit`

**Integration:**
```bash
# Add to post-commit hook
source scripts/namespace/hooks-integration.sh
update_team_coordination_after_commit
```

## 🚨 Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| 1 | General error | Check logs |
| 2 | Invalid developer ID | Use valid format |
| 3 | Permission denied | Fix file permissions |
| 4 | Namespace not found | Initialize namespace |
| 5 | Session conflict | End active session |
| 6 | Git error | Check git status |
| 7 | Provider error | Check provider config |
| 8 | Configuration error | Validate JSON |
| 9 | Network error | Check connectivity |
| 10 | Disk space error | Free disk space |

## 📊 Performance Metrics

### Timing Benchmarks

| Operation | Typical Time | Max Acceptable |
|-----------|--------------|----------------|
| Namespace init | 2-5 seconds | 10 seconds |
| Developer switch | 1-2 seconds | 5 seconds |
| Session start | 3-8 seconds | 15 seconds |
| Session end | 2-5 seconds | 10 seconds |
| Status check | 0.5-1 second | 3 seconds |

### Resource Usage

| Resource | Per Developer | Team of 6 |
|----------|---------------|-----------|
| Disk space | 50-200 MB | 300-1200 MB |
| Memory | 10-50 MB | 60-300 MB |
| File handles | 20-50 | 120-300 |

## 🔍 Debugging API

### Enable Debug Mode

```bash
export FLOWFORGE_DEBUG="true"
export FLOWFORGE_LOG_LEVEL="DEBUG"
```

### Debug Functions

```bash
# Enable function tracing
set -x

# Source debug utilities
source scripts/namespace/lib/error-handling.sh

# Use debug logging
ff_log_debug "Debug message"
ff_log_info "Info message"
ff_log_error "Error message"
```

### Performance Profiling

```bash
# Time namespace operations
time ./run_ff_namespace.sh dev:namespace-init alice

# Profile function calls
bash -x ./run_ff_namespace.sh session:start AUTH-123 2> profile.log
```

---

**Document Version**: 2.0.0
**Last Updated**: 2024-09-18
**API Coverage**: 100% (all functions documented)
**Target Audience**: Developers, Integrators