# FlowForge v2.0 Migration Guide

## 🎯 Overview

This guide helps you migrate from FlowForge v1.x (legacy mode) to v2.0 (namespace mode) with **zero data loss** and minimal downtime.

## 📋 Pre-Migration Checklist

### ✅ Before You Start

- [ ] **Backup your data**: Current `.flowforge/` directory
- [ ] **Complete active sessions**: Run `./run_ff_command.sh flowforge:session:end`
- [ ] **Team coordination**: Ensure all developers know about the migration
- [ ] **FlowForge v2.0 installed**: Verify with `./run_ff_command.sh flowforge:version:check`
- [ ] **Developer assignments**: Check your ID in `.flowforge/team/config.json`

### 📊 Check Current State

```bash
# 1. Check FlowForge version
./run_ff_command.sh flowforge:version:check

# 2. Check if you have active sessions
cat .flowforge/sessions/current.json 2>/dev/null || echo "No active session"

# 3. Check your data size
du -sh .flowforge/

# 4. List important files
find .flowforge/ -name "*.json" -type f | head -10
```

## 🚀 Migration Process

### Step 1: Create Backup

```bash
# Create timestamped backup
BACKUP_DIR=".flowforge-backup-$(date +%Y%m%d-%H%M%S)"
cp -r .flowforge/ "$BACKUP_DIR"
echo "Backup created: $BACKUP_DIR"

# Verify backup
ls -la "$BACKUP_DIR"
```

### Step 2: Identify Your Developer ID

```bash
# Method 1: Check team configuration
cat .flowforge/team/config.json | jq '.team.developers | keys[]'

# Method 2: Match by email
GIT_EMAIL=$(git config --global user.email)
cat .flowforge/team/config.json | jq -r --arg email "$GIT_EMAIL" '
  .team.developers | to_entries[] |
  select(.value.email == $email) | .key
'

# Method 3: Get assignment from admin
echo "If no match found, contact your team admin for your developer ID"
```

### Step 3: Initialize Your Namespace

```bash
# Set your developer ID (replace dev1 with your assigned ID)
export FLOWFORGE_DEVELOPER=dev1

# Initialize namespace with migration
./run_ff_command.sh flowforge:dev:namespace-init

# Verify namespace was created
ls -la .flowforge/dev-$FLOWFORGE_DEVELOPER/
```

### Step 4: Migrate Your Data

```bash
# Run automatic migration
./scripts/namespace/integrate.sh migrate $FLOWFORGE_DEVELOPER

# What this does:
# ✅ Copies .flowforge/sessions/current.json → .flowforge/dev-dev1/sessions/current.json
# ✅ Copies .flowforge/cache/*.json → .flowforge/dev-dev1/cache/
# ✅ Preserves session history
# ✅ Maintains time tracking data
```

### Step 5: Verify Migration

```bash
# Check your namespace
./run_ff_command.sh flowforge:dev:namespace-status

# Compare with backup
echo "Original sessions:"
cat "$BACKUP_DIR/sessions/current.json" | jq '.active, .sessionId'

echo "Migrated sessions:"
cat ".flowforge/dev-$FLOWFORGE_DEVELOPER/sessions/current.json" | jq '.active, .sessionId'

# Check cache migration
echo "Cache files migrated:"
ls -la ".flowforge/dev-$FLOWFORGE_DEVELOPER/cache/"
```

### Step 6: Test Functionality

```bash
# Test session start/end
./run_ff_command.sh flowforge:session:start 999  # Use test task ID
./run_ff_command.sh flowforge:session:end "Migration test successful"

# Test namespace status
./run_ff_command.sh flowforge:dev:namespace-status

# Test team coordination
./scripts/namespace/integrate.sh active
```

## 🔄 Migration Scenarios

### Scenario 1: Single Developer Migration

**Best for**: Individual developers migrating their personal workspace

```bash
# 1. Backup
cp -r .flowforge/ .flowforge-backup

# 2. Set developer ID
export FLOWFORGE_DEVELOPER=alice

# 3. Initialize and migrate
./run_ff_command.sh flowforge:dev:namespace-init
./scripts/namespace/integrate.sh migrate alice

# 4. Test
./run_ff_command.sh flowforge:session:start test-123
./run_ff_command.sh flowforge:session:end "Migration test"
```

### Scenario 2: Team Migration (Coordinated)

**Best for**: Teams migrating together at scheduled time

