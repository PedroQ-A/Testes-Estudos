# FlowForge v2.0 Team Administrator Guide

## 🎯 Overview

As a team administrator, you're responsible for setting up, managing, and maintaining FlowForge v2.0's namespace system for your development team. This guide covers everything from initial setup to advanced team management.

## 🏗️ Initial Setup

### Prerequisites

- FlowForge v2.0 installed on all developer machines
- Git repository with FlowForge initialized
- Team roster with email addresses
- Developer ID assignments (dev1, dev2, etc.)

### Step 1: Team Configuration

Create or update the team configuration file:

```bash
# Create team configuration
cat > .flowforge/team/config.json << 'EOF'
{
  "version": "2.0.0",
  "team": {
    "id": "your-team-id",
    "name": "Your Development Team",
    "created": "2025-09-17T00:00:00Z",
    "description": "Production team configuration for multi-developer deployment",
    "developers": {
      "dev1": {
        "name": "Alice Johnson",
        "github": "alice-dev",
        "email": "alice@company.com",
        "role": "senior-developer",
        "active": true,
        "registeredAt": "2025-09-17T00:00:00Z",
        "namespace": "dev1",
        "preferences": {
          "theme": "dark",
          "notifications": true
        }
      },
      "dev2": {
        "name": "Bob Smith",
        "github": "bob-dev",
        "email": "bob@company.com",
        "role": "developer",
        "active": true,
        "registeredAt": "2025-09-17T00:00:00Z",
        "namespace": "dev2",
        "preferences": {
          "theme": "light",
          "notifications": true
        }
      }
    }
  },
  "provider": {
    "mode": "multi-developer",
    "isolation": "namespace",
    "aggregation": "on-demand",
    "sync": {
      "enabled": true,
      "interval": 30000,
      "conflictResolution": "merge",
      "retryAttempts": 3,
      "retryDelay": 1000
    },
    "cache": {
      "enabled": true,
      "ttl": 60000,
      "maxSize": "100MB"
    }
  },
  "tracking": {
    "individual": true,
    "shared_tasks": true,
    "namespace_separation": true,
    "audit_trail": true,
    "time_precision": "seconds"
  },
  "permissions": {
    "cross_namespace_read": false,
    "cross_namespace_write": false,
    "team_data_access": "read-only",
    "admin_override": true
  },
  "features": {
    "real_time_sync": true,
    "conflict_detection": true,
    "automatic_backup": true,
    "performance_monitoring": true,
    "error_recovery": true
  }
}
EOF
```

### Step 2: Initialize Shared Resources

```bash
# Initialize team-wide shared resources
./scripts/namespace/manager.sh
source ./scripts/namespace/manager.sh
initialize_shared_resources

# Verify initialization
ls -la .flowforge/shared/
# active-developers.json
# task-assignments.json
# coordination.json
```

### Step 3: Set Up Monitoring

```bash
# Create admin monitoring script
cat > admin-monitor.sh << 'EOF'
#!/bin/bash
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    FlowForge Team Monitor                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Active developers
echo "Active Developers:"
./scripts/namespace/integrate.sh active

echo ""
echo "Namespace Status:"
for dev in dev1 dev2 dev3 dev4 dev5 dev6; do
  if [[ -d ".flowforge/dev-$dev" ]]; then
    size=$(du -sh ".flowforge/dev-$dev" 2>/dev/null | cut -f1)
    echo "  $dev: $size"
  fi
done

echo ""
echo "Recent Activity:"
tail -n 5 .flowforge/logs/namespace-manager.log
EOF

chmod +x admin-monitor.sh
```

## 👥 Developer Management

### Adding New Developers

#### Method 1: Command Line

```bash
# Add developer to team config
jq '.team.developers.dev7 = {
  "name": "Grace Wilson",
  "github": "grace-dev",
  "email": "grace@company.com",
  "role": "developer",
  "active": true,
  "registeredAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "namespace": "dev7",
  "preferences": {
    "theme": "auto",
    "notifications": true
  }
}' .flowforge/team/config.json > temp.json && mv temp.json .flowforge/team/config.json

# Initialize namespace for new developer
FLOWFORGE_DEVELOPER=dev7 ./scripts/namespace/integrate.sh init dev7
```

#### Method 2: Interactive Script

