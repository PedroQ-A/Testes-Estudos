# FlowForge Provider Quick Start Examples

**Version**: 2.0.0
**Last Updated**: September 2025

Quick configuration examples for different provider setups.

---

## 🚀 Instant Setups

### 1. Solo Developer (JSON Only)

**Setup time**: 2 minutes

```bash
# Clone and initialize
git clone https://github.com/JustCode-CruzAlex/FlowForge.git
cd FlowForge

# Auto-create default provider
node scripts/provider-bridge.js list-tasks

# Start working immediately
./run_ff_command.sh flowforge:session:start 1
```

**Auto-generated config** (`.flowforge/config/providers.json`):
```json
{
  "default": {
    "providers": [
      {
        "type": "json",
        "primary": true,
        "config": {
          "dataFile": ".flowforge/tasks.json",
          "backupEnabled": true,
          "autoSave": true
        }
      }
    ]
  }
}
```

### 2. Team JSON Setup (File Locking)

**Setup time**: 3 minutes

```bash
# Create team configuration
mkdir -p .flowforge/providers
cat > .flowforge/providers/config.json << 'EOF'
{
  "version": "2.0.0",
  "mode": "json",
  "defaultProvider": "json-team",
  "providers": [
    {
      "name": "json-team",
      "type": "json",
      "enabled": true,
      "settings": {
        "filePath": ".flowforge/tasks.json",
        "autoSave": true,
        "fileLocking": true,
        "lockTimeout": 10000,
        "conflictResolution": "merge"
      }
    }
  ],
  "team": {
    "lockingEnabled": true,
    "maxConcurrentUsers": 6
  }
}
EOF

# Test team setup
node scripts/provider-bridge.js get-provider
```

### 3. GitHub Integration (5 minutes)

```bash
# Set environment
export GITHUB_TOKEN="ghp_your_token_here"

# Create GitHub provider config
cat > .flowforge/providers/config.json << 'EOF'
{
  "version": "2.0.0",
  "mode": "github",
  "defaultProvider": "github-main",
  "providers": [
    {
      "name": "github-main",
      "type": "github",
      "enabled": true,
      "settings": {
        "token": "${GITHUB_TOKEN}",
        "owner": "your-username",
        "repo": "your-project",
        "projectNumber": 1
      }
    },
    {
      "name": "json-cache",
      "type": "json",
      "enabled": true,
      "priority": 2,
      "settings": {
        "filePath": ".flowforge/cache/tasks.json"
      }
    }
  ],
  "sync": {
    "enabled": true,
    "interval": 300000
  }
}
EOF

# Test GitHub integration
node scripts/provider-bridge.js list-tasks --provider=github-main
```

### 4. Notion Integration (10 minutes)

```bash
# Set environment
export NOTION_API_KEY="secret_your_api_key"
export NOTION_DATABASE_ID="your-database-id"

# Create Notion provider config
cat > .flowforge/providers/config.json << 'EOF'
{
  "version": "2.0.0",
  "mode": "notion",
  "defaultProvider": "notion-workspace",
  "providers": [
    {
      "name": "notion-workspace",
      "type": "notion",
      "enabled": true,
      "settings": {
        "apiKey": "${NOTION_API_KEY}",
        "databaseId": "${NOTION_DATABASE_ID}",
        "fieldMapping": {
          "title": "Name",
          "status": "Status",
          "priority": "Priority"
        }
      }
    },
    {
      "name": "json-backup",
      "type": "json",
      "enabled": true,
      "priority": 2,
      "settings": {
        "filePath": ".flowforge/backup/tasks.json"
      }
    }
  ]
}
EOF

# Test Notion integration
node scripts/provider-bridge.js list-tasks --provider=notion-workspace
```

---

## 📋 Configuration Templates

### Minimal JSON Provider

```json
{
  "version": "2.0.0",
  "mode": "json",
  "providers": [
    {
      "name": "json-default",
      "type": "json",
      "enabled": true,
      "settings": {
        "filePath": ".flowforge/tasks.json"
      }
    }
  ]
}
```

### Production Team Setup

