# FlowForge v2.0 Migration Guide

**Version**: 2.0.0
**Migration Path**: v1.x → v2.0 Provider System
**Last Updated**: September 2025

---

## 📋 Migration Overview

This guide covers the complete migration from FlowForge v1.x (Markdown-based) to v2.0 (Provider-based) task management system.

### What's Changing

| Component | v1.x | v2.0 |
|-----------|------|------|
| **Task Storage** | `TASKS.md` | `.flowforge/tasks.json` |
| **Session Data** | `NEXT_SESSION.md` | `.flowforge/sessions/` |
| **Schedule** | `SCHEDULE.md` | `.flowforge/tasks.json` (milestones) |
| **Task Operations** | Markdown parsing | Provider Bridge API |
| **Time Tracking** | Manual MD updates | Automated JSON updates |
| **Team Collaboration** | Git conflicts in MD | File locking + sync |

### Migration Benefits

- ✅ **Atomic Operations**: No more partial file updates
- ✅ **Concurrent Access**: File locking prevents conflicts
- ✅ **Provider Flexibility**: JSON, GitHub, Notion backends
- ✅ **Better Performance**: Structured data vs. text parsing
- ✅ **Rich Metadata**: Timestamps, user tracking, session data
- ✅ **Automated Backups**: Built-in data protection

---

## 🔍 Pre-Migration Assessment

### Check Current FlowForge Version

```bash
# Method 1: Check version in config
if [ -f .flowforge/config.json ]; then
  jq -r '.version // "v1.x"' .flowforge/config.json
else
  echo "v1.x (no config.json found)"
fi

# Method 2: Check for provider system
if [ -f scripts/provider-bridge.js ]; then
  echo "v2.0 components detected"
else
  echo "v1.x system"
fi
```

### Inventory Current Data

```bash
#!/bin/bash
# Save as: scripts/pre-migration-inventory.sh

echo "📊 Pre-Migration Inventory"
echo "=========================="

# Check existing files
echo "📄 Current Files:"
for file in TASKS.md SCHEDULE.md documentation/development/NEXT_SESSION.md; do
  if [ -f "$file" ]; then
    LINES=$(wc -l < "$file")
    SIZE=$(du -h "$file" | cut -f1)
    echo "  ✅ $file: $LINES lines, $SIZE"
  else
    echo "  ❌ $file: Not found"
  fi
done

# Count tasks in TASKS.md
if [ -f TASKS.md ]; then
  TASK_COUNT=$(grep -c "^[0-9]" TASKS.md || echo "0")
  echo "  📋 Total tasks: $TASK_COUNT"
fi

# Check git status
echo -e "\n🔄 Git Status:"
if git status --porcelain | grep -q .; then
  echo "  ⚠️  Uncommitted changes detected"
  git status --porcelain
else
  echo "  ✅ Working directory clean"
fi

# Check for existing .flowforge directory
echo -e "\n📁 FlowForge Directory:"
if [ -d .flowforge ]; then
  echo "  ✅ .flowforge exists"
  ls -la .flowforge/
else
  echo "  ❌ .flowforge not found"
fi

echo "=========================="
```

### Backup Current System