```bash
# Create developer onboarding script
cat > add-developer.sh << 'EOF'
#!/bin/bash
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  Add New Developer                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"

read -p "Enter developer ID (e.g., dev7): " DEV_ID
read -p "Enter full name: " DEV_NAME
read -p "Enter email: " DEV_EMAIL
read -p "Enter GitHub username: " DEV_GITHUB
read -p "Enter role (developer/senior-developer/lead): " DEV_ROLE

# Add to team config
jq --arg dev "$DEV_ID" \
   --arg name "$DEV_NAME" \
   --arg email "$DEV_EMAIL" \
   --arg github "$DEV_GITHUB" \
   --arg role "$DEV_ROLE" \
   '.team.developers[$dev] = {
     "name": $name,
     "github": $github,
     "email": $email,
     "role": $role,
     "active": true,
     "registeredAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
     "namespace": $dev,
     "preferences": {
       "theme": "dark",
       "notifications": true
     }
   }' .flowforge/team/config.json > temp.json && mv temp.json .flowforge/team/config.json

# Initialize namespace
FLOWFORGE_DEVELOPER="$DEV_ID" ./scripts/namespace/integrate.sh init "$DEV_ID"

echo "✅ Developer $DEV_ID added successfully!"
echo "📧 Send them the setup instructions:"
echo ""
echo "Hi $DEV_NAME,"
echo ""
echo "You've been added to the FlowForge team with ID: $DEV_ID"
echo ""
echo "Setup instructions:"
echo "1. export FLOWFORGE_DEVELOPER=$DEV_ID"
echo "2. ./run_ff_command.sh flowforge:dev:namespace-init"
echo "3. ./run_ff_command.sh flowforge:session:start <task-id>"
echo ""
echo "Welcome to the team! 🚀"
EOF

chmod +x add-developer.sh
```

### Removing Developers

#### Temporary Deactivation

```bash
# Deactivate developer (preserves data)
jq '.team.developers.dev3.active = false' .flowforge/team/config.json > temp.json && mv temp.json .flowforge/team/config.json

# Archive their namespace
mv .flowforge/dev-dev3 .flowforge/archived/dev-dev3-$(date +%Y%m%d)
```

#### Permanent Removal

```bash
# Remove from team config
jq 'del(.team.developers.dev3)' .flowforge/team/config.json > temp.json && mv temp.json .flowforge/team/config.json

# Archive namespace with data export
tar -czf "dev3-export-$(date +%Y%m%d).tar.gz" .flowforge/dev-dev3/
rm -rf .flowforge/dev-dev3/

# Clean from shared resources
jq '.developers |= map(select(. != "dev3"))' .flowforge/shared/active-developers.json > temp.json && mv temp.json .flowforge/shared/active-developers.json
```

## 📊 Team Monitoring

### Real-Time Monitoring

#### Dashboard Script

```bash
# Create comprehensive dashboard
cat > team-dashboard.sh << 'EOF'
#!/bin/bash
# FlowForge Team Dashboard

clear
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                 FlowForge Team Dashboard                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Team overview
TOTAL_DEVS=$(jq -r '.team.developers | length' .flowforge/team/config.json)
ACTIVE_DEVS=$(jq -r '.developers | length' .flowforge/shared/active-developers.json)

echo "Team Overview:"
echo "  Total Developers: $TOTAL_DEVS"
echo "  Currently Active: $ACTIVE_DEVS"
echo ""

# Active developers with details
echo "Active Developers:"
./scripts/namespace/integrate.sh active
echo ""

# Namespace usage
echo "Namespace Storage Usage:"
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir" ]]; then
    dev_id=$(basename "$dev_dir")
    size=$(du -sh "$dev_dir" 2>/dev/null | cut -f1)
    cache_size=$(du -sh "$dev_dir/cache" 2>/dev/null | cut -f1)
    echo "  $dev_id: $size (cache: $cache_size)"
  fi
done
echo ""

# Recent activity
echo "Recent Activity (last 10 entries):"
tail -n 10 .flowforge/logs/namespace-manager.log | while read line; do
  echo "  $line"
done
echo ""

# System health
echo "System Health:"
LOCK_COUNT=$(find .flowforge/locks/ -name "*.lock" 2>/dev/null | wc -l)
echo "  Active locks: $LOCK_COUNT"

TOTAL_CACHE=$(du -sh .flowforge/dev-*/cache 2>/dev/null | awk '{sum += $1} END {print sum "MB"}')
echo "  Total cache usage: $TOTAL_CACHE"
EOF

chmod +x team-dashboard.sh

# Run dashboard
./team-dashboard.sh
```

