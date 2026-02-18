# FlowForge v2.0 Namespace Troubleshooting - Advanced Issues

## 💯 Complex Problem Solver

This guide covers advanced namespace issues requiring deeper system knowledge.

**For other issues, see:**
- [Common Troubleshooting](./troubleshooting-common.md) - Everyday initialization, cache, and team issues
- [Emergency Recovery](./troubleshooting-recovery.md) - Disaster recovery procedures
- [Main Troubleshooting Index](./troubleshooting.md) - Complete issue index

**Advanced Issues Covered:**
- [⚡ Performance Problems](#-performance-problems)
- [🐛 Session State Issues](#-session-state-issues)
- [📁 File Permission Problems](#-file-permission-problems)
- [🌐 Migration Issues](#-migration-issues)

---

## ⚡ Performance Problems

### Problem: "Commands running slowly"

**Symptoms:**
- Commands taking longer than usual
- Timeouts when starting sessions
- Slow response from namespace status

**Diagnosis:**
```bash
# Check namespace sizes
du -sh .flowforge/dev-*

# Check cache sizes
du -sh .flowforge/dev-*/cache

# Check for too many files
find .flowforge/dev-* -type f | wc -l

# Check system resources
df -h .
```

**Solutions:**

#### Solution 1: Clean All Namespaces
```bash
# Clean your namespace
./run_ff_command.sh flowforge:dev:namespace-clean

# Admin: Clean all namespaces
for dev_dir in .flowforge/dev-*; do
  dev_id=$(basename "$dev_dir")
  echo "Cleaning $dev_id..."
  FLOWFORGE_DEVELOPER="$dev_id" ./run_ff_command.sh flowforge:dev:namespace-clean
done
```

#### Solution 2: Archive Old Sessions
```bash
# Archive sessions older than 30 days
mkdir -p .flowforge/dev-dev1/archive
find .flowforge/dev-dev1/sessions/history -name "*.json" -mtime +30 -exec mv {} .flowforge/dev-dev1/archive/ \;
```

#### Solution 3: Optimize Cache Settings
```bash
# Reduce cache TTL for faster refresh
jq '.provider.cache.ttl = 30000' .flowforge/team/config.json > temp.json && mv temp.json .flowforge/team/config.json
```

### Problem: "High memory usage"

**Symptoms:**
- System running out of memory
- Slow file operations
- Long response times

**Diagnosis:**
```bash
# Check memory usage
free -h

# Check FlowForge memory footprint
du -sh .flowforge/

# Find largest files
find .flowforge/ -type f -size +10M -exec ls -lh {} \;
```

**Solutions:**

#### Solution 1: Reduce Cache Limits
```bash
# Set smaller cache limits
jq '.provider.cache.maxSize = "50MB"' .flowforge/team/config.json > temp.json && mv temp.json .flowforge/team/config.json

# Clean all caches
for dev_dir in .flowforge/dev-*; do
  dev_id=$(basename "$dev_dir")
  FLOWFORGE_DEVELOPER="$dev_id" ./run_ff_command.sh flowforge:dev:namespace-clean
done
```

#### Solution 2: Archive Large Log Files
```bash
# Rotate large logs
for log in .flowforge/dev-*/logs/*.log; do
  if [[ -f "$log" ]] && [[ $(stat -c%s "$log") -gt 10485760 ]]; then
    mv "$log" "$log.$(date +%Y%m%d)"
    touch "$log"
    echo "Rotated: $log"
  fi
done
```

---

## 🐛 Session State Issues

### Problem: "Session state corrupted"

**Symptoms:**
```bash
./run_ff_command.sh flowforge:session:start 123
# Output: ERROR: Invalid session state
```

**Diagnosis:**
```bash
# Check session file validity
cat .flowforge/dev-dev1/sessions/current.json
jq . .flowforge/dev-dev1/sessions/current.json
```

**Solutions:**

#### Solution 1: Reset Session State
```bash
# Backup current state
cp .flowforge/dev-dev1/sessions/current.json .flowforge/dev-dev1/sessions/current.json.backup

# Reset to clean state
cat > .flowforge/dev-dev1/sessions/current.json << 'EOF'
{
  "active": false,
  "sessionId": null,
  "startTime": null,
  "taskId": null
}
EOF

# Start new session
./run_ff_command.sh flowforge:session:start 123
```

#### Solution 2: Restore from History
```bash
# Find recent valid session
ls -la .flowforge/dev-dev1/sessions/history/

# Copy most recent valid session
cp .flowforge/dev-dev1/sessions/history/session-latest.json .flowforge/dev-dev1/sessions/current.json
```

### Problem: "Time tracking data lost"

**Symptoms:**
- Missing time tracking information
- Session time not accumulating
- Reports showing zero time

**Diagnosis:**
```bash
# Check time tracking cache
cat .flowforge/dev-dev1/cache/time-tracking.json

# Check session history
ls -la .flowforge/dev-dev1/sessions/history/
```

**Solutions:**

#### Solution 1: Recover from Session History
```bash
# Rebuild time tracking from session history
total_time=0
for session_file in .flowforge/dev-dev1/sessions/history/*.json; do
  if [[ -f "$session_file" ]]; then
    duration=$(jq -r '.duration // 0' "$session_file")
    total_time=$((total_time + duration))
  fi
done

# Update time tracking cache
cat > .flowforge/dev-dev1/cache/time-tracking.json << EOF
{
  "totalTime": $total_time,
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "sessions": []
}
EOF
```

#### Solution 2: Manual Time Entry
```bash
# If you know your hours, manually set them
read -p "Enter your total hours worked: " total_hours

cat > .flowforge/dev-dev1/cache/time-tracking.json << EOF
{
  "totalTime": $total_hours,
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "sessions": [],
  "note": "Manual recovery on $(date)"
}
EOF
```

---

## 📁 File Permission Problems

### Problem: "Permission denied" errors

**Symptoms:**
```bash
./run_ff_command.sh flowforge:dev:namespace-init
# Output: Permission denied: cannot create directory
```

**Diagnosis:**
```bash
# Check current permissions
ls -la .flowforge/
ls -la .flowforge/dev-*

# Check ownership
ls -la .flowforge/ | grep "^d"
```

**Solutions:**

#### Solution 1: Fix Permissions
```bash
# Fix namespace permissions
chmod -R 755 .flowforge/dev-*

# Fix shared resource permissions
chmod 644 .flowforge/shared/*.json
chmod 644 .flowforge/team/config.json
```

#### Solution 2: Fix Ownership
```bash
# If files are owned by wrong user
sudo chown -R $(whoami):$(whoami) .flowforge/
```

#### Solution 3: Recreate with Correct Permissions
```bash
# If permissions are completely broken
mv .flowforge/dev-dev1 .flowforge/dev-dev1.backup
./run_ff_command.sh flowforge:dev:namespace-init

# Copy important data back
cp .flowforge/dev-dev1.backup/sessions/current.json .flowforge/dev-dev1/sessions/
cp .flowforge/dev-dev1.backup/cache/time-tracking.json .flowforge/dev-dev1/cache/
```

---

## 🌐 Migration Issues

### Problem: "Migration failed partway"

**Symptoms:**
- Some files migrated, others didn't
- Namespace exists but is incomplete
- Old and new data inconsistent

**Diagnosis:**
```bash
# Compare old and new locations
diff -r .flowforge-backup/ .flowforge/dev-dev1/

# Check what's missing
ls -la .flowforge-backup/sessions/
ls -la .flowforge/dev-dev1/sessions/

ls -la .flowforge-backup/cache/
ls -la .flowforge/dev-dev1/cache/
```

**Solutions:**

#### Solution 1: Complete Migration Manually
```bash
# Copy missing files
cp .flowforge-backup/sessions/current.json .flowforge/dev-dev1/sessions/
cp .flowforge-backup/cache/*.json .flowforge/dev-dev1/cache/

# Verify completeness
./run_ff_command.sh flowforge:dev:namespace-status
```

#### Solution 2: Restart Migration
```bash
# Remove incomplete namespace
rm -rf .flowforge/dev-dev1

# Run migration again
./scripts/namespace/integrate.sh migrate dev1
```

### Problem: "Cannot access legacy data"

**Symptoms:**
- Migration completed but old data not accessible
- Backup files missing or corrupted

**Diagnosis:**
```bash
# Check backup location
ls -la .flowforge-backup*/

# Check backup integrity
if [[ -f ".flowforge-backup/sessions/current.json" ]]; then
  jq . .flowforge-backup/sessions/current.json
fi
```

**Solutions:**

#### Solution 1: Restore from Most Recent Backup
```bash
# Find all backups
ls -la .flowforge-backup*

# Use most recent complete backup
backup_dir=$(ls -1dt .flowforge-backup* | head -1)
echo "Using backup: $backup_dir"

# Copy data to namespace
cp "$backup_dir/sessions/current.json" .flowforge/dev-dev1/sessions/
cp "$backup_dir/cache/"*.json .flowforge/dev-dev1/cache/
```

#### Solution 2: Search for Data in Git History
```bash
# If data was committed to git, recover from history
git log --oneline --name-only | grep -E "(sessions|cache)" | head -20

# Restore specific files from git history
git checkout HEAD~10 -- .flowforge/sessions/current.json
cp .flowforge/sessions/current.json .flowforge/dev-dev1/sessions/
git checkout HEAD -- .flowforge/sessions/current.json  # Clean up
```

---

## 🔍 Advanced Diagnostic Tools

### Complete System Analysis

```bash
# Create comprehensive diagnostic script
cat > advanced-diagnosis.sh << 'EOF'
#!/bin/bash
echo "FlowForge v2.0 Advanced Diagnostic Tool"
echo "======================================"

# 1. Performance Analysis
echo "1. Performance Metrics:"
echo "   Total .flowforge size: $(du -sh .flowforge/ | cut -f1)"
echo "   Number of namespaces: $(ls -1d .flowforge/dev-* 2>/dev/null | wc -l)"
echo "   Total files: $(find .flowforge/ -type f | wc -l)"
echo "   Largest files:"
find .flowforge/ -type f -size +5M -exec ls -lh {} \; | head -5
echo ""

# 2. Memory and Cache Analysis
echo "2. Cache Analysis:"
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir" ]]; then
    dev_id=$(basename "$dev_dir")
    cache_size=$(du -sh "$dev_dir/cache" 2>/dev/null | cut -f1 || echo "0")
    session_count=$(ls -1 "$dev_dir/sessions/history/" 2>/dev/null | wc -l)
    echo "   $dev_id: cache=$cache_size, sessions=$session_count"
  fi
done
echo ""

# 3. Session State Analysis
echo "3. Session State Analysis:"
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir" ]]; then
    dev_id=$(basename "$dev_dir")
    if [[ -f "$dev_dir/sessions/current.json" ]]; then
      active=$(jq -r '.active // false' "$dev_dir/sessions/current.json" 2>/dev/null)
      task=$(jq -r '.taskId // "none"' "$dev_dir/sessions/current.json" 2>/dev/null)
      echo "   $dev_id: active=$active, task=$task"
    else
      echo "   $dev_id: no session file"
    fi
  fi
done
echo ""

# 4. File Integrity Check
echo "4. File Integrity:"
corrupted=0
for json_file in $(find .flowforge/ -name "*.json" -type f); do
  if ! jq . "$json_file" >/dev/null 2>&1; then
    echo "   CORRUPTED: $json_file"
    corrupted=$((corrupted + 1))
  fi
done
if [[ $corrupted -eq 0 ]]; then
  echo "   All JSON files are valid"
else
  echo "   Found $corrupted corrupted JSON files"
fi
echo ""

# 5. Permission Analysis
echo "5. Permission Issues:"
unreadable=0
for important_file in .flowforge/team/config.json .flowforge/shared/active-developers.json; do
  if [[ -f "$important_file" ]]; then
    if [[ ! -r "$important_file" ]]; then
      echo "   UNREADABLE: $important_file"
      unreadable=$((unreadable + 1))
    fi
  fi
done
if [[ $unreadable -eq 0 ]]; then
  echo "   No permission issues detected"
fi

echo ""
echo "Advanced diagnosis completed at $(date)"
EOF

chmod +x advanced-diagnosis.sh
./advanced-diagnosis.sh
```

### Performance Optimization Script

```bash
# Create performance optimization script
cat > optimize-performance.sh << 'EOF'
#!/bin/bash
echo "FlowForge Performance Optimization"
echo "=================================="

# 1. Clean old sessions
echo "1. Cleaning old sessions..."
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir" ]]; then
    dev_id=$(basename "$dev_dir")
    archive_dir="$dev_dir/archive"
    mkdir -p "$archive_dir"
    
    # Archive sessions older than 30 days
    archived=0
    if [[ -d "$dev_dir/sessions/history" ]]; then
      for session in "$dev_dir/sessions/history/"*.json; do
        if [[ -f "$session" ]] && [[ $(find "$session" -mtime +30) ]]; then
          mv "$session" "$archive_dir/"
          archived=$((archived + 1))
        fi
      done
    fi
    echo "   $dev_id: archived $archived sessions"
  fi
done

# 2. Optimize cache sizes
echo ""
echo "2. Optimizing caches..."
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir/cache" ]]; then
    dev_id=$(basename "$dev_dir")
    original_size=$(du -s "$dev_dir/cache" | cut -f1)
    
    # Remove temporary files
    rm -f "$dev_dir/cache/"*.tmp
    
    # Remove old log entries from cache files
    for cache_file in "$dev_dir/cache/"*.json; do
      if [[ -f "$cache_file" ]] && [[ "$(basename "$cache_file")" != "time-tracking.json" ]]; then
        # Truncate large cache files
        if [[ $(stat -c%s "$cache_file") -gt 1048576 ]]; then  # 1MB
          echo "{}" > "$cache_file"
        fi
      fi
    done
    
    new_size=$(du -s "$dev_dir/cache" | cut -f1)
    saved=$((original_size - new_size))
    echo "   $dev_id: saved ${saved}KB cache space"
  fi
done

# 3. Update performance settings
echo ""
echo "3. Updating performance settings..."
if [[ -f .flowforge/team/config.json ]]; then
  jq '.
    | .provider.cache.ttl = 30000
    | .provider.cache.maxSize = "75MB"
    | .provider.performance = {
        "enableCompression": true,
        "maxConcurrentTasks": 3,
        "cleanupInterval": 3600
      }
  ' .flowforge/team/config.json > temp-config.json
  
  if jq . temp-config.json >/dev/null 2>&1; then
    mv temp-config.json .flowforge/team/config.json
    echo "   Performance settings updated"
  else
    rm temp-config.json
    echo "   Failed to update settings"
  fi
fi

echo ""
echo "Performance optimization completed!"
EOF

chmod +x optimize-performance.sh
```

---

## 📞 Getting Advanced Help

For advanced issues that persist:

1. **Run Advanced Diagnostics**: Use the diagnostic tools above to gather detailed system information

2. **Emergency Recovery**: If system is severely compromised, see [troubleshooting-recovery.md](./troubleshooting-recovery.md)

3. **Performance Optimization**: Run the performance optimization script regularly

4. **Escalate to Admin**: Include diagnostic output when reporting advanced issues

5. **Document Solutions**: If you find new solutions, add them to this guide

**Remember**: Advanced issues often require system-level understanding. Don't hesitate to ask for expert help when dealing with performance, permissions, or migration problems! 🚀

---

*Advanced troubleshooting guide for FlowForge v2.0 | September 2025*