```bash
#!/bin/bash
# Save as: scripts/backup-v1.sh

BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="flowforge-v1-backup-$BACKUP_DATE"

echo "💾 Creating v1.x Backup"
echo "======================"

mkdir -p "$BACKUP_DIR"

# Backup key files
for file in TASKS.md SCHEDULE.md CLAUDE.md README.md; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/"
    echo "✅ Backed up: $file"
  fi
done

# Backup documentation
if [ -d documentation ]; then
  cp -r documentation "$BACKUP_DIR/"
  echo "✅ Backed up: documentation/"
fi

# Backup .flowforge directory
if [ -d .flowforge ]; then
  cp -r .flowforge "$BACKUP_DIR/"
  echo "✅ Backed up: .flowforge/"
fi

# Backup commands
if [ -d commands ]; then
  cp -r commands "$BACKUP_DIR/"
  echo "✅ Backed up: commands/"
fi

# Backup scripts
if [ -d scripts ]; then
  cp -r scripts "$BACKUP_DIR/"
  echo "✅ Backed up: scripts/"
fi

# Create backup info
cat > "$BACKUP_DIR/BACKUP_INFO.md" << EOF
# FlowForge v1.x Backup

**Created**: $(date)
**Source Version**: v1.x
**Target Version**: v2.0

## Backup Contents
- TASKS.md (if exists)
- SCHEDULE.md (if exists)
- CLAUDE.md
- README.md
- documentation/ directory
- .flowforge/ directory
- commands/ directory
- scripts/ directory

## Restoration
To restore this backup:
1. \`rm -rf .flowforge commands scripts documentation\`
2. \`cp -r $BACKUP_DIR/* .\`
3. \`git checkout HEAD -- .\` (if needed)

**Backup Directory**: $BACKUP_DIR
EOF

echo -e "\n✅ Backup completed: $BACKUP_DIR"
echo "📄 Backup info: $BACKUP_DIR/BACKUP_INFO.md"
echo "======================"
```

---

## 🔄 Automated Migration

### Using Migration Script

FlowForge v2.0 includes an automated migration script:

```bash
# Run the migration script
./scripts/migrate-to-json-provider.sh
```

**Migration Script Actions**:
1. Creates timestamped backups of all modified files
2. Updates references from `TASKS.md` to `.flowforge/tasks.json`
3. Updates `NEXT_SESSION.md` references to provider system
4. Updates `SCHEDULE.md` references to milestones in JSON
5. Converts command files to use provider bridge
6. Creates default provider configuration
7. Adds migration notices to deprecated files

### Expected Output

```
🔄 FlowForge Migration: MD Files → JSON Provider System
=======================================================

📄 Phase 1: Updating Critical Documentation
-------------------------------------------
✅ Backed up: CLAUDE.md
✅ Updated: CLAUDE.md
✅ Backed up: README.md
✅ Updated: README.md

⚙️  Phase 2: Updating FlowForge Commands
----------------------------------------
✅ Updated: commands/flowforge/session/start.md
✅ Updated: commands/flowforge/session/end.md
✅ Updated: commands/flowforge/project/plan.md

🔧 Phase 3: Updating Shell Scripts
----------------------------------
✅ Updated: scripts/task-time.sh
⏭️  Skipped (no changes needed): scripts/install-flowforge.sh

🌉 Phase 5: Setting Up Provider Bridge Helpers
----------------------------------------------
✅ Created: scripts/task-query.sh

📝 Phase 6: Adding Migration Notices
------------------------------------
⚠️  Marked as deprecated: TASKS.md
⚠️  Marked as deprecated: SCHEDULE.md

================================================================
✅ Migration Summary
================================================================
Files updated: 8

Updated files:
  - CLAUDE.md
  - README.md
  - commands/flowforge/session/start.md
  - commands/flowforge/session/end.md
  - commands/flowforge/project/plan.md
  - scripts/task-time.sh

📋 Next Steps:
1. Review the changes with: git diff
2. Test task operations: node scripts/provider-bridge.js list-tasks
3. Verify time tracking: ./scripts/task-time.sh status 101
4. Commit changes when satisfied

✨ Migration complete!
```

---

## 📊 Manual Migration Steps

If automated migration fails or you need custom migration:

### Step 1: Create Provider Configuration

```bash
# Create provider directories
mkdir -p .flowforge/providers

# Create basic JSON provider config
cat > .flowforge/providers/config.json << 'EOF'
{
  "version": "2.0.0",
  "mode": "json",
  "defaultProvider": "json-migrated",
  "providers": [
    {
      "name": "json-migrated",
      "type": "json",
      "enabled": true,
      "priority": 1,
      "settings": {
        "filePath": ".flowforge/tasks.json",
        "autoSave": true,
        "saveInterval": 5000,
        "backupEnabled": true,
        "migrationSource": "v1.x"
      }
    }
  ],
  "sync": {
    "enabled": false,
    "interval": 300000
  },
  "migration": {
    "version": "v1.x",
    "date": "2025-09-16T00:00:00Z",
    "automated": false
  }
}
EOF
```