#### Continuous Monitoring

```bash
# Set up continuous monitoring
cat > monitor-continuous.sh << 'EOF'
#!/bin/bash
while true; do
  clear
  ./team-dashboard.sh
  echo ""
  echo "Last updated: $(date)"
  echo "Press Ctrl+C to stop monitoring"
  sleep 30
done
EOF

chmod +x monitor-continuous.sh
```

### Performance Monitoring

#### Cache Usage Monitoring

```bash
# Create cache monitoring script
cat > monitor-cache.sh << 'EOF'
#!/bin/bash
echo "Cache Usage Report"
echo "=================="

CACHE_LIMIT=104857600  # 100MB in bytes
WARN_THRESHOLD=83886080  # 80MB in bytes

for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir/cache" ]]; then
    dev_id=$(basename "$dev_dir")
    cache_size_bytes=$(du -sb "$dev_dir/cache" 2>/dev/null | cut -f1)
    cache_size_human=$(du -sh "$dev_dir/cache" 2>/dev/null | cut -f1)

    echo -n "$dev_id: $cache_size_human"

    if [[ $cache_size_bytes -gt $CACHE_LIMIT ]]; then
      echo " 🚨 OVER LIMIT"
      echo "  ACTION REQUIRED: Clean cache for $dev_id"
    elif [[ $cache_size_bytes -gt $WARN_THRESHOLD ]]; then
      echo " ⚠️  WARNING"
      echo "  RECOMMEND: Clean cache for $dev_id soon"
    else
      echo " ✅ OK"
    fi
  fi
done
EOF

chmod +x monitor-cache.sh
```

#### Session Monitoring

```bash
# Create session monitoring script
cat > monitor-sessions.sh << 'EOF'
#!/bin/bash
echo "Active Sessions Report"
echo "======================"

for dev_dir in .flowforge/dev-*; do
  if [[ -f "$dev_dir/sessions/current.json" ]]; then
    dev_id=$(basename "$dev_dir")

    active=$(jq -r '.active' "$dev_dir/sessions/current.json")
    task_id=$(jq -r '.taskId // "none"' "$dev_dir/sessions/current.json")
    start_time=$(jq -r '.startTime // "none"' "$dev_dir/sessions/current.json")

    if [[ "$active" == "true" ]]; then
      if [[ "$start_time" != "none" ]]; then
        duration=$(($(date +%s) - $(date -d "$start_time" +%s)))
        hours=$((duration / 3600))
        minutes=$(((duration % 3600) / 60))
        echo "$dev_id: Task $task_id (${hours}h ${minutes}m)"
      else
        echo "$dev_id: Task $task_id (unknown duration)"
      fi
    else
      echo "$dev_id: No active session"
    fi
  fi
done
EOF

chmod +x monitor-sessions.sh
```

## 🛠️ Maintenance Tasks

### Daily Maintenance

```bash
# Create daily maintenance script
cat > daily-maintenance.sh << 'EOF'
#!/bin/bash
echo "FlowForge Daily Maintenance"
echo "=========================="

# 1. Check system health
echo "1. System Health Check"
./monitor-cache.sh
echo ""
./monitor-sessions.sh
echo ""

# 2. Clean old temporary files
echo "2. Cleaning temporary files..."
find .flowforge/dev-*/workspace/temp -type f -mtime +1 -delete 2>/dev/null
echo "   Cleaned files older than 24 hours"

# 3. Rotate large logs
echo "3. Log rotation..."
for log in .flowforge/dev-*/logs/*.log; do
  if [[ -f "$log" ]] && [[ $(stat -c%s "$log" 2>/dev/null) -gt 10485760 ]]; then
    mv "$log" "$log.$(date +%Y%m%d)"
    touch "$log"
    echo "   Rotated: $log"
  fi
done

# 4. Check for stale locks
echo "4. Checking for stale locks..."
find .flowforge/locks/ -name "*.lock" -mmin +5 -delete 2>/dev/null
echo "   Removed stale locks older than 5 minutes"

# 5. Generate usage report
echo "5. Usage Summary:"
TOTAL_SESSIONS=$(find .flowforge/dev-*/sessions/history -name "*.json" 2>/dev/null | wc -l)
ACTIVE_SESSIONS=$(grep -l '"active": true' .flowforge/dev-*/sessions/current.json 2>/dev/null | wc -l)
echo "   Total completed sessions: $TOTAL_SESSIONS"
echo "   Currently active sessions: $ACTIVE_SESSIONS"

echo ""
echo "Daily maintenance completed at $(date)"
EOF

chmod +x daily-maintenance.sh
```