```json
{
  "version": "2.0.0",
  "mode": "hybrid",
  "defaultProvider": "json-team",
  "team": {
    "name": "Development Team",
    "maxConcurrentUsers": 6,
    "lockingEnabled": true
  },
  "providers": [
    {
      "name": "json-team",
      "type": "json",
      "enabled": true,
      "priority": 1,
      "settings": {
        "filePath": ".flowforge/tasks.json",
        "autoSave": true,
        "fileLocking": true,
        "backupEnabled": true,
        "saveInterval": 2000
      }
    },
    {
      "name": "github-team",
      "type": "github",
      "enabled": true,
      "priority": 2,
      "settings": {
        "token": "${GITHUB_TOKEN}",
        "owner": "your-org",
        "repo": "your-project",
        "syncInterval": 300000
      }
    }
  ],
  "sync": {
    "enabled": true,
    "interval": 180000,
    "strategy": "merge"
  },
  "performance": {
    "cacheEnabled": true,
    "batchOperations": true
  }
}
```

### Multi-Provider Enterprise

```json
{
  "version": "2.0.0",
  "mode": "hybrid",
  "defaultProvider": "json-local",
  "providers": [
    {
      "name": "json-local",
      "type": "json",
      "enabled": true,
      "priority": 1,
      "settings": {
        "filePath": ".flowforge/tasks.json",
        "autoSave": true
      }
    },
    {
      "name": "github-dev",
      "type": "github",
      "enabled": true,
      "priority": 2,
      "settings": {
        "token": "${GITHUB_DEV_TOKEN}",
        "owner": "company",
        "repo": "dev-tasks",
        "defaultLabels": ["development"]
      }
    },
    {
      "name": "notion-product",
      "type": "notion",
      "enabled": true,
      "priority": 3,
      "settings": {
        "apiKey": "${NOTION_API_KEY}",
        "databaseId": "${NOTION_PRODUCT_DB}",
        "fieldMapping": {
          "title": "Feature Name",
          "status": "Development Status"
        }
      }
    }
  ],
  "sync": {
    "enabled": true,
    "strategy": "selective",
    "rules": [
      {
        "source": "github-dev",
        "target": "json-local",
        "filter": { "labels": ["bug", "urgent"] }
      },
      {
        "source": "notion-product",
        "target": "json-local",
        "filter": { "status": ["ready"] }
      }
    ]
  }
}
```

---

## 🔧 Common Operations

### Basic Provider Operations

```bash
# Get current provider info
node scripts/provider-bridge.js get-provider

# List all tasks
node scripts/provider-bridge.js list-tasks

# Get specific task
node scripts/provider-bridge.js get-task --id=123

# Create new task
node scripts/provider-bridge.js create-task --title="New feature" --status=ready

# Update task status
node scripts/provider-bridge.js update-task --id=123 --status=in_progress

# Start time tracking
node scripts/provider-bridge.js start-tracking --id=123

# Stop time tracking
node scripts/provider-bridge.js stop-tracking --id=123 --session=session-id
```

### Multi-Provider Operations

```bash
# Aggregate tasks from all providers
node scripts/provider-bridge.js aggregate-tasks

# Use specific provider
node scripts/provider-bridge.js list-tasks --provider=github-main

# Search across providers
node scripts/provider-bridge.js search-tasks --query="authentication"

# Force sync between providers
node scripts/provider-bridge.js sync-providers --force=true
```

### Team Operations

```bash
# Check file locks
ls -la .flowforge/.lock

# Force unlock (emergency only)
rm .flowforge/.lock

# Team status summary
node scripts/provider-bridge.js aggregate-status

# Health check
./scripts/health-check.sh  # (if created)
```

---

## 🎯 Output Formats

### JSON Format (Default)

```bash
node scripts/provider-bridge.js get-task --id=123 --format=json
```

Output:
```json
{
  "id": 123,
  "title": "Implement authentication",
  "status": "in_progress",
  "priority": "high",
  "assignee": "developer1",
  "createdAt": "2025-09-16T10:00:00Z"
}
```

### Text Format

```bash
node scripts/provider-bridge.js list-tasks --format=text
```

Output:
```
#123: Implement authentication [in_progress]
#124: Fix bug in parser [ready]
#125: Update documentation [completed]
```

### Simple Format (for scripting)

```bash
node scripts/provider-bridge.js list-tasks --status=ready --format=simple
```

Output:
```
124
126
127
```

### Markdown Format

```bash
node scripts/provider-bridge.js list-tasks --format=markdown
```

Output:
```markdown
- [ ] #123: Implement authentication [in_progress]
- [ ] #124: Fix bug in parser [ready]
- [x] #125: Update documentation [completed]
```

---

## 🚨 Emergency Procedures

### Provider System Down