### Step 2: Convert TASKS.md to JSON

```bash
#!/bin/bash
# Save as: scripts/convert-tasks-md.sh

echo "📋 Converting TASKS.md to JSON"
echo "=============================="

if [ ! -f TASKS.md ]; then
  echo "❌ TASKS.md not found"
  exit 1
fi

# Create basic JSON structure
cat > .flowforge/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "metadata": {
    "created": "2025-09-16T00:00:00Z",
    "lastModified": "2025-09-16T00:00:00Z",
    "source": "migrated_from_tasks_md",
    "migrationDate": "2025-09-16T00:00:00Z"
  },
  "tasks": []
}
EOF

echo "✅ Created basic tasks.json structure"

# Parse TASKS.md (simplified - you may need to customize this)
echo "🔄 Parsing TASKS.md..."

# This is a basic parser - customize based on your TASKS.md format
TASK_COUNT=0
while IFS= read -r line; do
  if [[ $line =~ ^([0-9]+):[[:space:]]*(.+)$ ]]; then
    TASK_ID="${BASH_REMATCH[1]}"
    TASK_TITLE="${BASH_REMATCH[2]}"

    # Basic status detection
    STATUS="todo"
    if [[ $TASK_TITLE =~ \[completed\]|\[done\]|\[x\] ]]; then
      STATUS="completed"
    elif [[ $TASK_TITLE =~ \[in.progress\]|\[working\] ]]; then
      STATUS="in_progress"
    elif [[ $TASK_TITLE =~ \[ready\]|\[todo\] ]]; then
      STATUS="ready"
    fi

    # Clean title
    CLEAN_TITLE=$(echo "$TASK_TITLE" | sed -E 's/\[[^\]]*\]//g' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    echo "  📝 Task $TASK_ID: $CLEAN_TITLE [$STATUS]"
    ((TASK_COUNT++))
  fi
done < TASKS.md

echo "✅ Parsed $TASK_COUNT tasks from TASKS.md"
echo "⚠️  Manual JSON creation required for complex task data"
echo "=============================="
```

### Step 3: Update Command References

```bash
#!/bin/bash
# Save as: scripts/update-references.sh

echo "🔄 Updating File References"
echo "==========================="

# Update CLAUDE.md
if [ -f CLAUDE.md ]; then
  cp CLAUDE.md CLAUDE.md.backup-$(date +%Y%m%d-%H%M%S)

  sed -i 's|TASKS\.md|.flowforge/tasks.json (via provider)|g' CLAUDE.md
  sed -i 's|NEXT_SESSION\.md|.flowforge/tasks.json|g' CLAUDE.md
  sed -i 's|SCHEDULE\.md|.flowforge/tasks.json (milestones)|g' CLAUDE.md

  echo "✅ Updated: CLAUDE.md"
fi

# Update command files
find commands/flowforge -name "*.md" -type f | while read -r file; do
  if grep -q -E "TASKS\.md|NEXT_SESSION\.md|SCHEDULE\.md" "$file"; then
    cp "$file" "${file}.backup-$(date +%Y%m%d-%H%M%S)"

    sed -i 's|TASKS\.md|.flowforge/tasks.json|g' "$file"
    sed -i 's|NEXT_SESSION\.md|.flowforge/tasks.json|g' "$file"
    sed -i 's|SCHEDULE\.md|.flowforge/tasks.json|g' "$file"

    echo "✅ Updated: $file"
  fi
done

echo "==========================="
```

### Step 4: Update Script References

```bash
#!/bin/bash
# Save as: scripts/update-script-references.sh

echo "🔧 Updating Script References"
echo "============================="

# Update scripts that reference old files
find scripts -name "*.sh" -type f | while read -r script; do
  if grep -q -E "TASKS\.md|NEXT_SESSION\.md" "$script"; then
    cp "$script" "${script}.backup-$(date +%Y%m%d-%H%M%S)"

    # Replace with provider bridge calls
    sed -i 's|grep.*TASKS\.md|node scripts/provider-bridge.js list-tasks|g' "$script"
    sed -i 's|awk.*TASKS\.md|node scripts/provider-bridge.js list-tasks --format=simple|g' "$script"

    echo "✅ Updated: $script"
  fi
done

echo "============================="
```