### Weekly Maintenance

```bash
# Create weekly maintenance script
cat > weekly-maintenance.sh << 'EOF'
#!/bin/bash
echo "FlowForge Weekly Maintenance"
echo "==========================="

# 1. Archive old session history
echo "1. Archiving old session history..."
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir/sessions/history" ]]; then
    dev_id=$(basename "$dev_dir")

    # Archive sessions older than 30 days
    find "$dev_dir/sessions/history" -name "*.json" -mtime +30 -exec mkdir -p "$dev_dir/archive/$(date +%Y%m)" \; -exec mv {} "$dev_dir/archive/$(date +%Y%m)/" \;

    archived_count=$(find "$dev_dir/archive" -name "*.json" 2>/dev/null | wc -l)
    if [[ $archived_count -gt 0 ]]; then
      echo "   $dev_id: Archived $archived_count old sessions"
    fi
  fi
done

# 2. Generate team performance report
echo ""
echo "2. Team Performance Report:"
echo "   Date Range: $(date -d '7 days ago' +%Y-%m-%d) to $(date +%Y-%m-%d)"

total_time=0
for dev_dir in .flowforge/dev-*; do
  if [[ -f "$dev_dir/cache/time-tracking.json" ]]; then
    dev_id=$(basename "$dev_dir")
    dev_time=$(jq -r '.totalTime // 0' "$dev_dir/cache/time-tracking.json")
    echo "   $dev_id: ${dev_time}h"
    total_time=$((total_time + dev_time))
  fi
done
echo "   Total Team Time: ${total_time}h"

# 3. Clean up old backups
echo ""
echo "3. Cleaning old backups..."
find . -name ".flowforge-backup-*" -mtime +7 -exec rm -rf {} \; 2>/dev/null
echo "   Removed backups older than 7 days"

# 4. Optimize namespaces
echo ""
echo "4. Namespace optimization..."
for dev_dir in .flowforge/dev-*; do
  dev_id=$(basename "$dev_dir")

  # Clean cache if over 80% of limit
  cache_size=$(du -sb "$dev_dir/cache" 2>/dev/null | cut -f1)
  if [[ $cache_size -gt 83886080 ]]; then  # 80MB
    echo "   $dev_id: Cache cleanup recommended"
  fi
done

echo ""
echo "Weekly maintenance completed at $(date)"
EOF

chmod +x weekly-maintenance.sh
```

## 🚨 Conflict Resolution

### Identifying Conflicts

#### Task Conflicts

```bash
# Create conflict detection script
cat > detect-conflicts.sh << 'EOF'
#!/bin/bash
echo "Conflict Detection Report"
echo "========================"

# Check for task assignment conflicts
echo "1. Task Assignment Conflicts:"
jq -r '.assignments | to_entries[] | "\(.key): \(.value)"' .flowforge/shared/task-assignments.json | while read assignment; do
  task=$(echo "$assignment" | cut -d: -f1)
  dev=$(echo "$assignment" | cut -d: -f2)

  # Check if multiple developers claim the same task
  count=$(jq -r --arg task "$task" '.assignments | to_entries[] | select(.key == $task) | .value' .flowforge/shared/task-assignments.json | wc -l)
  if [[ $count -gt 1 ]]; then
    echo "   CONFLICT: Task $task claimed by multiple developers"
  fi
done

# Check for lock file conflicts
echo ""
echo "2. Lock File Status:"
for lock_file in .flowforge/locks/*.lock; do
  if [[ -f "$lock_file" ]]; then
    filename=$(basename "$lock_file" .lock)
    age_minutes=$((($(date +%s) - $(stat -c %Y "$lock_file")) / 60))
    echo "   $filename: Locked for ${age_minutes} minutes"

    if [[ $age_minutes -gt 5 ]]; then
      echo "     WARNING: Potentially stale lock"
    fi
  fi
done

# Check for namespace issues
echo ""
echo "3. Namespace Health:"
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir" ]]; then
    dev_id=$(basename "$dev_dir")

    # Check for corrupted session files
    if [[ -f "$dev_dir/sessions/current.json" ]]; then
      if ! jq . "$dev_dir/sessions/current.json" >/dev/null 2>&1; then
        echo "   $dev_id: Corrupted session file"
      fi
    fi

    # Check for oversized cache
    cache_size=$(du -sb "$dev_dir/cache" 2>/dev/null | cut -f1)
    if [[ $cache_size -gt 104857600 ]]; then  # 100MB
      echo "   $dev_id: Cache over limit ($(du -sh "$dev_dir/cache" | cut -f1))"
    fi
  fi
done
EOF

chmod +x detect-conflicts.sh
```

