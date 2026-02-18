# FlowForge v2.0 Namespace Troubleshooting - Common Issues

## 🎯 Quick Problem Solver

This guide covers the most common namespace issues encountered in daily development.

**For other issues, see:**
- [Advanced Troubleshooting](./troubleshooting-advanced.md) - Complex performance and system issues
- [Emergency Recovery](./troubleshooting-recovery.md) - Disaster recovery procedures
- [Main Troubleshooting Index](./troubleshooting.md) - Complete issue index

**Common Issues Covered:**
- [🚫 Initialization Problems](#-initialization-problems)
- [🔒 Lock File Issues](#-lock-file-issues)
- [💾 Cache Problems](#-cache-problems)
- [👥 Team Coordination Issues](#-team-coordination-issues)

---

## 🚫 Initialization Problems

### Problem: "Developer not detected"

**Symptoms:**
```bash
./run_ff_command.sh flowforge:dev:namespace-init
# Output: ERROR: No developer ID provided or detected
```

**Diagnosis:**
```bash
# Check current detection
source scripts/namespace/manager.sh && get_developer_id
# Returns: (empty)

# Check git configuration
git config --global user.email
git config --global user.name

# Check team configuration
cat .flowforge/team/config.json | jq '.team.developers'
```

**Solutions:**

#### Solution 1: Set Environment Variable
```bash
export FLOWFORGE_DEVELOPER=dev1
./run_ff_command.sh flowforge:dev:namespace-init
```

#### Solution 2: Fix Git Configuration
```bash
# Set git email to match team config
git config --global user.email "alice@company.com"
./run_ff_command.sh flowforge:dev:namespace-init
```

#### Solution 3: Add to Team Configuration
```bash
# If you're not in team config, ask admin to add you:
jq '.team.developers.newdev = {
  "name": "Your Name",
  "email": "your@email.com",
  "role": "developer",
  "active": true,
  "registeredAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"،
  "namespace": "newdev"
}' .flowforge/team/config.json > temp.json && mv temp.json .flowforge/team/config.json
```

### Problem: "Namespace already exists"

**Symptoms:**
```bash
./run_ff_command.sh flowforge:dev:namespace-init
# Output: Namespace already exists for developer: dev1
```

**Diagnosis:**
```bash
ls -la .flowforge/dev-dev1/
./run_ff_command.sh flowforge:dev:namespace-status
```

**Solutions:**

#### Solution 1: This is Normal (No Action Needed)
```bash
# If namespace exists and works, you're already set up!
./run_ff_command.sh flowforge:dev:namespace-status
./run_ff_command.sh flowforge:session:start test-123
```

#### Solution 2: Reinitialize if Corrupted
```bash
# Backup existing namespace
mv .flowforge/dev-dev1 .flowforge/dev-dev1.backup

# Reinitialize
./run_ff_command.sh flowforge:dev:namespace-init

# Restore data if needed
cp .flowforge/dev-dev1.backup/sessions/current.json .flowforge/dev-dev1/sessions/
```

### Problem: "Team configuration not found"

**Symptoms:**
```bash
./run_ff_command.sh flowforge:dev:namespace-init
# Output: Team configuration not found
```

**Diagnosis:**
```bash
ls -la .flowforge/team/
cat .flowforge/team/config.json
```

**Solutions:**

#### Solution 1: Initialize Team Configuration
```bash
# Create basic team config
mkdir -p .flowforge/team
cat > .flowforge/team/config.json << 'EOF'
{
  "version": "2.0.0",
  "team": {
    "id": "default-team",
    "name": "Development Team",
    "developers": {
      "dev1": {
        "name": "Developer 1",
        "email": "dev1@company.com",
        "role": "developer",
        "active": true,
        "namespace": "dev1"
      }
    }
  }
}
EOF
```

---

## 🔒 Lock File Issues

### Problem: "Lock timeout" errors

**Symptoms:**
```bash
./run_ff_command.sh flowforge:session:start 123
# Output: ERROR: Lock timeout acquiring tasks.json
```

**Diagnosis:**
```bash
# Check for lock files
ls -la .flowforge/locks/

# Check lock age
for lock in .flowforge/locks/*.lock; do
  if [[ -f "$lock" ]]; then
    echo "$lock created: $(stat -c %y "$lock")"
  fi
done
```

**Solutions:**

#### Solution 1: Wait for Lock Release (Recommended)
```bash
# Wait 30-60 seconds for automatic release
sleep 60
./run_ff_command.sh flowforge:session:start 123
```

#### Solution 2: Check Lock Owner
```bash
# See who owns the lock
cat .flowforge/locks/tasks.json.lock
# Output: PID:dev2:1664558400

# Contact the developer if needed
```

#### Solution 3: Remove Stale Locks (Careful!)
```bash
# Only if locks are older than 5 minutes
find .flowforge/locks/ -name "*.lock" -mmin +5 -delete

# Then retry
./run_ff_command.sh flowforge:session:start 123
```

### Problem: "Session lock already exists"

**Symptoms:**
```bash
./run_ff_command.sh flowforge:session:start 123
# Output: Session already locked for task 123
```

**Diagnosis:**
```bash
# Check session locks
ls -la .flowforge/dev-dev1/sessions/locks/

# Check session state
cat .flowforge/dev-dev1/sessions/current.json
```

**Solutions:**

#### Solution 1: End Existing Session
```bash
./run_ff_command.sh flowforge:session:end "Ending previous session"
./run_ff_command.sh flowforge:session:start 123
```

#### Solution 2: Resume Existing Session
```bash
# If you want to continue the same session
./run_ff_command.sh flowforge:session:start 123  # Will resume
```

#### Solution 3: Force Clear Session Lock
```bash
# Emergency only - removes all session locks
rm -f .flowforge/dev-dev1/sessions/locks/*.lock
./run_ff_command.sh flowforge:session:start 123
```

---

## 💾 Cache Problems

### Problem: "Cache too large" warnings

**Symptoms:**
```bash
./run_ff_command.sh flowforge:dev:namespace-status
# Output: ⚠️ Cache size: 120 MB / 100 MB (OVER LIMIT)
```

**Diagnosis:**
```bash
# Check cache size breakdown
du -sh .flowforge/dev-dev1/cache/
du -sh .flowforge/dev-dev1/cache/*

# Check cache contents
ls -la .flowforge/dev-dev1/cache/
```

**Solutions:**

#### Solution 1: Auto-Clean Cache
```bash
./run_ff_command.sh flowforge:dev:namespace-clean
```

#### Solution 2: Manual Cache Management
```bash
# Remove old temporary files
rm -f .flowforge/dev-dev1/cache/*.tmp

# Clear provider cache (will regenerate)
rm -f .flowforge/dev-dev1/cache/provider-cache.json

# Clear command cache (will regenerate)
rm -f .flowforge/dev-dev1/cache/command-cache.json

# Keep time tracking data (important!)
# DO NOT delete time-tracking.json
```

#### Solution 3: Increase Cache Limit (Admin)
```bash
# Edit team configuration
jq '.provider.cache.maxSize = "200MB"' .flowforge/team/config.json > temp.json && mv temp.json .flowforge/team/config.json
```

### Problem: "Cache corruption" errors

**Symptoms:**
```bash
./run_ff_command.sh flowforge:dev:status
# Output: ERROR: Invalid JSON in cache file
```

**Diagnosis:**
```bash
# Check cache file validity
for cache_file in .flowforge/dev-dev1/cache/*.json; do
  echo "Checking $cache_file:"
  jq . "$cache_file" >/dev/null 2>&1 && echo "  ✅ Valid" || echo "  ❌ Corrupted"
done
```

**Solutions:**

#### Solution 1: Remove Corrupted Cache Files
```bash
# Remove invalid JSON files
for cache_file in .flowforge/dev-dev1/cache/*.json; do
  if ! jq . "$cache_file" >/dev/null 2>&1; then
    echo "Removing corrupted cache: $cache_file"
    rm "$cache_file"
  fi
done
```

#### Solution 2: Regenerate All Cache
```bash
# Clear all cache (except time tracking)
mv .flowforge/dev-dev1/cache/time-tracking.json /tmp/time-tracking.backup
rm -f .flowforge/dev-dev1/cache/*.json
mv /tmp/time-tracking.backup .flowforge/dev-dev1/cache/time-tracking.json

# Cache will regenerate on next command
./run_ff_command.sh flowforge:dev:status
```

---

## 👥 Team Coordination Issues

### Problem: "Cannot see other developers"

**Symptoms:**
```bash
./scripts/namespace/integrate.sh active
# Output: No active developers
```

**Diagnosis:**
```bash
# Check shared resources
ls -la .flowforge/shared/
cat .flowforge/shared/active-developers.json

# Check if you're registered
grep "$(source scripts/namespace/manager.sh && get_developer_id)" .flowforge/shared/active-developers.json
```

**Solutions:**

#### Solution 1: Register as Active
```bash
# Force registration
source scripts/namespace/manager.sh
register_active_developer "$(get_developer_id)"

# Verify registration
./scripts/namespace/integrate.sh active
```

#### Solution 2: Initialize Shared Resources
```bash
# If shared directory is missing
source scripts/namespace/manager.sh
initialize_shared_resources
```

#### Solution 3: Check Permissions
```bash
# Ensure you can read shared files
ls -la .flowforge/shared/
chmod 644 .flowforge/shared/*.json
```

### Problem: "Task conflicts not detected"

**Symptoms:**
```bash
./scripts/namespace/integrate.sh check issue-123
# Output: Task available (but you know someone is working on it)
```

**Diagnosis:**
```bash
# Check task assignments
cat .flowforge/shared/task-assignments.json

# Check if other developer has active session
grep -r "issue-123" .flowforge/dev-*/sessions/current.json
```

**Solutions:**

#### Solution 1: Manual Task Assignment Check
```bash
# Look for the task in all namespaces
for dev_dir in .flowforge/dev-*; do
  dev_id=$(basename "$dev_dir")
  task=$(jq -r '.taskId // "none"' "$dev_dir/sessions/current.json" 2>/dev/null)
  if [[ "$task" == "issue-123" ]]; then
    echo "$dev_id is working on issue-123"
  fi
done
```

#### Solution 2: Force Task Assignment Update
```bash
# Clear task assignments and let system rebuild
cat > .flowforge/shared/task-assignments.json << 'EOF'
{
  "assignments": {},
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

# Restart sessions to rebuild assignments
# Each developer should run:
./run_ff_command.sh flowforge:session:end "Refreshing assignments"
./run_ff_command.sh flowforge:session:start <their-task-id>
```

---

## 📞 Getting Help

If none of these common solutions work:

1. **Try Advanced Troubleshooting**: See [troubleshooting-advanced.md](./troubleshooting-advanced.md) for performance, session state, and migration issues

2. **Emergency Situations**: See [troubleshooting-recovery.md](./troubleshooting-recovery.md) for disaster recovery procedures

3. **Create Diagnostic Report**:
   ```bash
   ./run_ff_command.sh flowforge:dev:status --verbose
   ./scripts/namespace/integrate.sh diagnose
   ```

4. **Contact Support**: Include your diagnostic report and describe:
   - What you were trying to do
   - What error you saw
   - What you've already tried

**Remember**: Most common issues are resolved quickly with these solutions. Don't hesitate to ask for help if you're stuck! 🤝

---

*Common troubleshooting guide for FlowForge v2.0 | September 2025*