```bash
# Reset to default JSON provider
rm -rf .flowforge/providers/
node scripts/provider-bridge.js get-provider  # Auto-creates default

# Verify basic functionality
node scripts/provider-bridge.js list-tasks
```

### File Lock Issues

```bash
# Check lock status
if [ -f .flowforge/.lock ]; then
  echo "Lock file exists:"
  cat .flowforge/.lock
  echo "Age: $(($(date +%s) - $(stat -c %Y .flowforge/.lock)))s"
fi

# Remove stale lock (use carefully!)
if [ -f .flowforge/.lock ]; then
  LOCK_AGE=$(($(date +%s) - $(stat -c %Y .flowforge/.lock)))
  if [ $LOCK_AGE -gt 300 ]; then  # 5 minutes
    rm .flowforge/.lock
    echo "Removed stale lock"
  fi
fi
```

### Corrupted Task Data

```bash
# Check JSON validity
jq empty .flowforge/tasks.json 2>&1 || echo "JSON corrupted"

# Restore from backup
LATEST_BACKUP=$(ls -t .flowforge/backups/tasks* 2>/dev/null | head -1)
if [ -n "$LATEST_BACKUP" ]; then
  cp "$LATEST_BACKUP" .flowforge/tasks.json
  echo "Restored from: $LATEST_BACKUP"
else
  # Create minimal structure
  echo '{"version":"2.0.0","tasks":[],"metadata":{"created":"'$(date -Iseconds)'"}}' > .flowforge/tasks.json
  echo "Created fresh tasks.json"
fi
```

---

## 📊 Verification Scripts

### Provider Health Check

```bash
#!/bin/bash
# Save as: scripts/provider-health.sh

echo "🏥 Provider Health Check"
echo "======================="

# Test provider connectivity
if node scripts/provider-bridge.js get-provider > /dev/null 2>&1; then
  echo "✅ Provider system: OK"

  # Get provider details
  PROVIDER_INFO=$(node scripts/provider-bridge.js get-provider --format=json)
  echo "📋 Active provider: $(echo "$PROVIDER_INFO" | jq -r '.name')"
  echo "🔧 Type: $(echo "$PROVIDER_INFO" | jq -r '.type')"
else
  echo "❌ Provider system: FAILED"
  exit 1
fi

# Test basic operations
if node scripts/provider-bridge.js list-tasks > /dev/null 2>&1; then
  echo "✅ Task listing: OK"
else
  echo "❌ Task listing: FAILED"
fi

# Check environment
echo "🌍 Environment:"
[ -n "$GITHUB_TOKEN" ] && echo "  ✅ GITHUB_TOKEN: Set" || echo "  ℹ️  GITHUB_TOKEN: Not set"
[ -n "$NOTION_API_KEY" ] && echo "  ✅ NOTION_API_KEY: Set" || echo "  ℹ️  NOTION_API_KEY: Not set"

echo "======================="
```

### Team Sync Verification

```bash
#!/bin/bash
# Save as: scripts/team-sync-check.sh

echo "👥 Team Sync Verification"
echo "========================="

# Get current user's task list
MY_TASKS=$(node scripts/provider-bridge.js list-tasks --format=simple | wc -l)
echo "📊 Tasks visible to me: $MY_TASKS"

# Check for active locks
if [ -f .flowforge/.lock ]; then
  LOCK_USER=$(jq -r '.user // "unknown"' .flowforge/.lock 2>/dev/null)
  echo "🔒 Active lock by: $LOCK_USER"
else
  echo "🔓 No active locks"
fi

# Test provider response time
START_TIME=$(date +%s%3N)
node scripts/provider-bridge.js get-provider > /dev/null 2>&1
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))
echo "⚡ Provider response time: ${RESPONSE_TIME}ms"

if [ $RESPONSE_TIME -lt 1000 ]; then
  echo "✅ Performance: Good"
elif [ $RESPONSE_TIME -lt 3000 ]; then
  echo "⚠️  Performance: Acceptable"
else
  echo "❌ Performance: Poor"
fi

echo "========================="
```

---

**💡 Pro Tips**:

1. **Start Simple**: Begin with JSON provider, add complexity as needed
2. **Test Everything**: Use the verification scripts before going live
3. **Monitor Performance**: Watch response times and file lock frequency
4. **Have Fallbacks**: Always configure JSON backup providers
5. **Document Changes**: Keep team informed of provider configuration updates

For complete setup guidance, see the [main Provider Setup Guide](./PROVIDER_SETUP_GUIDE.md).