```bash
# TEAM LEAD coordinates this process

# 1. Announce migration window
echo "Team migration starting at 2 PM - all sessions must be ended"

# 2. Each developer runs:
./run_ff_command.sh flowforge:session:end "Pre-migration cleanup"

# 3. Team lead backs up shared data
cp -r .flowforge/ .flowforge-team-backup-$(date +%Y%m%d-%H%M%S)

# 4. Each developer migrates individually
# (Follow Scenario 1 steps)

# 5. Verify team status
./scripts/namespace/integrate.sh active
```

### Scenario 3: Rolling Migration

**Best for**: Large teams migrating gradually over time

```bash
# Phase 1: Early adopters (2-3 developers)
export FLOWFORGE_DEVELOPER=dev1
./run_ff_command.sh flowforge:dev:namespace-init
./scripts/namespace/integrate.sh migrate dev1

# Phase 2: Remaining developers (next day)
export FLOWFORGE_DEVELOPER=dev2
./run_ff_command.sh flowforge:dev:namespace-init
./scripts/namespace/integrate.sh migrate dev2

# Note: Legacy and namespace modes work simultaneously!
```

## 🔄 Rollback Procedures

### Quick Rollback (Emergency)

If something goes wrong, you can quickly rollback:

```bash
# 1. Stop using namespace
unset FLOWFORGE_DEVELOPER

# 2. Restore from backup
rm -rf .flowforge/
mv .flowforge-backup-* .flowforge/

# 3. Verify legacy mode works
./run_ff_command.sh flowforge:session:start test-456
./run_ff_command.sh flowforge:session:end "Rollback test"
```

### Selective Rollback

Rollback specific data types:

```bash
# Rollback sessions only
cp .flowforge-backup/sessions/current.json .flowforge/sessions/

# Rollback cache only
rm -rf .flowforge/cache/
cp -r .flowforge-backup/cache/ .flowforge/cache/

# Rollback specific developer namespace
rm -rf ".flowforge/dev-$FLOWFORGE_DEVELOPER"
```

### Planned Rollback

For planned rollbacks (e.g., after testing):

```bash
# 1. Document reasons for rollback
echo "Rollback reason: [INSERT REASON]" > migration-rollback.log
echo "Rollback time: $(date)" >> migration-rollback.log

# 2. Export namespace data (in case you want it later)
tar -czf "namespace-export-$(date +%Y%m%d).tar.gz" .flowforge/dev-*/

# 3. Restore backup
mv .flowforge/ .flowforge-namespace-attempt/
mv .flowforge-backup/ .flowforge/

# 4. Test legacy functionality
./run_ff_command.sh flowforge:dev:status
```

## 📊 Data Preservation Guide

### What Gets Migrated Automatically

✅ **Session Data**
- Current session state (`current.json`)
- Session history (if exists)
- Time tracking data

✅ **Cache Data**
- Provider cache (GitHub, Linear, etc.)
- Command output cache
- Time tracking cache

✅ **Configuration**
- Developer preferences
- Custom settings

### What Stays in Original Location

🔄 **Shared Data** (unchanged)
- `.flowforge/tasks.json` - Task database
- `.flowforge/team/config.json` - Team configuration
- `.flowforge/hooks/` - Git hooks
- `.flowforge/rules.json` - FlowForge rules

### What Gets Created New

🆕 **Namespace Structure**
- Developer-specific directories
- Isolated workspace
- Personal logs directory

## ⚠️ Common Migration Issues

### Issue 1: "Developer not found in team config"

**Problem**: Your developer ID isn't in the team configuration

**Solution**:
```bash
# Check current team config
cat .flowforge/team/config.json | jq '.team.developers'

# Add yourself (if you're admin) or contact admin
# Admin can add you with:
jq '.team.developers.newdev = {
  "name": "Your Name",
  "email": "your@email.com",
  "role": "developer"
}' .flowforge/team/config.json > temp.json && mv temp.json .flowforge/team/config.json
```

### Issue 2: "Migration partially failed"

**Problem**: Some files didn't migrate correctly

**Solution**:
```bash
# Check what's missing
diff -r .flowforge-backup/ .flowforge/dev-$FLOWFORGE_DEVELOPER/

# Manual copy missing files
cp .flowforge-backup/sessions/current.json .flowforge/dev-$FLOWFORGE_DEVELOPER/sessions/
cp .flowforge-backup/cache/*.json .flowforge/dev-$FLOWFORGE_DEVELOPER/cache/
```

### Issue 3: "Namespace already exists"

**Problem**: Trying to migrate when namespace already exists

**Solution**:
```bash
# Check if you already migrated
./run_ff_command.sh flowforge:dev:namespace-status

# If you want to re-migrate:
rm -rf ".flowforge/dev-$FLOWFORGE_DEVELOPER"
./scripts/namespace/integrate.sh migrate $FLOWFORGE_DEVELOPER
```

### Issue 4: "Large cache migration slow"