---

## ✅ Post-Migration Verification

### Verification Checklist

```bash
#!/bin/bash
# Save as: scripts/verify-migration.sh

echo "✅ Migration Verification"
echo "========================"

VERIFICATION_PASSED=true

# 1. Check provider system
echo "🔧 Testing Provider System:"
if node scripts/provider-bridge.js get-provider > /dev/null 2>&1; then
  echo "  ✅ Provider system: OK"
else
  echo "  ❌ Provider system: FAILED"
  VERIFICATION_PASSED=false
fi

# 2. Test basic operations
echo -e "\n📋 Testing Basic Operations:"
if node scripts/provider-bridge.js list-tasks > /dev/null 2>&1; then
  echo "  ✅ List tasks: OK"
else
  echo "  ❌ List tasks: FAILED"
  VERIFICATION_PASSED=false
fi

# 3. Test task creation
echo -e "\n➕ Testing Task Creation:"
if TASK_ID=$(node scripts/provider-bridge.js create-task --title="Migration test" --status=ready 2>/dev/null | jq -r '.id // empty'); then
  if [ -n "$TASK_ID" ]; then
    echo "  ✅ Create task: OK (ID: $TASK_ID)"

    # Clean up test task
    node scripts/provider-bridge.js update-task --id="$TASK_ID" --status=completed > /dev/null 2>&1
  else
    echo "  ❌ Create task: No ID returned"
    VERIFICATION_PASSED=false
  fi
else
  echo "  ❌ Create task: FAILED"
  VERIFICATION_PASSED=false
fi

# 4. Check file references
echo -e "\n📄 Checking File References:"
if grep -r "TASKS\.md" commands/ > /dev/null 2>&1; then
  echo "  ⚠️  Found unreplaced TASKS.md references"
  grep -r "TASKS\.md" commands/ | head -3
  VERIFICATION_PASSED=false
else
  echo "  ✅ No TASKS.md references found"
fi

# 5. Test session management
echo -e "\n⏰ Testing Session Management:"
if [ -f commands/flowforge/session/start.md ]; then
  # Check if it uses provider bridge
  if grep -q "provider-bridge.js" commands/flowforge/session/start.md; then
    echo "  ✅ Session start: Updated to use provider bridge"
  else
    echo "  ⚠️  Session start: May not use provider bridge"
  fi
else
  echo "  ❌ Session start command not found"
  VERIFICATION_PASSED=false
fi

# 6. Verify JSON structure
echo -e "\n📊 Verifying JSON Structure:"
if [ -f .flowforge/tasks.json ]; then
  if jq empty .flowforge/tasks.json 2>/dev/null; then
    echo "  ✅ tasks.json: Valid JSON"
  else
    echo "  ❌ tasks.json: Invalid JSON"
    VERIFICATION_PASSED=false
  fi
else
  echo "  ❌ tasks.json: Not found"
  VERIFICATION_PASSED=false
fi

# Final result
echo -e "\n========================"
if [ "$VERIFICATION_PASSED" = true ]; then
  echo "🎉 Migration verification: PASSED"
  echo "✅ System ready for use"
else
  echo "❌ Migration verification: FAILED"
  echo "⚠️  Manual fixes required"
  exit 1
fi
echo "========================"
```

### Functional Testing

```bash
# Test complete workflow
echo "🧪 Functional Testing"
echo "===================="

# 1. Test session workflow
echo "1. Testing session workflow..."
if ./run_ff_command.sh flowforge:session:start 1 > /dev/null 2>&1; then
  echo "   ✅ Session start: OK"

  if ./run_ff_command.sh flowforge:session:end "Migration test" > /dev/null 2>&1; then
    echo "   ✅ Session end: OK"
  else
    echo "   ❌ Session end: FAILED"
  fi
else
  echo "   ❌ Session start: FAILED"
fi

# 2. Test time tracking
echo "2. Testing time tracking..."
# (Add time tracking tests here)

# 3. Test task queries
echo "3. Testing task queries..."
READY_TASKS=$(node scripts/provider-bridge.js list-tasks --status=ready --format=simple | wc -l)
echo "   📊 Ready tasks found: $READY_TASKS"

echo "===================="
```