### Resolving Conflicts

#### Manual Resolution

```bash
# Create conflict resolution script
cat > resolve-conflicts.sh << 'EOF'
#!/bin/bash
echo "Conflict Resolution Helper"
echo "========================="

case "$1" in
  task)
    task_id="$2"
    echo "Resolving task conflict for: $task_id"

    # Show current assignments
    current_owner=$(jq -r --arg task "$task_id" '.assignments[$task] // "none"' .flowforge/shared/task-assignments.json)
    echo "Current owner: $current_owner"

    # Manual reassignment
    read -p "Enter new owner (or 'clear' to release): " new_owner

    if [[ "$new_owner" == "clear" ]]; then
      jq --arg task "$task_id" 'del(.assignments[$task])' .flowforge/shared/task-assignments.json > temp.json && mv temp.json .flowforge/shared/task-assignments.json
      echo "Task $task_id released"
    else
      jq --arg task "$task_id" --arg owner "$new_owner" '.assignments[$task] = $owner' .flowforge/shared/task-assignments.json > temp.json && mv temp.json .flowforge/shared/task-assignments.json
      echo "Task $task_id assigned to $new_owner"
    fi
    ;;

  lock)
    filename="$2"
    lock_file=".flowforge/locks/$filename.lock"

    if [[ -f "$lock_file" ]]; then
      echo "Removing stale lock: $filename"
      rm -f "$lock_file"
      echo "Lock removed successfully"
    else
      echo "Lock file not found: $filename"
    fi
    ;;

  namespace)
    dev_id="$2"
    echo "Resetting namespace for: $dev_id"

    read -p "This will reset the namespace. Continue? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
      # Backup current state
      backup_dir=".flowforge/recovery/dev-$dev_id-$(date +%Y%m%d-%H%M%S)"
      mkdir -p "$backup_dir"
      cp -r ".flowforge/dev-$dev_id" "$backup_dir/"

      # Reset namespace
      rm -rf ".flowforge/dev-$dev_id"
      FLOWFORGE_DEVELOPER="$dev_id" ./scripts/namespace/integrate.sh init "$dev_id"

      echo "Namespace reset for $dev_id"
      echo "Backup saved to: $backup_dir"
    fi
    ;;

  *)
    echo "Usage: $0 <conflict-type> <identifier>"
    echo ""
    echo "Conflict types:"
    echo "  task <task-id>     - Resolve task assignment conflict"
    echo "  lock <filename>    - Remove stale lock"
    echo "  namespace <dev-id> - Reset corrupted namespace"
    echo ""
    echo "Examples:"
    echo "  $0 task issue-123"
    echo "  $0 lock tasks.json"
    echo "  $0 namespace dev2"
    ;;
esac
EOF

chmod +x resolve-conflicts.sh
```

## 📈 Performance Optimization

### Cache Optimization

