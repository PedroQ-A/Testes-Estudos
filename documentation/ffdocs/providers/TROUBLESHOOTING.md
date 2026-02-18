# FlowForge Provider Troubleshooting Guide

**Version**: 2.0.0
**Last Updated**: September 2025
**For**: Monday Deployment Team Support

---

## 🚨 Emergency Quick Fixes

### 1. System Completely Down

```bash
# Emergency reset to working state
echo "🚨 Emergency System Reset"

# Stop all sessions
pkill -f "flowforge:session"

# Remove locks
rm -f .flowforge/.lock

# Reset to default provider
rm -rf .flowforge/providers/
node scripts/provider-bridge.js get-provider  # Auto-creates default

# Test basic functionality
node scripts/provider-bridge.js list-tasks
```

### 2. File Corruption

```bash
# Quick JSON recovery
if ! jq empty .flowforge/tasks.json 2>/dev/null; then
  echo "🔄 JSON corrupted, restoring..."

  # Try backup
  BACKUP=$(ls -t .flowforge/backups/tasks*.json 2>/dev/null | head -1)
  if [ -n "$BACKUP" ]; then
    cp "$BACKUP" .flowforge/tasks.json
    echo "✅ Restored from: $BACKUP"
  else
    # Create minimal structure
    echo '{"version":"2.0.0","tasks":[],"metadata":{"created":"'$(date -Iseconds)'"}}' > .flowforge/tasks.json
    echo "✅ Created fresh tasks.json"
  fi
fi
```

### 3. Provider Connection Failed

```bash
# Reset provider configuration
cat > .flowforge/providers/config.json << 'EOF'
{
  "version": "2.0.0",
  "mode": "json",
  "defaultProvider": "json-default",
  "providers": [
    {
      "name": "json-default",
      "type": "json",
      "enabled": true,
      "settings": {
        "filePath": ".flowforge/tasks.json",
        "autoSave": true
      }
    }
  ]
}
EOF

echo "✅ Reset to safe JSON-only configuration"
```

---

## 📋 Troubleshooting Matrix

