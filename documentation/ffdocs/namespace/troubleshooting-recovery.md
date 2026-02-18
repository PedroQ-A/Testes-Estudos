# FlowForge v2.0 Namespace Troubleshooting - Emergency Recovery

## 🆘 Disaster Recovery Operations

This guide covers emergency situations and disaster recovery procedures when the FlowForge system experiences critical failures.

**For other issues, see:**
- [Common Troubleshooting](./troubleshooting-common.md) - Everyday initialization, cache, and team issues
- [Advanced Troubleshooting](./troubleshooting-advanced.md) - Performance and complex system issues
- [Main Troubleshooting Index](./troubleshooting.md) - Complete issue index

**🚨 EMERGENCY PROCEDURES:**
- [🚨 Complete System Failure](#-complete-system-failure)
- [🔥 Data Corruption Recovery](#-data-corruption-recovery)
- [🔄 Recovery Verification](#-recovery-verification)
- [🎆 Prevention Strategies](#-prevention-strategies)

---

## 🚨 Complete System Failure

### Problem: "Complete system failure"

**Symptoms:**
- Nothing works
- Multiple errors
- Cannot start any sessions
- Team completely blocked

**Emergency Actions:**

#### Step 1: Create Emergency Backup
```bash
# Backup current state immediately
cp -r .flowforge/ "emergency-backup-$(date +%Y%m%d-%H%M%S)"
echo "Emergency backup created at: emergency-backup-$(date +%Y%m%d-%H%M%S)"
```

#### Step 2: Quick System Reset
```bash
# Reset locks (often fixes many issues)
echo "Clearing all locks..."
rm -f .flowforge/locks/*.lock

# Reset shared resources
echo "Reinitializing shared resources..."
source scripts/namespace/manager.sh
initialize_shared_resources

# Test basic functionality
echo "Testing basic functionality..."
if ./run_ff_command.sh flowforge:dev:namespace-status >/dev/null 2>&1; then
  echo "✅ Basic functionality restored"
else
  echo "❌ Basic functionality still failed - proceeding to progressive recovery"
fi
```

#### Step 3: Progressive Recovery
```bash
# If basic reset doesn't work, progressive recovery:
echo "Starting progressive recovery..."

# 1. Reset your namespace only
dev_id=$(source scripts/namespace/manager.sh && get_developer_id)
if [[ -n "$dev_id" ]]; then
  echo "Resetting namespace for $dev_id"
  mv ".flowforge/dev-$dev_id" ".flowforge/dev-$dev_id.emergency-backup"
  ./run_ff_command.sh flowforge:dev:namespace-init
  
  # 2. Test session management
  echo "Testing session management..."
  if ./run_ff_command.sh flowforge:session:start test-emergency >/dev/null 2>&1; then
    ./run_ff_command.sh flowforge:session:end "Emergency test"
    echo "✅ Session management working"
    
    # 3. Restore critical data
    if [[ -f ".flowforge/dev-$dev_id.emergency-backup/cache/time-tracking.json" ]]; then
      cp ".flowforge/dev-$dev_id.emergency-backup/cache/time-tracking.json" ".flowforge/dev-$dev_id/cache/"
      echo "✅ Time tracking data restored"
    fi
  else
    echo "❌ Session management still failing"
  fi
else
  echo "❌ Cannot identify developer ID"
fi
```

#### Step 4: Team Coordination
```bash
# Notify team of emergency recovery
cat > emergency-notice.txt << 'EOF'
🚨 EMERGENCY RECOVERY IN PROGRESS

FlowForge v2.0 experienced a system failure and emergency recovery is underway.

Current Status:
- Emergency backup created
- System reset performed
- Basic functionality restored

Action Required:
1. Please end any active sessions immediately
2. Wait for all-clear message before resuming work
3. Report any persistent issues

Expected Resolution: 15-30 minutes

- FlowForge Admin Team
EOF

# Display notice
cat emergency-notice.txt
echo ""
echo "Send this notice via your team communication channel"
```

---

## 🔥 Data Corruption Recovery

### Problem: "Data corruption across multiple namespaces"

**Emergency Actions:**

#### Step 1: Assess Damage
```bash
echo "FlowForge Corruption Assessment"
echo "=============================="

# Check all namespaces for corruption
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir" ]]; then
    dev_id=$(basename "$dev_dir")
    echo "Checking $dev_id:"

    # Check session files
    session_status="❌ MISSING"
    if [[ -f "$dev_dir/sessions/current.json" ]]; then
      if jq . "$dev_dir/sessions/current.json" >/dev/null 2>&1; then
        session_status="✅ OK"
      else
        session_status="❌ CORRUPTED"
      fi
    fi
    echo "  Session: $session_status"

    # Check cache files
    corrupted_cache=0
    total_cache=0
    for cache_file in "$dev_dir/cache/"*.json; do
      if [[ -f "$cache_file" ]]; then
        total_cache=$((total_cache + 1))
        if ! jq . "$cache_file" >/dev/null 2>&1; then
          corrupted_cache=$((corrupted_cache + 1))
        fi
      fi
    done

    if [[ $total_cache -eq 0 ]]; then
      cache_status="❌ NO CACHE FILES"
    elif [[ $corrupted_cache -eq 0 ]]; then
      cache_status="✅ OK ($total_cache files)"
    else
      cache_status="❌ $corrupted_cache/$total_cache corrupted"
    fi
    echo "  Cache: $cache_status"
    echo ""
  fi
done
```

#### Step 2: Selective Recovery
```bash
echo "Starting selective namespace recovery..."
echo "======================================"

# Recover only uncorrupted namespaces
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir" ]]; then
    dev_id=$(basename "$dev_dir")
    echo "Processing $dev_id..."

    # Test if namespace is functional
    if FLOWFORGE_DEVELOPER="$dev_id" ./run_ff_command.sh flowforge:dev:namespace-status >/dev/null 2>&1; then
      echo "  ✅ $dev_id: Functional - no action needed"
    else
      echo "  ❌ $dev_id: Needs recovery"

      # Backup corrupted namespace
      backup_name="${dev_dir}.corrupted-backup-$(date +%Y%m%d-%H%M%S)"
      mv "$dev_dir" "$backup_name"
      echo "    Corrupted namespace backed up to: $backup_name"

      # Reinitialize
      echo "    Reinitializing namespace..."
      if FLOWFORGE_DEVELOPER="$dev_id" ./run_ff_command.sh flowforge:dev:namespace-init >/dev/null 2>&1; then
        echo "    ✅ Namespace reinitialized successfully"
        
        # Attempt to recover critical data
        time_tracking_file="$backup_name/cache/time-tracking.json"
        if [[ -f "$time_tracking_file" ]]; then
          if jq . "$time_tracking_file" >/dev/null 2>&1; then
            cp "$time_tracking_file" "$dev_dir/cache/"
            echo "    ✅ Time tracking data recovered"
          else
            echo "    ⚠️ Time tracking data corrupted, starting fresh"
          fi
        fi
        
        # Attempt to recover session history
        history_dir="$backup_name/sessions/history"
        if [[ -d "$history_dir" ]]; then
          recovered_sessions=0
          for session_file in "$history_dir/"*.json; do
            if [[ -f "$session_file" ]] && jq . "$session_file" >/dev/null 2>&1; then
              cp "$session_file" "$dev_dir/sessions/history/"
              recovered_sessions=$((recovered_sessions + 1))
            fi
          done
          echo "    ✅ Recovered $recovered_sessions session history files"
        fi
      else
        echo "    ❌ Failed to reinitialize namespace"
      fi
    fi
    echo ""
  fi
done
```

#### Step 3: Team Configuration Recovery
```bash
echo "Checking team configuration..."

# Verify team config is functional
if [[ -f .flowforge/team/config.json ]]; then
  if jq . .flowforge/team/config.json >/dev/null 2>&1; then
    echo "✅ Team configuration is valid"
  else
    echo "❌ Team configuration corrupted - recreating basic config"
    
    # Backup corrupted config
    mv .flowforge/team/config.json ".flowforge/team/config.json.corrupted-$(date +%Y%m%d-%H%M%S)"
    
    # Create minimal working config
    mkdir -p .flowforge/team
    cat > .flowforge/team/config.json << 'EOF'
{
  "version": "2.0.0",
  "team": {
    "id": "recovery-team",
    "name": "Recovery Team",
    "developers": {
      "dev1": {
        "name": "Developer 1",
        "email": "dev1@company.com",
        "role": "developer",
        "active": true,
        "namespace": "dev1"
      },
      "dev2": {
        "name": "Developer 2",
        "email": "dev2@company.com",
        "role": "developer",
        "active": true,
        "namespace": "dev2"
      }
    }
  },
  "provider": {
    "type": "github",
    "cache": {
      "maxSize": "100MB",
      "ttl": 300000
    }
  }
}
EOF
    echo "✅ Basic team configuration recreated"
  fi
else
  echo "❌ No team configuration found - creating default"
  # Create basic team config as above
fi
```

---

## 🔄 Recovery Verification

After any emergency recovery, run complete system verification:

```bash
# Create comprehensive recovery verification script
cat > verify-recovery.sh << 'EOF'
#!/bin/bash
echo "FlowForge Recovery Verification"
echo "==============================="
echo "Started at: $(date)"
echo ""

overall_status=0

# 1. Test all developer namespaces
echo "1. Testing Developer Namespaces:"
namespace_failures=0
for dev in dev1 dev2 dev3 dev4 dev5 dev6; do
  if [[ -d ".flowforge/dev-$dev" ]]; then
    if FLOWFORGE_DEVELOPER="$dev" ./run_ff_command.sh flowforge:dev:namespace-status >/dev/null 2>&1; then
      echo "  $dev: ✅ Working"
    else
      echo "  $dev: ❌ Failed"
      namespace_failures=$((namespace_failures + 1))
      overall_status=1
    fi
  else
    echo "  $dev: ➤ Not initialized (normal)"
  fi
done

if [[ $namespace_failures -eq 0 ]]; then
  echo "  ✅ All initialized namespaces working"
else
  echo "  ❌ $namespace_failures namespace(s) failed"
fi
echo ""

# 2. Test team coordination
echo "2. Testing Team Coordination:"
if ./scripts/namespace/integrate.sh active >/dev/null 2>&1; then
  active_count=$(./scripts/namespace/integrate.sh active | wc -l)
  echo "  Team status: ✅ Working ($active_count active developers)"
else
  echo "  Team status: ❌ Failed"
  overall_status=1
fi
echo ""

# 3. Test session management
echo "3. Testing Session Management:"
session_test_passed=true

# Test session start
if ./run_ff_command.sh flowforge:session:start recovery-test >/dev/null 2>&1; then
  echo "  Session start: ✅ Working"
  
  # Test session status
  if ./run_ff_command.sh flowforge:dev:status >/dev/null 2>&1; then
    echo "  Session status: ✅ Working"
  else
    echo "  Session status: ❌ Failed"
    session_test_passed=false
  fi
  
  # Test session end
  if ./run_ff_command.sh flowforge:session:end "Recovery test" >/dev/null 2>&1; then
    echo "  Session end: ✅ Working"
  else
    echo "  Session end: ❌ Failed"
    session_test_passed=false
  fi
else
  echo "  Session start: ❌ Failed"
  session_test_passed=false
fi

if [[ "$session_test_passed" == "false" ]]; then
  overall_status=1
fi
echo ""

# 4. Test file integrity
echo "4. Testing File Integrity:"
corrupted_files=0
for json_file in $(find .flowforge/ -name "*.json" -type f 2>/dev/null); do
  if ! jq . "$json_file" >/dev/null 2>&1; then
    echo "  ❌ Corrupted: $json_file"
    corrupted_files=$((corrupted_files + 1))
  fi
done

if [[ $corrupted_files -eq 0 ]]; then
  echo "  ✅ All JSON files valid"
else
  echo "  ❌ Found $corrupted_files corrupted files"
  overall_status=1
fi
echo ""

# 5. Test critical commands
echo "5. Testing Critical Commands:"
critical_failures=0

# Test help command
if ./run_ff_command.sh flowforge:help >/dev/null 2>&1; then
  echo "  Help command: ✅ Working"
else
  echo "  Help command: ❌ Failed"
  critical_failures=$((critical_failures + 1))
fi

# Test version check
if ./run_ff_command.sh flowforge:version:check >/dev/null 2>&1; then
  echo "  Version check: ✅ Working"
else
  echo "  Version check: ❌ Failed"
  critical_failures=$((critical_failures + 1))
fi

# Test development status
if ./run_ff_command.sh flowforge:dev:status >/dev/null 2>&1; then
  echo "  Development status: ✅ Working"
else
  echo "  Development status: ❌ Failed"
  critical_failures=$((critical_failures + 1))
fi

if [[ $critical_failures -gt 0 ]]; then
  overall_status=1
fi

echo ""
echo "==============================="
echo "Recovery verification completed at: $(date)"

if [[ $overall_status -eq 0 ]]; then
  echo "✅ ALL SYSTEMS OPERATIONAL - Recovery successful!"
  echo "Team can resume normal operations."
else
  echo "❌ SOME ISSUES REMAIN - Further recovery needed"
  echo "Do not resume normal operations until all issues resolved."
fi

echo "==============================="
exit $overall_status
EOF

chmod +x verify-recovery.sh
./verify-recovery.sh
```

---

## 🎆 Prevention Strategies

### Daily Backup Automation

```bash
# Create automated backup script
cat > create-daily-backup.sh << 'EOF'
#!/bin/bash
# FlowForge Daily Backup Script

BACKUP_DIR=".flowforge-backups"
DATE=$(date +%Y%m%d)
TIME=$(date +%H%M%S)
BACKUP_NAME="flowforge-backup-$DATE-$TIME"

echo "Creating daily backup: $BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup with only critical data
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# Copy team configuration
cp -r .flowforge/team "$BACKUP_DIR/$BACKUP_NAME/"

# Copy shared resources
cp -r .flowforge/shared "$BACKUP_DIR/$BACKUP_NAME/"

# Copy each developer's critical data
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir" ]]; then
    dev_id=$(basename "$dev_dir")
    backup_dev_dir="$BACKUP_DIR/$BACKUP_NAME/$dev_id"
    mkdir -p "$backup_dev_dir"
    
    # Copy critical files only
    cp "$dev_dir/config.json" "$backup_dev_dir/" 2>/dev/null
    cp "$dev_dir/sessions/current.json" "$backup_dev_dir/" 2>/dev/null
    cp "$dev_dir/cache/time-tracking.json" "$backup_dev_dir/" 2>/dev/null
    
    # Copy recent session history (last 7 days)
    mkdir -p "$backup_dev_dir/recent-sessions"
    find "$dev_dir/sessions/history" -name "*.json" -mtime -7 -exec cp {} "$backup_dev_dir/recent-sessions/" \; 2>/dev/null
  fi
done

# Compress backup
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"
rm -rf "$BACKUP_DIR/$BACKUP_NAME"

# Keep only last 7 backups
cd "$BACKUP_DIR"
ls -1t flowforge-backup-*.tar.gz | tail -n +8 | xargs rm -f 2>/dev/null
cd - >/dev/null

echo "Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "Backup size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)"
EOF

chmod +x create-daily-backup.sh
echo "Run ./create-daily-backup.sh daily to maintain recovery backups"
```

### Health Monitoring

```bash
# Create health monitoring script
cat > health-check.sh << 'EOF'
#!/bin/bash
# FlowForge Health Check Script

echo "FlowForge Health Check - $(date)"
echo "===================================="

health_issues=0

# Check disk space
disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $disk_usage -gt 90 ]]; then
  echo "⚠️ DISK SPACE: $disk_usage% used (>90%)"
  health_issues=$((health_issues + 1))
else
  echo "✅ DISK SPACE: $disk_usage% used"
fi

# Check .flowforge total size
flowforge_size=$(du -sh .flowforge | cut -f1)
echo "ℹ️ FLOWFORGE SIZE: $flowforge_size"

# Check for corrupted files
corrupted=0
for json_file in $(find .flowforge -name "*.json" -type f 2>/dev/null); do
  if ! jq . "$json_file" >/dev/null 2>&1; then
    corrupted=$((corrupted + 1))
  fi
done

if [[ $corrupted -gt 0 ]]; then
  echo "⚠️ FILE INTEGRITY: $corrupted corrupted JSON files"
  health_issues=$((health_issues + 1))
else
  echo "✅ FILE INTEGRITY: All JSON files valid"
fi

# Check for stale locks
stale_locks=0
if [[ -d .flowforge/locks ]]; then
  stale_locks=$(find .flowforge/locks -name "*.lock" -mmin +5 | wc -l)
fi

if [[ $stale_locks -gt 0 ]]; then
  echo "⚠️ LOCKS: $stale_locks stale locks (>5 minutes)"
  health_issues=$((health_issues + 1))
else
  echo "✅ LOCKS: No stale locks"
fi

# Check cache sizes
echo ""
echo "Cache Status:"
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir/cache" ]]; then
    dev_id=$(basename "$dev_dir")
    cache_size=$(du -sh "$dev_dir/cache" | cut -f1)
    echo "  $dev_id: $cache_size"
  fi
done

echo ""
if [[ $health_issues -eq 0 ]]; then
  echo "✅ OVERALL HEALTH: Good"
else
  echo "⚠️ OVERALL HEALTH: $health_issues issues detected"
fi

echo "===================================="
EOF

chmod +x health-check.sh
echo "Run ./health-check.sh regularly to monitor system health"
```

---

## 📞 Emergency Contacts & Escalation

### When to Use Emergency Procedures

**Use emergency recovery when:**
- Multiple developers cannot work
- Data corruption is suspected
- System is completely unresponsive
- Normal troubleshooting has failed

**DO NOT use emergency procedures for:**
- Single developer issues (use common troubleshooting)
- Performance slowdowns (use advanced troubleshooting)
- Configuration questions (use documentation)

### Emergency Escalation Path

1. **Level 1 - Self Recovery** (5-10 minutes)
   - Run emergency backup
   - Try quick system reset
   - Verify basic functionality

2. **Level 2 - Team Admin** (10-20 minutes)
   - Run progressive recovery
   - Notify team of issues
   - Coordinate selective recovery

3. **Level 3 - FlowForge Support** (20+ minutes)
   - Complete system failure
   - Data loss suspected
   - Recovery procedures failed

### Post-Recovery Actions

```bash
# After successful recovery, always:

# 1. Create incident report
cat > "incident-report-$(date +%Y%m%d-%H%M%S).md" << 'EOF'
# FlowForge Incident Report

**Date**: $(date)
**Duration**: [FILL IN]
**Affected**: [FILL IN]

## Issue Summary
[What happened?]

## Root Cause
[Why did it happen?]

## Resolution
[How was it fixed?]

## Prevention
[How to prevent it in the future?]

## Lessons Learned
[What did we learn?]
EOF

# 2. Update team on resolution
echo "Send all-clear message to team"

# 3. Schedule post-mortem if needed
echo "Schedule post-mortem meeting if incident was severe"
```

**Remember**: Emergency recovery is serious business. Stay calm, follow procedures, communicate clearly, and don't hesitate to escalate when needed! 🆘

---

*Emergency recovery guide for FlowForge v2.0 | September 2025*