**Problem**: Migration takes too long due to large cache

**Solution**:
```bash
# Skip cache migration initially
./run_ff_command.sh flowforge:dev:namespace-init

# Manually migrate only recent cache files
find .flowforge-backup/cache/ -name "*.json" -mtime -7 -exec cp {} .flowforge/dev-$FLOWFORGE_DEVELOPER/cache/ \;
```

## 🧪 Testing Your Migration

### Functional Tests

```bash
# Test 1: Session management
./run_ff_command.sh flowforge:session:start test-001
sleep 5
./run_ff_command.sh flowforge:session:end "Migration test 1"

# Test 2: Cache functionality
./run_ff_command.sh flowforge:dev:status

# Test 3: Team coordination
./scripts/namespace/integrate.sh active

# Test 4: Task conflict detection
./scripts/namespace/integrate.sh check test-002
```

### Data Integrity Tests

```bash
# Compare session data
echo "Backup session data:"
cat .flowforge-backup/sessions/current.json | jq

echo "Migrated session data:"
cat .flowforge/dev-$FLOWFORGE_DEVELOPER/sessions/current.json | jq

# Check cache file counts
echo "Backup cache files: $(ls .flowforge-backup/cache/ | wc -l)"
echo "Migrated cache files: $(ls .flowforge/dev-$FLOWFORGE_DEVELOPER/cache/ | wc -l)"

# Verify time tracking data
if [[ -f ".flowforge-backup/cache/time-tracking.json" ]]; then
  echo "Time tracking data preserved:"
  diff .flowforge-backup/cache/time-tracking.json .flowforge/dev-$FLOWFORGE_DEVELOPER/cache/time-tracking.json
fi
```

### Performance Tests

```bash
# Test session start speed
time ./run_ff_command.sh flowforge:session:start perf-test

# Test namespace switch speed
time ./run_ff_command.sh flowforge:dev:switch $FLOWFORGE_DEVELOPER

# Test cache access speed
time ./run_ff_command.sh flowforge:dev:status
```

## 📈 Migration Timeline

### Recommended Schedule

**Week Before**:
- [ ] Announce migration to team
- [ ] Test migration on staging environment
- [ ] Prepare rollback procedures
- [ ] Schedule migration window

**Day Of**:
- [ ] T-30min: Team notification
- [ ] T-15min: End all active sessions
- [ ] T-0: Begin migration
- [ ] T+15min: Verify migrations
- [ ] T+30min: Resume normal operations

**Day After**:
- [ ] Monitor for issues
- [ ] Collect feedback
- [ ] Document lessons learned
- [ ] Clean up backup files (after 1 week)

## 🎉 Post-Migration Checklist

### Immediate Verification

- [ ] Your namespace exists: `ls .flowforge/dev-$FLOWFORGE_DEVELOPER/`
- [ ] Session data migrated: `cat .flowforge/dev-$FLOWFORGE_DEVELOPER/sessions/current.json`
- [ ] Cache files present: `ls .flowforge/dev-$FLOWFORGE_DEVELOPER/cache/`
- [ ] Team status works: `./scripts/namespace/integrate.sh active`
- [ ] Session management works: Test start/end cycle

### Team Coordination

- [ ] All developers migrated successfully
- [ ] Team can see each other: `./scripts/namespace/integrate.sh active`
- [ ] No task conflicts: Test with known task IDs
- [ ] Shared files accessible: `cat .flowforge/tasks.json`

### Cleanup (After 1 Week)

```bash
# Remove backup files (only after confirming everything works)
rm -rf .flowforge-backup-*

# Remove legacy cache files (if migration was successful)
# Note: Be very careful with this step
rm -rf .flowforge/cache/  # Only if you're 100% sure
rm -rf .flowforge/sessions/  # Only if you're 100% sure
```

## 🆘 Getting Help

### Self-Help Resources

1. **Check Status**: `./run_ff_command.sh flowforge:dev:namespace-status`
2. **View Logs**: `cat .flowforge/logs/namespace-manager.log`
3. **Team Status**: `./scripts/namespace/integrate.sh active`

### Team Support

1. **Share Migration Log**: Copy output from migration commands
2. **Provide Backup Location**: Tell admin where your backup is
3. **Describe Issue**: Specific error messages or unexpected behavior

### Emergency Contacts

If migration fails completely:
1. **Immediate**: Restore from backup (see Rollback section)
2. **Report**: Document issue for team learning
3. **Coordinate**: Wait for team-wide resolution if needed

---

**Remember**: Migration is reversible! Don't panic if something goes wrong - you can always rollback and try again. 🛟

---

*Migration guide updated for FlowForge v2.0 | September 2025*