---

## 🔄 Rollback Procedures

### Quick Rollback

If migration fails and you need to return to v1.x:

```bash
#!/bin/bash
# Save as: scripts/rollback-migration.sh

echo "🔄 Rolling Back Migration"
echo "========================"

# Find latest backup
LATEST_BACKUP=$(ls -td flowforge-v1-backup-* 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "❌ No backup found"
  echo "Manual restoration required"
  exit 1
fi

echo "📁 Using backup: $LATEST_BACKUP"

# Restore key files
for file in TASKS.md SCHEDULE.md CLAUDE.md README.md; do
  if [ -f "$LATEST_BACKUP/$file" ]; then
    cp "$LATEST_BACKUP/$file" .
    echo "✅ Restored: $file"
  fi
done

# Restore directories
for dir in documentation commands scripts; do
  if [ -d "$LATEST_BACKUP/$dir" ]; then
    rm -rf "$dir"
    cp -r "$LATEST_BACKUP/$dir" .
    echo "✅ Restored: $dir/"
  fi
done

# Remove v2.0 provider configuration
if [ -d .flowforge/providers ]; then
  mv .flowforge/providers .flowforge/providers.v2-backup
  echo "⚠️  Moved provider config to: .flowforge/providers.v2-backup"
fi

echo "========================"
echo "✅ Rollback completed"
echo "ℹ️  You may need to run: git checkout HEAD -- ."
echo "========================"
```

### Selective Rollback

To rollback specific components:

```bash
# Rollback CLAUDE.md only
if [ -f CLAUDE.md.backup-* ]; then
  LATEST_CLAUDE_BACKUP=$(ls -t CLAUDE.md.backup-* | head -1)
  cp "$LATEST_CLAUDE_BACKUP" CLAUDE.md
  echo "✅ Restored CLAUDE.md from $LATEST_CLAUDE_BACKUP"
fi

# Rollback specific command
COMMAND_FILE="commands/flowforge/session/start.md"
if [ -f "${COMMAND_FILE}.backup-"* ]; then
  LATEST_BACKUP=$(ls -t "${COMMAND_FILE}.backup-"* | head -1)
  cp "$LATEST_BACKUP" "$COMMAND_FILE"
  echo "✅ Restored $COMMAND_FILE"
fi
```

---

## 🚀 Migration Best Practices

### 1. Staged Migration

For large teams or complex projects:

```bash
# Phase 1: Setup (Week 1)
# - Install v2.0 but keep v1.x active
# - Run dual systems
# - Train team on new commands

# Phase 2: Testing (Week 2)
# - Migrate non-critical tasks
# - Test provider integrations
# - Validate workflow

# Phase 3: Full Migration (Week 3)
# - Complete migration
# - Decommission v1.x files
# - Monitor for issues
```

### 2. Data Validation

```bash
#!/bin/bash
# Save as: scripts/validate-migration-data.sh

echo "📊 Migration Data Validation"
echo "============================"

# Count tasks before and after
if [ -f TASKS.md ]; then
  OLD_COUNT=$(grep -c "^[0-9]" TASKS.md || echo "0")
  echo "📋 Original task count: $OLD_COUNT"
fi

if [ -f .flowforge/tasks.json ]; then
  NEW_COUNT=$(jq '.tasks | length' .flowforge/tasks.json)
  echo "📋 Migrated task count: $NEW_COUNT"

  if [ "$OLD_COUNT" -eq "$NEW_COUNT" ]; then
    echo "✅ Task counts match"
  else
    echo "⚠️  Task count mismatch - review required"
  fi
fi

# Validate required task fields
echo -e "\n🔍 Validating task structure:"
jq '.tasks[] | select(.id == null or .title == null)' .flowforge/tasks.json > /tmp/invalid_tasks.json

if [ -s /tmp/invalid_tasks.json ]; then
  echo "❌ Found tasks with missing required fields:"
  cat /tmp/invalid_tasks.json
else
  echo "✅ All tasks have required fields"
fi

echo "============================"
```

