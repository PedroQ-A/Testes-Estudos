# FlowForge v2.0 Provider Setup Guide

## 🚀 Express Setup (5 Minutes for Monday Deployment)

If you're deploying FlowForge v2.0 to your 6-developer team on Monday, follow this express path:

```bash
# 1. Quick provider check
node scripts/provider-bridge.js get-provider

# 2. If using JSON (default - recommended for quick start):
echo "✅ You're ready! JSON provider is pre-configured"

# 3. Start your first session
./run_ff_command.sh flowforge:session:start [issue-number]
```

**That's it!** For advanced configuration, continue reading.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Provider Types](#provider-types)
3. [Setup by Provider](#setup-by-provider)
4. [Team Configuration (6+ Developers)](#team-configuration)
5. [Migration from v1.x](#migration)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Overview

FlowForge v2.0's provider system allows you to use different task management backends while maintaining a unified interface. Whether you prefer local JSON files, GitHub Issues, or Notion databases, FlowForge adapts to your workflow.

### Key Benefits
- **Flexibility**: Switch between providers without changing commands
- **Reliability**: Automatic fallback to JSON if primary provider fails
- **Team Support**: File locking prevents conflicts with 6+ developers
- **Offline Work**: JSON cache enables offline development

### Provider Architecture

```
Commands (start, end, pause)
           ↓
    Provider Bridge
           ↓
    Provider Factory
           ↓
   [JSON | GitHub | Notion]
```

---

## Provider Types

### 1. **JSON Provider** (Default - Recommended for Quick Start)
- **Best for**: Local development, offline work, small teams
- **Setup time**: 0 minutes (pre-configured)
- **Requirements**: None

### 2. **GitHub Provider**
- **Best for**: Open source projects, GitHub-centric workflows
- **Setup time**: 5 minutes
- **Requirements**: GitHub token with repo/project permissions

### 3. **Notion Provider**
- **Best for**: Product teams, rich documentation needs
- **Setup time**: 10 minutes
- **Requirements**: Notion API key and database

### 4. **Hybrid Mode**
- **Best for**: Large teams, complex workflows
- **Setup time**: 15 minutes
- **Requirements**: Multiple provider credentials

---

## Setup by Provider

### 🗂️ JSON Provider Setup (Default)

JSON provider is pre-configured and ready to use!

#### Configuration Location
`.flowforge/providers/config.json`

#### Default Configuration
```json
{
  "version": "2.0.0",
  "mode": "json",
  "defaultProvider": "json-default",
  "providers": [
    {
      "name": "json-default",
      "type": "json",
      "enabled": true,
      "priority": 1,
      "settings": {
        "filePath": ".flowforge/tasks.json",
        "backupPath": ".flowforge/backups/tasks",
        "autoSave": true,
        "saveInterval": 5000,
        "lockTimeout": 10000,
        "maxRetries": 3
      }
    }
  ]
}
```

#### Verify JSON Provider
```bash
# Check provider status
node scripts/provider-bridge.js get-provider --format=text

# List tasks
node scripts/provider-bridge.js list-tasks

# Create a test task
node scripts/provider-bridge.js create-task --title="Test Task" --priority=high
```

#### File Locking (Multi-Developer)
The JSON provider automatically handles file locking:
- Creates `.flowforge/locks/` directory for lock files
- Prevents concurrent writes to tasks.json
- Auto-releases stale locks after timeout

---

### 🐙 GitHub Provider Setup

#### Step 1: Create GitHub Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "FlowForge Provider"
4. Select scopes:
   - `repo` (full control)
   - `project` (read/write projects)
5. Generate and copy token

#### Step 2: Configure Environment
```bash
# Add to ~/.bashrc or ~/.zshrc
export GITHUB_TOKEN="ghp_your_token_here"
export GITHUB_OWNER="your-username-or-org"
export GITHUB_REPO="your-repo-name"

# Reload shell
source ~/.bashrc
```

#### Step 3: Update Provider Configuration
Create/edit `.flowforge/providers/config.json`:

```json
{
  "version": "2.0.0",
  "mode": "github",
  "defaultProvider": "github-main",
  "providers": [
    {
      "name": "github-main",
      "type": "github",
      "enabled": true,
      "priority": 1,
      "settings": {
        "token": "${GITHUB_TOKEN}",
        "owner": "${GITHUB_OWNER}",
        "repo": "${GITHUB_REPO}",
        "projectNumber": 1,
        "defaultLabels": ["flowforge", "task"],
        "autoClose": true,
        "syncStrategy": "bidirectional",
        "cacheTTL": 60000
      }
    },
    {
      "name": "json-fallback",
      "type": "json",
      "enabled": true,
      "priority": 2,
      "settings": {
        "filePath": ".flowforge/cache/tasks.json",
        "autoSave": true
      }
    }
  ],
  "sync": {
    "enabled": true,
    "interval": 300000,
    "strategy": "merge"
  },
  "fallback": {
    "enabled": true,
    "provider": "json-fallback",
    "conditions": ["network_error", "auth_failure", "rate_limit"]
  }
}
```

#### Step 4: Test GitHub Provider
```bash
# Verify connection
node scripts/provider-bridge.js get-provider --format=json

# List GitHub issues
node scripts/provider-bridge.js list-tasks --provider=github-main

# Create issue
node scripts/provider-bridge.js create-task \
  --provider=github-main \
  --title="Setup FlowForge" \
  --body="Configure provider system" \
  --labels="flowforge,setup"
```

---

### 📝 Notion Provider Setup

#### Step 1: Create Notion Integration
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name: "FlowForge Provider"
4. Select workspace
5. Copy the Internal Integration Token

#### Step 2: Create Task Database
1. Create new database in Notion
2. Add properties:
   - Title (title)
   - Status (select): Open, In Progress, Done
   - Priority (select): Low, Medium, High, Critical
   - Assignee (person)
   - Due Date (date)
   - Labels (multi-select)
3. Share database with integration

#### Step 3: Get Database ID
1. Open database in browser
2. Copy ID from URL: `notion.so/workspace/DATABASE_ID?v=...`

#### Step 4: Configure Provider
```bash
# Set environment variables
export NOTION_API_KEY="secret_your_key_here"
export NOTION_DATABASE_ID="your-database-id"
```

Update `.flowforge/providers/config.json`:

```json
{
  "version": "2.0.0",
  "mode": "notion",
  "defaultProvider": "notion-workspace",
  "providers": [
    {
      "name": "notion-workspace",
      "type": "notion",
      "enabled": true,
      "priority": 1,
      "settings": {
        "apiKey": "${NOTION_API_KEY}",
        "databaseId": "${NOTION_DATABASE_ID}",
        "fieldMapping": {
          "title": "Title",
          "status": "Status",
          "priority": "Priority",
          "assignee": "Assignee",
          "dueDate": "Due Date",
          "labels": "Labels"
        },
        "syncInterval": 300000,
        "pageSize": 100
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
```

#### Step 5: Test Notion Provider
```bash
# Verify connection
node scripts/provider-bridge.js get-provider

# List tasks from Notion
node scripts/provider-bridge.js list-tasks --provider=notion-workspace

# Create task in Notion
node scripts/provider-bridge.js create-task \
  --provider=notion-workspace \
  --title="FlowForge Task" \
  --priority=high \
  --status=open
```

---

### 🔀 Hybrid Mode Setup

For teams using multiple providers simultaneously:

```json
{
  "version": "2.0.0",
  "mode": "hybrid",
  "defaultProvider": "json-default",
  "providers": [
    {
      "name": "json-default",
      "type": "json",
      "enabled": true,
      "priority": 1,
      "settings": {
        "filePath": ".flowforge/tasks.json"
      }
    },
    {
      "name": "github-dev",
      "type": "github",
      "enabled": true,
      "priority": 2,
      "settings": {
        "owner": "company",
        "repo": "dev-tasks",
        "defaultLabels": ["dev"]
      }
    },
    {
      "name": "notion-product",
      "type": "notion",
      "enabled": true,
      "priority": 3,
      "settings": {
        "databaseId": "product-roadmap",
        "fieldMapping": {
          "title": "Feature Name",
          "status": "Stage"
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
        "target": "json-default",
        "filter": { "labels": ["dev"] }
      },
      {
        "source": "notion-product",
        "target": "json-default",
        "filter": { "labels": ["product"] }
      }
    ]
  }
}
```

---

## Team Configuration

### For 6+ Developers (Monday Deployment)

#### 1. Enable File Locking
```json
{
  "providers": [
    {
      "name": "json-default",
      "type": "json",
      "settings": {
        "lockTimeout": 10000,
        "lockRetries": 5,
        "lockPath": ".flowforge/locks",
        "enableConcurrentRead": true,
        "queueWrites": true
      }
    }
  ]
}
```

#### 2. Configure Team Settings
Create `.flowforge/team.json`:

```json
{
  "version": "2.0.0",
  "team": {
    "name": "Development Team",
    "size": 6,
    "roles": {
      "lead": ["user1"],
      "developers": ["user2", "user3", "user4", "user5", "user6"]
    }
  },
  "collaboration": {
    "lockStrategy": "pessimistic",
    "conflictResolution": "manual",
    "sessionTimeout": 3600000,
    "maxConcurrentSessions": 10
  },
  "notifications": {
    "enabled": true,
    "channels": ["console", "file"],
    "events": ["lock_acquired", "lock_released", "conflict_detected"]
  }
}
```

#### 3. Setup Lock Monitoring
```bash
# Monitor active locks
watch -n 1 'ls -la .flowforge/locks/'

# Check lock status
node scripts/provider-bridge.js check-locks

# Force release stale locks (emergency only)
node scripts/provider-bridge.js release-locks --force
```

#### 4. Session Coordination
Each developer should:
```bash
# Start session with lock acquisition
./run_ff_command.sh flowforge:session:start [issue]

# Session automatically:
# - Acquires task lock
# - Prevents others from modifying same task
# - Releases lock on session:end

# End session properly to release locks
./run_ff_command.sh flowforge:session:end "completed feature"
```

---

## Migration

### Automated Migration from v1.x

```bash
# 1. Backup current configuration
cp -r .flowforge .flowforge.v1.backup

# 2. Run migration script
node scripts/migrate-to-v2-providers.js

# 3. Verify migration
node scripts/provider-bridge.js validate-config

# 4. Test provider connection
node scripts/provider-bridge.js test-connection
```

### Manual Migration

If automated migration fails:

1. **Create provider config**:
```bash
mkdir -p .flowforge/providers
cp templates/provider-config.json .flowforge/providers/config.json
```

2. **Update configuration**:
- Set your provider type (json, github, notion)
- Add credentials (tokens, API keys)
- Configure sync settings

3. **Import existing tasks**:
```bash
node scripts/import-v1-tasks.js
```

---

## Troubleshooting

### Common Issues

#### Provider Not Found
```bash
Error: Provider 'github-main' not found
```
**Solution**: Check provider name in config matches exactly

#### Authentication Failed
```bash
Error: GitHub authentication failed
```
**Solution**: Verify GITHUB_TOKEN is set and has correct permissions

#### File Lock Timeout
```bash
Error: Could not acquire lock for tasks.json
```
**Solution**: Check for stale locks in `.flowforge/locks/`

#### Sync Conflicts
```bash
Warning: Conflict detected in task #123
```
**Solution**: Review `.flowforge/conflicts/` for resolution options

### Debug Commands

```bash
# Enable debug logging
export DEBUG=flowforge:*

# Check provider status
node scripts/provider-bridge.js status --verbose

# Validate configuration
node scripts/provider-bridge.js validate-config

# Test provider connection
node scripts/provider-bridge.js test-connection --provider=github-main

# Force sync
node scripts/provider-bridge.js sync --force

# Clear cache
rm -rf .flowforge/cache/*
```

---

## Best Practices

### 1. **Start Simple**
- Begin with JSON provider
- Add cloud providers as needed
- Use hybrid mode for gradual migration

### 2. **Security**
- Never commit tokens/keys
- Use environment variables
- Rotate credentials regularly
- Enable audit logging

### 3. **Performance**
- Adjust sync intervals based on team size
- Enable caching for read operations
- Use batch operations for bulk updates
- Monitor lock contention

### 4. **Reliability**
- Always configure fallback provider
- Enable local JSON cache
- Test failover scenarios
- Regular backups

### 5. **Team Collaboration**
- Document provider configuration
- Share environment setup instructions
- Establish conflict resolution procedures
- Monitor lock usage

---

## Quick Reference

### Essential Commands

```bash
# Provider status
node scripts/provider-bridge.js get-provider

# List tasks
node scripts/provider-bridge.js list-tasks

# Create task
node scripts/provider-bridge.js create-task --title="Task" --priority=high

# Update task
node scripts/provider-bridge.js update-task --id=123 --status=done

# Start session
./run_ff_command.sh flowforge:session:start [issue]

# End session
./run_ff_command.sh flowforge:session:end "message"

# Check locks
node scripts/provider-bridge.js check-locks

# Sync providers
node scripts/provider-bridge.js sync
```

### Environment Variables

```bash
# GitHub
export GITHUB_TOKEN="ghp_..."
export GITHUB_OWNER="username"
export GITHUB_REPO="repo"

# Notion
export NOTION_API_KEY="secret_..."
export NOTION_DATABASE_ID="..."

# Debug
export DEBUG=flowforge:*
export FLOWFORGE_LOG_LEVEL=debug
```

### File Locations

```
.flowforge/
├── providers/
│   ├── config.json       # Provider configuration
│   └── cache/           # Provider cache
├── locks/               # File locks
├── conflicts/           # Conflict resolution
├── tasks.json          # JSON provider data
└── team.json           # Team configuration
```

---

## Monday Deployment Checklist

- [ ] FlowForge v2.0 installed
- [ ] Provider configuration created
- [ ] Environment variables set
- [ ] File locking enabled
- [ ] Team configuration added
- [ ] Test session:start works
- [ ] Test session:end works
- [ ] Verify task creation
- [ ] Check lock mechanism
- [ ] Document team procedures

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review logs in `.flowforge/logs/`
3. Run diagnostic: `node scripts/diagnose-providers.js`
4. Contact FlowForge team

---

*FlowForge v2.0 - Provider System Documentation*
*Ready for Monday deployment to 6-developer team*