| Symptom | Likely Cause | Quick Fix | Section |
|---------|--------------|-----------|---------|
| `❌ No action specified` | Command syntax error | Check command format | [Command Issues](#command-issues) |
| `❌ Task not found` | Invalid task ID | Verify task exists | [Task Issues](#task-issues) |
| `❌ Authentication failed` | Invalid token | Check environment vars | [Auth Issues](#authentication-issues) |
| `❌ File is locked` | Stale lock file | Remove old lock | [Lock Issues](#file-locking-issues) |
| `❌ JSON syntax error` | Corrupted data file | Restore from backup | [Data Issues](#data-corruption) |
| `⏳ Slow response` | Performance degradation | Enable caching | [Performance Issues](#performance-issues) |

---

## 🔧 Command Issues

### Invalid Command Syntax

```bash
# ❌ Wrong
node scripts/provider-bridge.js

# ✅ Correct
node scripts/provider-bridge.js list-tasks

# ❌ Wrong
node scripts/provider-bridge.js get-task 123

# ✅ Correct
node scripts/provider-bridge.js get-task --id=123
```

### Command Not Found

```bash
# Check if provider bridge exists
if [ ! -f scripts/provider-bridge.js ]; then
  echo "❌ provider-bridge.js not found"
  echo "🔄 Run: git pull origin main"
  exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not installed"
  echo "🔄 Install Node.js first"
  exit 1
fi

# Check dependencies
if [ ! -d node_modules ]; then
  echo "🔄 Installing dependencies..."
  npm install
fi
```

### Permission Denied

```bash
# Fix script permissions
chmod +x scripts/provider-bridge.js

# Fix file permissions
chmod 644 .flowforge/tasks.json
chmod 644 .flowforge/providers/config.json
chmod 755 .flowforge/

# Check ownership
ls -la .flowforge/
# If needed: chown -R $USER:$USER .flowforge/
```

### Environment Variables Not Set

```bash
# Check required variables
echo "Checking environment variables:"
echo "GITHUB_TOKEN: ${GITHUB_TOKEN:+SET}"
echo "NOTION_API_KEY: ${NOTION_API_KEY:+SET}"
echo "USER: ${USER:+SET}"

# Set missing variables
if [ -z "$GITHUB_TOKEN" ]; then
  echo "⚠️  GITHUB_TOKEN not set"
  echo "Run: export GITHUB_TOKEN='your_token'"
fi
```

---

## 📝 Task Issues

### Task Not Found

```bash
# Debug task existence
TASK_ID="214"

echo "🔍 Debugging task #$TASK_ID"

# Check in tasks.json
if [ -f .flowforge/tasks.json ]; then
  TASK_EXISTS=$(jq ".tasks[] | select(.id == $TASK_ID)" .flowforge/tasks.json)
  if [ -n "$TASK_EXISTS" ]; then
    echo "✅ Task found in tasks.json"
  else
    echo "❌ Task not found in tasks.json"
    echo "Available tasks:"
    jq -r '.tasks[] | "  #\(.id): \(.title)"' .flowforge/tasks.json | head -5
  fi
fi

# Check with provider
node scripts/provider-bridge.js verify-task --id="$TASK_ID" 2>&1 || echo "Task verification failed"
```

### Invalid Task ID

```bash
# Validate task ID format
validate_task_id() {
  local id="$1"

  if [[ ! "$id" =~ ^[0-9]+$ ]]; then
    echo "❌ Invalid task ID format: $id"
    echo "💡 Task IDs must be numbers"
    return 1
  fi

  if [ "$id" -ge 300 ]; then
    echo "⚠️  Task ID $id might be a PR number"
    echo "💡 Use issue numbers, not PR numbers"
    return 1
  fi

  if [ "$id" -gt 10000 ]; then
    echo "❌ Suspicious task ID: $id"
    return 1
  fi

  return 0
}

# Usage
validate_task_id "214"  # Valid
validate_task_id "abc"  # Invalid
validate_task_id "350"  # Warning
```

### Task Status Issues

```bash
# Check valid statuses
VALID_STATUSES=("todo" "ready" "in_progress" "review" "completed" "blocked" "cancelled")

check_status() {
  local status="$1"

  for valid in "${VALID_STATUSES[@]}"; do
    if [ "$status" = "$valid" ]; then
      return 0
    fi
  done

  echo "❌ Invalid status: $status"
  echo "Valid statuses: ${VALID_STATUSES[*]}"
  return 1
}

# Update task with valid status
node scripts/provider-bridge.js update-task --id=214 --status=in_progress
```

---

## 🔐 Authentication Issues

### GitHub Authentication

```bash
# Test GitHub token
test_github_auth() {
  if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN not set"
    return 1
  fi

  echo "🔍 Testing GitHub authentication..."
  RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)

  if echo "$RESPONSE" | jq -e '.login' > /dev/null 2>&1; then
    USERNAME=$(echo "$RESPONSE" | jq -r '.login')
    echo "✅ GitHub auth successful: $USERNAME"
    return 0
  else
    echo "❌ GitHub auth failed"
    echo "Response: $RESPONSE"
    return 1
  fi
}

# Check token permissions
check_github_permissions() {
  echo "🔍 Checking GitHub token permissions..."

  SCOPES=$(curl -s -I -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -i x-oauth-scopes | cut -d: -f2 | tr -d ' \r')

  echo "Token scopes: $SCOPES"

  for required in "repo" "issues"; do
    if [[ "$SCOPES" =~ $required ]]; then
      echo "✅ Scope '$required': OK"
    else
      echo "❌ Scope '$required': Missing"
    fi
  done
}
```

### Notion Authentication

```bash
# Test Notion API key
test_notion_auth() {
  if [ -z "$NOTION_API_KEY" ]; then
    echo "❌ NOTION_API_KEY not set"
    return 1
  fi

  echo "🔍 Testing Notion authentication..."
  RESPONSE=$(curl -s -X POST 'https://api.notion.com/v1/users/me' \
    -H 'Authorization: Bearer '"$NOTION_API_KEY" \
    -H 'Notion-Version: 2022-06-28')

  if echo "$RESPONSE" | jq -e '.object' > /dev/null 2>&1; then
    echo "✅ Notion auth successful"
    return 0
  else
    echo "❌ Notion auth failed"
    echo "Response: $RESPONSE"
    return 1
  fi
}

# Test database access
test_notion_database() {
  local db_id="$NOTION_DATABASE_ID"

  if [ -z "$db_id" ]; then
    echo "❌ NOTION_DATABASE_ID not set"
    return 1
  fi

  echo "🔍 Testing database access: $db_id"
  RESPONSE=$(curl -s -X POST "https://api.notion.com/v1/databases/$db_id/query" \
    -H 'Authorization: Bearer '"$NOTION_API_KEY" \
    -H 'Notion-Version: 2022-06-28' \
    -d '{"page_size": 1}')

  if echo "$RESPONSE" | jq -e '.results' > /dev/null 2>&1; then
    echo "✅ Database access successful"
    return 0
  else
    echo "❌ Database access failed"
    echo "Response: $RESPONSE"
    return 1
  fi
}
```

### Token Refresh

```bash
# GitHub token refresh reminder
check_token_expiry() {
  echo "🕒 Token Expiry Check"
  echo "===================="

  # GitHub tokens don't expire by default, but check for rate limits
  RATE_LIMIT=$(curl -s -I -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -i x-ratelimit-remaining | cut -d: -f2 | tr -d ' \r')

  echo "GitHub rate limit remaining: $RATE_LIMIT"

  if [ "$RATE_LIMIT" -lt 100 ]; then
    echo "⚠️  Low rate limit remaining"
    RESET_TIME=$(curl -s -I -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -i x-ratelimit-reset | cut -d: -f2 | tr -d ' \r')
    echo "Resets at: $(date -d @$RESET_TIME)"
  fi
}
```

---

## 🔒 File Locking Issues

### Stale Lock Detection

```bash
# Check lock status
check_lock_status() {
  local lock_file=".flowforge/.lock"

  if [ ! -f "$lock_file" ]; then
    echo "✅ No lock file"
    return 0
  fi

  echo "🔒 Lock file exists"

  # Get lock info
  if ! jq empty "$lock_file" 2>/dev/null; then
    echo "❌ Corrupted lock file"
    rm "$lock_file"
    echo "✅ Removed corrupted lock"
    return 0
  fi

  local lock_user=$(jq -r '.user // "unknown"' "$lock_file")
  local lock_time=$(jq -r '.timestamp // "unknown"' "$lock_file")
  local lock_pid=$(jq -r '.pid // "unknown"' "$lock_file")

  echo "User: $lock_user"
  echo "Time: $lock_time"
  echo "PID: $lock_pid"

  # Check if lock is stale
  if [ "$lock_time" != "unknown" ]; then
    local lock_epoch=$(date -d "$lock_time" +%s 2>/dev/null || echo "0")
    local current_epoch=$(date +%s)
    local lock_age=$((current_epoch - lock_epoch))

    echo "Age: ${lock_age} seconds"

    if [ $lock_age -gt 300 ]; then  # 5 minutes
      echo "⚠️  Stale lock detected"
      return 1
    fi
  fi

  # Check if process is still running
  if [ "$lock_pid" != "unknown" ] && [ "$lock_pid" != "null" ]; then
    if ! kill -0 "$lock_pid" 2>/dev/null; then
      echo "⚠️  Process no longer running"
      return 1
    fi
  fi

  echo "🔒 Lock appears valid"
  return 0
}

# Remove stale lock
remove_stale_lock() {
  local lock_file=".flowforge/.lock"

  if check_lock_status; then
    echo "Lock is not stale"
    return 1
  fi

  echo "🗑️  Removing stale lock..."

  # Create backup of lock info
  if [ -f "$lock_file" ]; then
    cp "$lock_file" "$lock_file.removed-$(date +%s)"
    rm "$lock_file"
    echo "✅ Lock removed"
  fi
}
```

### Lock Contention Resolution

```bash
# Handle lock contention for teams
resolve_lock_contention() {
  local max_retries=5
  local retry_delay=2
  local operation="$1"

  for ((i=1; i<=max_retries; i++)); do
    echo "🔄 Attempt $i/$max_retries for $operation"

    if check_lock_status; then
      echo "✅ Lock available, proceeding"
      return 0
    fi

    if [ $i -lt $max_retries ]; then
      echo "⏳ Waiting ${retry_delay}s before retry..."
      sleep $retry_delay
      retry_delay=$((retry_delay * 2))  # Exponential backoff
    fi
  done

  echo "❌ Max retries exceeded"
  echo "🤝 Contact lock owner or force unlock"
  return 1
}

# Force unlock (emergency only)
force_unlock() {
  local lock_file=".flowforge/.lock"

  echo "🚨 FORCE UNLOCK - USE WITH CAUTION"

  if [ -f "$lock_file" ]; then
    local lock_user=$(jq -r '.user // "unknown"' "$lock_file")
    echo "⚠️  Forcibly removing lock owned by: $lock_user"

    # Backup lock info
    cp "$lock_file" "$lock_file.forced-$(date +%s)"
    rm "$lock_file"

    echo "✅ Lock forcibly removed"
    echo "💡 Notify team of forced unlock"
  else
    echo "ℹ️  No lock to remove"
  fi
}
```

---

## 💾 Data Corruption

### JSON Validation and Repair

```bash
# Comprehensive JSON validation
validate_json_files() {
  echo "🔍 Validating JSON files..."

  local files=(
    ".flowforge/tasks.json"
    ".flowforge/providers/config.json"
  )

  for file in "${files[@]}"; do
    if [ -f "$file" ]; then
      echo "Checking: $file"

      if jq empty "$file" 2>/dev/null; then
        echo "  ✅ Valid JSON"
      else
        echo "  ❌ Invalid JSON"
        repair_json_file "$file"
      fi
    else
      echo "⚠️  Missing: $file"
      create_default_file "$file"
    fi
  done
}

# Repair corrupted JSON
repair_json_file() {
  local file="$1"
  local backup_file="${file}.corrupted-$(date +%s)"

  echo "🔧 Repairing: $file"

  # Backup corrupted file
  cp "$file" "$backup_file"

  # Try to find backup
  local backup_dir=$(dirname "$file")/backups
  if [ -d "$backup_dir" ]; then
    local latest_backup=$(ls -t "$backup_dir"/*.json 2>/dev/null | head -1)
    if [ -n "$latest_backup" ]; then
      cp "$latest_backup" "$file"
      echo "✅ Restored from backup: $latest_backup"
      return 0
    fi
  fi

  # Create minimal structure based on file type
  case "$file" in
    *tasks.json)
      create_minimal_tasks_json "$file"
      ;;
    *config.json)
      create_minimal_config_json "$file"
      ;;
    *)
      echo "❌ Unknown file type: $file"
      ;;
  esac
}

# Create minimal tasks.json
create_minimal_tasks_json() {
  local file="$1"

  cat > "$file" << EOF
{
  "version": "2.0.0",
  "metadata": {
    "created": "$(date -Iseconds)",
    "lastModified": "$(date -Iseconds)",
    "recovered": true
  },
  "tasks": []
}
EOF

  echo "✅ Created minimal tasks.json"
}

# Create minimal provider config
create_minimal_config_json() {
  local file="$1"

  mkdir -p "$(dirname "$file")"

  cat > "$file" << EOF
{
  "version": "2.0.0",
  "mode": "json",
  "defaultProvider": "json-recovery",
  "providers": [
    {
      "name": "json-recovery",
      "type": "json",
      "enabled": true,
      "settings": {
        "filePath": ".flowforge/tasks.json",
        "autoSave": true
      }
    }
  ]
}
EOF

  echo "✅ Created minimal provider config"
}
```

### Data Consistency Checks

```bash
# Check data consistency across providers
check_data_consistency() {
  echo "🔍 Data Consistency Check"
  echo "========================"

  # Get task count from JSON
  local json_count=0
  if [ -f .flowforge/tasks.json ]; then
    json_count=$(jq '.tasks | length' .flowforge/tasks.json 2>/dev/null || echo "0")
  fi
  echo "JSON tasks: $json_count"

  # Get task count from provider bridge
  local provider_count=0
  if provider_count=$(node scripts/provider-bridge.js list-tasks --format=simple 2>/dev/null | wc -l); then
    echo "Provider tasks: $provider_count"
  else
    echo "Provider tasks: ERROR"
  fi

  # Compare counts
  if [ "$json_count" -eq "$provider_count" ]; then
    echo "✅ Task counts consistent"
  else
    echo "⚠️  Task count mismatch"
    echo "Manual review required"
  fi

  # Check for duplicate IDs
  local duplicates=$(jq -r '.tasks[].id' .flowforge/tasks.json 2>/dev/null | sort | uniq -d)
  if [ -n "$duplicates" ]; then
    echo "❌ Duplicate task IDs found:"
    echo "$duplicates"
  else
    echo "✅ No duplicate task IDs"
  fi
}
```

---

## ⚡ Performance Issues

### Response Time Monitoring

```bash
# Measure provider response times
measure_performance() {
  echo "📊 Performance Measurement"
  echo "========================="

  local operations=(
    "get-provider"
    "list-tasks"
    "get-task --id=1"
  )

  for op in "${operations[@]}"; do
    echo "Testing: $op"

    local start_time=$(date +%s%3N)
    node scripts/provider-bridge.js $op > /dev/null 2>&1
    local end_time=$(date +%s%3N)

    local duration=$((end_time - start_time))
    echo "  Duration: ${duration}ms"

    if [ $duration -lt 1000 ]; then
      echo "  Status: ✅ Good"
    elif [ $duration -lt 3000 ]; then
      echo "  Status: ⚠️  Acceptable"
    else
      echo "  Status: ❌ Poor"
    fi
    echo
  done
}

# Optimize performance
optimize_performance() {
  echo "🚀 Performance Optimization"
  echo "=========================="

  # Enable caching in config
  local config_file=".flowforge/providers/config.json"
  if [ -f "$config_file" ]; then
    # Add caching configuration
    local temp_config=$(mktemp)
    jq '.cache = {
      "enabled": true,
      "ttl": 60000,
      "maxSize": "10MB"
    }' "$config_file" > "$temp_config" && mv "$temp_config" "$config_file"

    echo "✅ Enabled caching"
  fi

  # Optimize sync intervals
  if jq -e '.sync.interval' "$config_file" > /dev/null 2>&1; then
    local temp_config=$(mktemp)
    jq '.sync.interval = 300000' "$config_file" > "$temp_config" && mv "$temp_config" "$config_file"
    echo "✅ Optimized sync interval to 5 minutes"
  fi

  echo "=========================="
}
```

### Memory and Disk Usage

```bash
# Check disk usage
check_disk_usage() {
  echo "💽 Disk Usage Analysis"
  echo "====================="

  # FlowForge directory size
  if [ -d .flowforge ]; then
    local ff_size=$(du -sh .flowforge | cut -f1)
    echo "FlowForge directory: $ff_size"

    # Breakdown by subdirectory
    for dir in .flowforge/*/; do
      if [ -d "$dir" ]; then
        local dir_size=$(du -sh "$dir" | cut -f1)
        local dir_name=$(basename "$dir")
        echo "  $dir_name: $dir_size"
      fi
    done
  fi

  # Check for large backup files
  echo -e "\nBackup files:"
  find .flowforge -name "*.backup*" -o -name "*.json.*" | while read -r file; do
    local size=$(du -sh "$file" | cut -f1)
    echo "  $file: $size"
  done

  echo "====================="
}

# Clean up old data
cleanup_old_data() {
  echo "🧹 Cleaning Old Data"
  echo "===================="

  # Remove old backups (keep last 10)
  if [ -d .flowforge/backups ]; then
    echo "Cleaning old backups..."
    ls -t .flowforge/backups/*.json 2>/dev/null | tail -n +11 | xargs rm -f
    echo "✅ Cleaned old backups"
  fi

  # Remove old lock backup files
  find .flowforge -name ".lock.*" -mtime +7 -delete
  echo "✅ Cleaned old lock files"

  # Remove temporary files
  find .flowforge -name "*.tmp" -delete
  echo "✅ Cleaned temporary files"

  echo "===================="
}
```

---

## 🔄 Provider-Specific Issues

### GitHub Provider Issues

```bash
# GitHub-specific troubleshooting
troubleshoot_github() {
  echo "🐙 GitHub Provider Troubleshooting"
  echo "=================================="

  # Check rate limits
  local rate_info=$(curl -s -I -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)
  local remaining=$(echo "$rate_info" | grep -i x-ratelimit-remaining | cut -d: -f2 | tr -d ' \r')
  local reset_time=$(echo "$rate_info" | grep -i x-ratelimit-reset | cut -d: -f2 | tr -d ' \r')

  echo "Rate limit remaining: $remaining"
  echo "Rate limit resets: $(date -d @$reset_time)"

  if [ "$remaining" -lt 100 ]; then
    echo "⚠️  Rate limit low"
    echo "💡 Consider using caching or reducing sync frequency"
  fi

  # Test repository access
  local owner="${FLOWFORGE_GITHUB_OWNER:-JustCode-CruzAlex}"
  local repo="${FLOWFORGE_GITHUB_REPO:-FlowForge}"

  echo "Testing repository access: $owner/$repo"
  local repo_response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$owner/$repo")

  if echo "$repo_response" | jq -e '.id' > /dev/null 2>&1; then
    echo "✅ Repository access: OK"
  else
    echo "❌ Repository access: FAILED"
    echo "Response: $repo_response"
  fi

  echo "=================================="
}

# Fix GitHub configuration
fix_github_config() {
  echo "🔧 Fixing GitHub Configuration"

  local config_file=".flowforge/providers/config.json"

  # Update GitHub provider settings
  if [ -f "$config_file" ]; then
    local temp_config=$(mktemp)
    jq '
      .providers |= map(
        if .type == "github" then
          .settings.rateLimitSafe = true |
          .settings.retryAttempts = 3 |
          .settings.backoffDelay = 1000
        else . end
      )
    ' "$config_file" > "$temp_config" && mv "$temp_config" "$config_file"

    echo "✅ Updated GitHub provider configuration"
  fi
}
```

### Notion Provider Issues

```bash
# Notion-specific troubleshooting
troubleshoot_notion() {
  echo "📔 Notion Provider Troubleshooting"
  echo "=================================="

  # Test API connectivity
  local api_response=$(curl -s -X POST 'https://api.notion.com/v1/users/me' \
    -H 'Authorization: Bearer '"$NOTION_API_KEY" \
    -H 'Notion-Version: 2022-06-28')

  if echo "$api_response" | jq -e '.object' > /dev/null 2>&1; then
    echo "✅ Notion API: Connected"
    local user_name=$(echo "$api_response" | jq -r '.name // "Unknown"')
    echo "User: $user_name"
  else
    echo "❌ Notion API: Failed"
    echo "Response: $api_response"
  fi

  # Test database access
  if [ -n "$NOTION_DATABASE_ID" ]; then
    echo "Testing database: $NOTION_DATABASE_ID"

    local db_response=$(curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_DATABASE_ID/query" \
      -H 'Authorization: Bearer '"$NOTION_API_KEY" \
      -H 'Notion-Version: 2022-06-28' \
      -d '{"page_size": 1}')

    if echo "$db_response" | jq -e '.results' > /dev/null 2>&1; then
      echo "✅ Database access: OK"
      local result_count=$(echo "$db_response" | jq '.results | length')
      echo "Sample results: $result_count"
    else
      echo "❌ Database access: Failed"
      echo "Response: $db_response"
    fi
  else
    echo "⚠️  NOTION_DATABASE_ID not set"
  fi

  echo "=================================="
}
```

---

## 📞 Support Escalation

### Collecting Debug Information

```bash
#!/bin/bash
# Save as: scripts/collect-debug-info.sh

echo "🔍 Collecting Debug Information"
echo "==============================="

DEBUG_DIR="debug-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEBUG_DIR"

# System information
{
  echo "# System Information"
  echo "Date: $(date)"
  echo "User: $USER"
  echo "Node version: $(node --version 2>/dev/null || echo 'Not installed')"
  echo "Git version: $(git --version 2>/dev/null || echo 'Not installed')"
  echo "Working directory: $(pwd)"
  echo "Git branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
} > "$DEBUG_DIR/system-info.txt"

# FlowForge configuration
cp .flowforge/providers/config.json "$DEBUG_DIR/" 2>/dev/null || echo "{}" > "$DEBUG_DIR/config.json"

# Task data (sanitized)
if [ -f .flowforge/tasks.json ]; then
  jq 'del(.tasks[].description) | del(.tasks[].timeSessions) | .tasks |= map(select(.id != null))' .flowforge/tasks.json > "$DEBUG_DIR/tasks-sanitized.json"
fi

# Provider test results
{
  echo "# Provider Test Results"
  echo "Provider status:"
  node scripts/provider-bridge.js get-provider 2>&1 || echo "Provider test failed"
  echo
  echo "List tasks test:"
  node scripts/provider-bridge.js list-tasks --format=simple 2>&1 || echo "List tasks failed"
} > "$DEBUG_DIR/provider-tests.txt"

# Recent logs (if any)
find .flowforge -name "*.log" -newer $(date -d '1 hour ago' +%Y%m%d-%H%M%S) -exec cp {} "$DEBUG_DIR/" \; 2>/dev/null

# Lock status
if [ -f .flowforge/.lock ]; then
  cp .flowforge/.lock "$DEBUG_DIR/lock-status.json"
fi

# Environment (sanitized)
{
  echo "# Environment Variables"
  echo "GITHUB_TOKEN: ${GITHUB_TOKEN:+SET}"
  echo "NOTION_API_KEY: ${NOTION_API_KEY:+SET}"
  echo "FLOWFORGE_USER: ${FLOWFORGE_USER:-not_set}"
  echo "FLOWFORGE_TEAM_MODE: ${FLOWFORGE_TEAM_MODE:-not_set}"
} > "$DEBUG_DIR/environment.txt"

echo "✅ Debug information collected in: $DEBUG_DIR"
echo "📦 Create archive with: tar -czf debug-info.tar.gz $DEBUG_DIR"
```

### Error Reporting Template

```markdown
# FlowForge v2.0 Error Report

## Environment
- **Date**: [YYYY-MM-DD HH:MM]
- **User**: [username]
- **System**: [OS/Platform]
- **FlowForge Version**: 2.0.0
- **Node.js Version**: [version]

## Problem Description
[Describe what you were trying to do]

## Error Message
```
[Paste exact error message]
```

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should have happened]

## Actual Behavior
[What actually happened]

## Configuration
- **Provider Mode**: [json/github/notion/hybrid]
- **Team Size**: [number of developers]
- **Lock Status**: [check .flowforge/.lock]

## Debug Information
- [ ] System info collected
- [ ] Provider tests run
- [ ] Debug archive created
- [ ] Logs attached

## Workaround
[Any temporary solution found]

## Impact
- [ ] Blocking all work
- [ ] Blocking specific tasks
- [ ] Performance degradation
- [ ] Minor inconvenience
```

### Emergency Contact Protocol

```bash
# Emergency escalation levels
echo "🚨 FlowForge Emergency Protocol"
echo "==============================="
echo
echo "Level 1: Self-Service (5 minutes)"
echo "- Try emergency reset procedures"
echo "- Check troubleshooting guide"
echo "- Run health checks"
echo
echo "Level 2: Team Lead (15 minutes)"
echo "- Contact team lead"
echo "- Share debug information"
echo "- Attempt coordinated recovery"
echo
echo "Level 3: System Support (30 minutes)"
echo "- Open support ticket"
echo "- Include debug archive"
echo "- Follow error reporting template"
echo
echo "Level 4: Full Rollback (60 minutes)"
echo "- Initiate rollback to v1.x"
echo "- Notify all team members"
echo "- Post-incident review"
```

---

## ✅ Health Monitoring

### Automated Health Checks

```bash
#!/bin/bash
# Save as: scripts/health-monitor.sh

echo "🏥 FlowForge Health Monitor"
echo "=========================="

HEALTH_SCORE=100
ISSUES=()

# Check provider connectivity
if ! node scripts/provider-bridge.js get-provider > /dev/null 2>&1; then
  HEALTH_SCORE=$((HEALTH_SCORE - 30))
  ISSUES+=("Provider system offline")
fi

# Check response time
RESPONSE_TIME=$(( $(date +%s%3N) ))
node scripts/provider-bridge.js list-tasks > /dev/null 2>&1
RESPONSE_TIME=$(( $(date +%s%3N) - RESPONSE_TIME ))

if [ $RESPONSE_TIME -gt 3000 ]; then
  HEALTH_SCORE=$((HEALTH_SCORE - 20))
  ISSUES+=("Slow response time: ${RESPONSE_TIME}ms")
fi

# Check file locks
if [ -f .flowforge/.lock ]; then
  LOCK_AGE=$(($(date +%s) - $(stat -c %Y .flowforge/.lock)))
  if [ $LOCK_AGE -gt 300 ]; then
    HEALTH_SCORE=$((HEALTH_SCORE - 15))
    ISSUES+=("Stale lock detected: ${LOCK_AGE}s old")
  fi
fi

# Check JSON integrity
if ! jq empty .flowforge/tasks.json 2>/dev/null; then
  HEALTH_SCORE=$((HEALTH_SCORE - 25))
  ISSUES+=("Corrupted tasks.json")
fi

# Check disk space
DISK_USAGE=$(du -sh .flowforge | cut -f1 | sed 's/[^0-9]*//g')
if [ "$DISK_USAGE" -gt 100 ]; then  # 100MB
  HEALTH_SCORE=$((HEALTH_SCORE - 10))
  ISSUES+=("High disk usage: ${DISK_USAGE}MB")
fi

# Report health status
echo "Health Score: $HEALTH_SCORE/100"

if [ $HEALTH_SCORE -ge 90 ]; then
  echo "Status: ✅ Healthy"
elif [ $HEALTH_SCORE -ge 70 ]; then
  echo "Status: ⚠️  Warning"
else
  echo "Status: ❌ Critical"
fi

if [ ${#ISSUES[@]} -gt 0 ]; then
  echo -e "\nIssues:"
  for issue in "${ISSUES[@]}"; do
    echo "  - $issue"
  done
fi

echo "=========================="

# Return appropriate exit code
if [ $HEALTH_SCORE -lt 70 ]; then
  exit 1
else
  exit 0
fi
```

---

**🎯 Quick Reference Card**:

```bash
# Emergency Reset
rm -f .flowforge/.lock && rm -rf .flowforge/providers/ && node scripts/provider-bridge.js get-provider

# Check Health
./scripts/health-monitor.sh

# Collect Debug Info
./scripts/collect-debug-info.sh

# Force Unlock
./scripts/emergency-unlock.sh

# Validate JSON
jq empty .flowforge/tasks.json && echo "Valid" || echo "Invalid"

# Reset to Defaults
rm -rf .flowforge/providers/ && node scripts/provider-bridge.js get-provider
```

For additional support, see [Provider Setup Guide](./PROVIDER_SETUP_GUIDE.md) and [Team Configuration](./TEAM_CONFIGURATION.md).