### 3. Team Communication

**Migration Announcement Template:**

```markdown
# 🚀 FlowForge v2.0 Migration

## What's Happening
We're upgrading from FlowForge v1.x to v2.0 with the new provider system.

## Timeline
- **Today**: Migration begins
- **Testing**: 2 days
- **Full deployment**: End of week

## What Changes
- Task management moves from TASKS.md to .flowforge/tasks.json
- New commands use `node scripts/provider-bridge.js`
- Improved time tracking and conflict resolution

## Action Required
1. Pull latest changes
2. Run migration verification: `./scripts/verify-migration.sh`
3. Test basic workflow: `./run_ff_command.sh flowforge:session:start [issue]`

## Support
- Migration guide: [link]
- Troubleshooting: [link]
- Slack channel: #flowforge-migration

## Rollback Plan
If issues arise, we can rollback using automated scripts.
```

### 4. Performance Monitoring

```bash
#!/bin/bash
# Save as: scripts/migration-performance-monitor.sh

echo "📈 Post-Migration Performance"
echo "============================="

# Test provider response times
START_TIME=$(date +%s%3N)
node scripts/provider-bridge.js get-provider > /dev/null 2>&1
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))

echo "⚡ Provider response time: ${RESPONSE_TIME}ms"

# Test task operations
START_TIME=$(date +%s%3N)
node scripts/provider-bridge.js list-tasks > /dev/null 2>&1
END_TIME=$(date +%s%3N)
LIST_TIME=$((END_TIME - START_TIME))

echo "📋 List tasks time: ${LIST_TIME}ms"

# Performance thresholds
if [ $RESPONSE_TIME -lt 1000 ]; then
  echo "✅ Provider performance: Good"
elif [ $RESPONSE_TIME -lt 3000 ]; then
  echo "⚠️  Provider performance: Acceptable"
else
  echo "❌ Provider performance: Poor"
fi

echo "============================="
```

---

## 📋 Migration Troubleshooting

### Common Issues

#### 1. Provider Bridge Not Found

```bash
# Error: command not found: node scripts/provider-bridge.js
# Solution: Verify installation
ls -la scripts/provider-bridge.js
npm install  # If Node.js dependencies missing
```

#### 2. JSON Syntax Errors

```bash
# Error: Unexpected token in JSON
# Solution: Validate and fix JSON
jq . .flowforge/tasks.json  # Check syntax
jq . .flowforge/providers/config.json  # Check config
```

#### 3. Permission Errors

```bash
# Error: EACCES permission denied
# Solution: Fix file permissions
chmod 644 .flowforge/tasks.json
chmod 644 .flowforge/providers/config.json
```

#### 4. Missing Dependencies

```bash
# Error: Cannot find module
# Solution: Install dependencies
npm install
# Or check for required tools
which node jq
```

### Recovery Procedures

#### Corrupted tasks.json

```bash
# Restore from backup
if [ -f .flowforge/backups/tasks*.json ]; then
  LATEST=$(ls -t .flowforge/backups/tasks*.json | head -1)
  cp "$LATEST" .flowforge/tasks.json
  echo "Restored from: $LATEST"
fi
```

#### Lost Configuration

```bash
# Recreate basic configuration
mkdir -p .flowforge/providers
node scripts/provider-bridge.js get-provider  # Auto-creates default
```

---

**✅ Migration Complete!**

After successful migration:
1. ✅ All team members verify functionality
2. ✅ Update documentation links
3. ✅ Archive v1.x backup files
4. ✅ Update team processes
5. ✅ Monitor performance for first week

For ongoing support, see [Provider Setup Guide](./PROVIDER_SETUP_GUIDE.md) and [Team Configuration](./TEAM_CONFIGURATION.md).