```bash
# Create cache optimization script
cat > optimize-cache.sh << 'EOF'
#!/bin/bash
echo "Cache Optimization"
echo "=================="

for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir/cache" ]]; then
    dev_id=$(basename "$dev_dir")
    cache_size=$(du -sb "$dev_dir/cache" | cut -f1)
    cache_human=$(du -sh "$dev_dir/cache" | cut -f1)

    echo "$dev_id: $cache_human"

    if [[ $cache_size -gt 83886080 ]]; then  # 80MB threshold
      echo "  Optimizing cache..."

      # Remove old temporary cache files
      find "$dev_dir/cache" -name "*.tmp" -mtime +1 -delete

      # Clear old provider cache (older than 1 hour)
      if [[ -f "$dev_dir/cache/provider-cache.json" ]]; then
        last_modified=$(stat -c %Y "$dev_dir/cache/provider-cache.json")
        current_time=$(date +%s)
        age=$((current_time - last_modified))

        if [[ $age -gt 3600 ]]; then  # 1 hour
          rm "$dev_dir/cache/provider-cache.json"
          echo "    Cleared old provider cache"
        fi
      fi

      # Clear old command cache (older than 5 minutes)
      if [[ -f "$dev_dir/cache/command-cache.json" ]]; then
        last_modified=$(stat -c %Y "$dev_dir/cache/command-cache.json")
        current_time=$(date +%s)
        age=$((current_time - last_modified))

        if [[ $age -gt 300 ]]; then  # 5 minutes
          rm "$dev_dir/cache/command-cache.json"
          echo "    Cleared old command cache"
        fi
      fi

      new_size=$(du -sh "$dev_dir/cache" | cut -f1)
      echo "    Optimized: $cache_human → $new_size"
    fi
  fi
done
EOF

chmod +x optimize-cache.sh
```

### System Health Monitoring

```bash
# Create health monitoring script
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "FlowForge System Health Check"
echo "============================"

# Check disk space
echo "1. Disk Space Usage:"
total_size=$(du -sh .flowforge/ | cut -f1)
echo "   Total FlowForge usage: $total_size"

available_space=$(df . | tail -1 | awk '{print $4}')
echo "   Available disk space: $((available_space / 1024))MB"

# Check file counts
echo ""
echo "2. File Counts:"
session_files=$(find .flowforge/dev-*/sessions -name "*.json" | wc -l)
cache_files=$(find .flowforge/dev-*/cache -name "*.json" | wc -l)
log_files=$(find .flowforge/dev-*/logs -name "*.log" | wc -l)

echo "   Session files: $session_files"
echo "   Cache files: $cache_files"
echo "   Log files: $log_files"

# Check for errors
echo ""
echo "3. Recent Errors:"
error_count=$(grep -r "ERROR" .flowforge/logs/ 2>/dev/null | wc -l)
if [[ $error_count -gt 0 ]]; then
  echo "   Found $error_count error entries"
  echo "   Recent errors:"
  grep -r "ERROR" .flowforge/logs/ 2>/dev/null | tail -5
else
  echo "   No recent errors found ✅"
fi

# Check performance
echo ""
echo "4. Performance Metrics:"
lock_count=$(find .flowforge/locks/ -name "*.lock" 2>/dev/null | wc -l)
active_sessions=$(grep -l '"active": true' .flowforge/dev-*/sessions/current.json 2>/dev/null | wc -l)

echo "   Active locks: $lock_count"
echo "   Active sessions: $active_sessions"

if [[ $lock_count -gt 5 ]]; then
  echo "   ⚠️  High lock count - investigate potential bottlenecks"
fi

echo ""
echo "Health check completed at $(date)"
EOF

chmod +x health-check.sh
```

## 🔐 Security and Permissions

### Access Control

```bash
# Set proper permissions for namespace directories
for dev_dir in .flowforge/dev-*; do
  if [[ -d "$dev_dir" ]]; then
    # Set owner permissions only
    chmod -R 700 "$dev_dir"
    echo "Set permissions for $dev_dir"
  fi
done

# Protect shared resources
chmod 644 .flowforge/shared/*.json
chmod 644 .flowforge/team/config.json

# Protect critical files
chmod 644 .flowforge/tasks.json
```

### Audit Logging

```bash
# Create audit logging script
cat > setup-audit.sh << 'EOF'
#!/bin/bash
echo "Setting up audit logging..."

# Create audit log directory
mkdir -p .flowforge/audit

# Set up file system monitoring (if available)
if command -v inotifywait >/dev/null; then
  # Monitor critical files
  nohup inotifywait -m -e modify,create,delete .flowforge/tasks.json .flowforge/team/config.json .flowforge/shared/ --format '%T %e %f' --timefmt '%Y-%m-%d %H:%M:%S' >> .flowforge/audit/file-changes.log 2>&1 &
  echo "File system monitoring enabled"
fi

# Set up session audit
cat > .flowforge/audit/session-audit.sh << 'AUDIT_EOF'
#!/bin/bash
# Log session activities
echo "$(date '+%Y-%m-%d %H:%M:%S') - $1 - $2" >> .flowforge/audit/session-activities.log
AUDIT_EOF

chmod +x .flowforge/audit/session-audit.sh
echo "Audit logging configured"
EOF

chmod +x setup-audit.sh
```

## 🆘 Emergency Procedures

### System Recovery

```bash
# Create emergency recovery script
cat > emergency-recovery.sh << 'EOF'
#!/bin/bash
echo "🚨 FlowForge Emergency Recovery"
echo "============================="

case "$1" in
  backup)
    echo "Creating emergency backup..."
    backup_dir="emergency-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r .flowforge/ "$backup_dir"
    echo "Backup created: $backup_dir"
    ;;

  reset-locks)
    echo "Removing all locks..."
    rm -f .flowforge/locks/*.lock
    echo "All locks removed"
    ;;

  reset-shared)
    echo "Resetting shared resources..."
    source ./scripts/namespace/manager.sh
    initialize_shared_resources
    echo "Shared resources reset"
    ;;

  reset-namespace)
    dev_id="$2"
    if [[ -z "$dev_id" ]]; then
      echo "Usage: $0 reset-namespace <dev-id>"
      exit 1
    fi

    echo "Resetting namespace: $dev_id"

    # Backup
    backup_dir="namespace-backup-$dev_id-$(date +%Y%m%d-%H%M%S)"
    mv ".flowforge/dev-$dev_id" "$backup_dir" 2>/dev/null

    # Reinitialize
    FLOWFORGE_DEVELOPER="$dev_id" ./scripts/namespace/integrate.sh init "$dev_id"
    echo "Namespace reset for $dev_id (backup: $backup_dir)"
    ;;

  full-reset)
    echo "⚠️  FULL SYSTEM RESET - This will reset all namespaces!"
    read -p "Are you absolutely sure? Type 'RESET' to confirm: " confirm

    if [[ "$confirm" == "RESET" ]]; then
      # Backup everything
      backup_dir="full-backup-$(date +%Y%m%d-%H%M%S)"
      cp -r .flowforge/ "$backup_dir"

      # Reset all namespaces
      rm -rf .flowforge/dev-*
      rm -f .flowforge/locks/*.lock

      # Reinitialize shared resources
      source ./scripts/namespace/manager.sh
      initialize_shared_resources

      echo "Full reset completed (backup: $backup_dir)"
      echo "All developers need to run: ./run_ff_command.sh flowforge:dev:namespace-init"
    else
      echo "Reset cancelled"
    fi
    ;;

  *)
    echo "Emergency Recovery Options:"
    echo "  backup              - Create emergency backup"
    echo "  reset-locks         - Remove all lock files"
    echo "  reset-shared        - Reset shared resources"
    echo "  reset-namespace <id> - Reset specific namespace"
    echo "  full-reset          - Reset entire system (DANGEROUS)"
    ;;
esac
EOF

chmod +x emergency-recovery.sh
```

## 📚 Quick Reference

### Essential Admin Commands

| Task | Command |
|------|---------|
| Team status | `./team-dashboard.sh` |
| Add developer | `./add-developer.sh` |
| Daily maintenance | `./daily-maintenance.sh` |
| Check conflicts | `./detect-conflicts.sh` |
| Resolve conflicts | `./resolve-conflicts.sh task <task-id>` |
| Health check | `./health-check.sh` |
| Emergency backup | `./emergency-recovery.sh backup` |

### Important Files

| File | Purpose |
|------|---------|
| `.flowforge/team/config.json` | Team configuration |
| `.flowforge/shared/active-developers.json` | Active developers |
| `.flowforge/shared/task-assignments.json` | Task assignments |
| `.flowforge/logs/namespace-manager.log` | System logs |

### Common Issues and Solutions

| Issue | Solution |
|-------|---------|
| Developer can't initialize namespace | Check team config, add developer |
| Cache too large | Run cache optimization |
| Stale locks | Use conflict resolution script |
| Corrupted session | Reset specific namespace |
| Performance issues | Run health check and optimization |

---

**Remember**: As an admin, you're the guardian of team productivity. Monitor regularly, maintain proactively, and resolve conflicts quickly! 🛡️

---

*Admin guide for FlowForge v2.0 | September 2025*