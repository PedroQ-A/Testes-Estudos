# FlowForge v2.0 Developer Usage Guide

## 🎯 Daily Workflows with Namespaces

This guide covers practical, day-to-day usage of FlowForge v2.0's namespace system. Perfect for developers who want to master the new multi-developer capabilities.

## 🌅 Morning Routine

### Quick Start Checklist

```bash
# 1. Check your namespace is active
echo "Current developer: $(source scripts/namespace/manager.sh && get_developer_id)"

# 2. See who's already working
./scripts/namespace/integrate.sh active

# 3. Check for overnight messages/updates
./run_ff_command.sh flowforge:dev:namespace-status

# 4. Start your session
./run_ff_command.sh flowforge:session:start <your-task-id>
```

### Morning Status Check

```bash
# Complete morning status in one command
./run_ff_command.sh flowforge:dev:switch --status

# Example output:
# ╔══════════════════════════════════════════════════════════════╗
# ║                    FlowForge Team Status                     ║
# ╚══════════════════════════════════════════════════════════════╝
#
# Active Developers (2/6):
# 👤 dev1 (Alice) - Working on: task-auth-module
# 👤 dev3 (Carol) - Working on: task-api-docs
#
# Your Status:
# 🔧 Developer: dev2 (Bob)
# 📂 Namespace: .flowforge/dev-dev2/
# 📋 Active Session: None
# 💾 Cache Size: 15.2 MB
```

## 🛠️ Core Workflows

### 1. Starting a New Task

```bash
# Standard workflow (exactly like v1.x!)
./run_ff_command.sh flowforge:session:start 456

# What happens behind the scenes in v2.0:
# ✅ Checks if task is already claimed by another developer
# ✅ Claims task for you in team coordination
# ✅ Uses your isolated namespace for session state
# ✅ Registers you as active developer
# ✅ Sets up isolated workspace
```

### 2. Checking Team Status

```bash
# Quick team overview
./scripts/namespace/integrate.sh active

# Detailed status with task info
./run_ff_command.sh flowforge:dev:switch --list

# Check specific task conflicts
./scripts/namespace/integrate.sh check auth-module
```

### 3. Coordinating with Team

```bash
# Before starting work on a sensitive area
./scripts/namespace/integrate.sh check database-schema

# If someone else is working on it:
# 👤 dev1 is currently working on: database-schema
# 📧 Contact alice@company.com before proceeding

# Good practice: Check related tasks
./scripts/namespace/integrate.sh check auth*  # Check all auth-related tasks
```

### 4. Switching Contexts

```bash
# Switch to different namespace (for admins or testing)
./run_ff_command.sh flowforge:dev:switch dev3

# Switch back to your namespace
./run_ff_command.sh flowforge:dev:switch dev2

# Each switch preserves session state in respective namespaces
```

## 🔄 Session Management

### Standard Session Lifecycle

```bash
# Start session
./run_ff_command.sh flowforge:session:start 789
# Output: 🔐 Initializing namespace for developer: dev2
#         ✅ Task 789 claimed successfully
#         ⏱️  Session started for task: 789

# Work normally
git add .
git commit -m "Implement user authentication"

# End session
./run_ff_command.sh flowforge:session:end "Auth module completed"
# Output: 🔒 Cleaning up namespace for developer: dev2
#         ✅ Namespace cleaned up
#         ⏱️  Session ended. Total time: 2h 15m
```

### Session State Isolation

Your session state is completely isolated:

```bash
# Your session file (only you can modify)
cat .flowforge/dev-dev2/sessions/current.json
{
  "active": true,
  "sessionId": "session-1234567890",
  "startTime": "2025-09-17T09:30:00Z",
  "taskId": "789",
  "developerId": "dev2"
}

# Another developer's session (you can read but not modify)
cat .flowforge/dev-dev1/sessions/current.json
{
  "active": true,
  "sessionId": "session-0987654321",
  "startTime": "2025-09-17T08:45:00Z",
  "taskId": "456",
  "developerId": "dev1"
}
```

### Pause and Resume

```bash
# Pause session (preserves state)
./run_ff_command.sh flowforge:session:pause "Going to lunch"

# Resume later
./run_ff_command.sh flowforge:session:start 789  # Same task ID
# Output: 📂 Resuming existing session for task: 789
#         ⏱️  Previous session time: 1h 30m
```

## 💾 Cache Management

### Understanding Your Cache

```bash
# Check cache status
./run_ff_command.sh flowforge:dev:namespace-status

# Manual cache inspection
ls -la .flowforge/dev-dev2/cache/
# provider-cache.json     # GitHub/Linear API responses
# command-cache.json      # FlowForge command outputs
# time-tracking.json      # Your time tracking data
```

### Cache Benefits

1. **Provider Data**: GitHub issues, Linear tasks cached for 5 minutes
2. **Command Outputs**: Frequently used command results cached for 1 minute
3. **Time Tracking**: Session data preserved across interruptions
4. **Performance**: Faster command execution with cached data

### Manual Cache Management

```bash
# Clean cache when it gets too large
./run_ff_command.sh flowforge:dev:namespace-clean

# Check cache size before cleaning
du -sh .flowforge/dev-dev2/cache/

# Force cache refresh for specific provider
rm .flowforge/dev-dev2/cache/provider-cache.json
./run_ff_command.sh flowforge:dev:status  # Will refresh cache
```

## 🚫 Conflict Resolution

### Automatic Conflict Detection

```bash
# When starting a session on a claimed task:
./run_ff_command.sh flowforge:session:start 123

# Possible outputs:
# ✅ Task 123 claimed successfully
# ⚠️  WARNING: Task 123 is currently being worked on by dev1
# ❌ Task 123 is locked by another developer
```

### Manual Conflict Checking

```bash
# Check before starting work
./scripts/namespace/integrate.sh check issue-123

# Check related work
./scripts/namespace/integrate.sh check auth*  # Wildcard matching
./scripts/namespace/integrate.sh check *-api  # API-related tasks
```

### Conflict Resolution Strategies

#### Strategy 1: Direct Communication
```bash
# Find who's working on conflicting task
./scripts/namespace/integrate.sh active | grep "Working on: issue-123"
# 👤 dev1 (Alice) - Working on: issue-123

# Contact directly: alice@company.com
# "Hey Alice, I need to work on issue-123. Can we coordinate?"
```

#### Strategy 2: Work on Related Tasks
```bash
# Find related but non-conflicting tasks
./run_ff_command.sh flowforge:project:tasks | grep auth
# issue-124: "Authentication unit tests"  (not claimed)
# issue-125: "Auth documentation"         (not claimed)

# Work on those instead
./run_ff_command.sh flowforge:session:start 124
```

#### Strategy 3: Coordinate Timing
```bash
# Check estimated completion time
./scripts/namespace/integrate.sh active
# 👤 dev1 (Alice) - Working on: issue-123 (started 30 min ago)

# Wait or coordinate handoff
# "Alice, when do you expect to finish issue-123?"
```

## 🏗️ Workspace Organization

### Your Personal Workspace

```bash
# Your isolated workspace structure
.flowforge/dev-dev2/
├── workspace/
│   ├── temp/           # Temporary files (auto-cleaned)
│   └── drafts/         # Work in progress (preserved)
├── logs/               # Your debug logs
└── config.json         # Your preferences
```

### Best Practices

#### Temporary Files
```bash
# Use temp directory for transient data
echo "debug info" > .flowforge/dev-dev2/workspace/temp/debug.txt

# Files here are auto-cleaned after 24 hours
```

#### Work Drafts
```bash
# Use drafts for work-in-progress
cp api-design.md .flowforge/dev-dev2/workspace/drafts/
vim .flowforge/dev-dev2/workspace/drafts/api-design.md

# Files here are preserved until you delete them
```

#### Personal Configuration
```bash
# Customize your namespace settings
cat .flowforge/dev-dev2/config.json
{
  "developerId": "dev2",
  "settings": {
    "autoCleanup": true,
    "sessionTimeout": 7200,
    "cacheEnabled": true
  }
}

# Edit as needed (JSON format)
```

## 🔍 Monitoring and Debugging

### Namespace Health Check

```bash
# Complete health check
./run_ff_command.sh flowforge:dev:namespace-status

# Example output:
# ╔══════════════════════════════════════════════════════════════╗
# ║                  Namespace Status: dev2                     ║
# ╚══════════════════════════════════════════════════════════════╝
#
# 📂 Namespace: .flowforge/dev-dev2/
# 👤 Developer: dev2 (Bob Smith)
# 📧 Email: bob@company.com
#
# 📋 Session Status:
# ├── Active: ✅ Yes
# ├── Task ID: 789
# ├── Started: 09:30 AM (2h 15m ago)
# └── Session ID: session-1234567890
#
# 💾 Cache Status:
# ├── Size: 23.4 MB / 100 MB
# ├── Provider cache: Fresh (updated 2m ago)
# └── Command cache: Fresh (updated 30s ago)
#
# 🔧 Workspace:
# ├── Temp files: 3 files (auto-clean in 18h)
# ├── Draft files: 1 file
# └── Logs: 2.1 MB
```

### Debug Information

```bash
# View namespace logs
tail -f .flowforge/logs/namespace-manager.log

# View your personal logs
tail -f .flowforge/dev-dev2/logs/session.log

# Debug specific operations
LOG_LEVEL=DEBUG ./run_ff_command.sh flowforge:session:start 999
```

### Performance Monitoring

```bash
# Check cache performance
time ./run_ff_command.sh flowforge:dev:status

# Monitor cache hit rates
grep "cache hit" .flowforge/dev-dev2/logs/*.log | wc -l
grep "cache miss" .flowforge/dev-dev2/logs/*.log | wc -l

# Clean up if performance degrades
./run_ff_command.sh flowforge:dev:namespace-clean
```

## 🎨 Advanced Usage Patterns

### Pattern 1: Feature Branch Coordination

```bash
# Starting a new feature
./run_ff_command.sh flowforge:session:start feature-payment-gateway

# Check if anyone else is working on payment-related features
./scripts/namespace/integrate.sh check payment*
./scripts/namespace/integrate.sh check gateway*

# Coordinate if conflicts found
# "Hey team, I'm starting the payment gateway. Any conflicts with current work?"
```

### Pattern 2: Bug Fix Coordination

```bash
# Emergency bug fix
./run_ff_command.sh flowforge:session:start bug-critical-login

# Check if anyone is working on authentication
./scripts/namespace/integrate.sh check auth*
./scripts/namespace/integrate.sh check login*

# If conflicts, coordinate immediately
# "URGENT: Critical login bug. Alice, can you pause auth work for 30 min?"
```

### Pattern 3: Code Review Preparation

```bash
# Before requesting code review
./run_ff_command.sh flowforge:session:end "Feature complete, ready for review"

# Check who might be good reviewers (not currently in related work)
./scripts/namespace/integrate.sh active
# Avoid asking someone working on conflicting features
```

### Pattern 4: Testing Coordination

```bash
# Before running integration tests
./scripts/namespace/integrate.sh active
# Check if anyone is in a critical development phase

# Good practice: Announce testing
# "Running integration tests in 5 minutes. Please commit/pause if needed."
```

## 🔧 Customization

### Environment Variables

```bash
# Set permanent developer ID
echo 'export FLOWFORGE_DEVELOPER=dev2' >> ~/.bashrc

# Set custom cache limits
echo 'export FLOWFORGE_CACHE_LIMIT=50MB' >> ~/.bashrc

# Set custom session timeout
echo 'export FLOWFORGE_SESSION_TIMEOUT=3600' >> ~/.bashrc  # 1 hour
```

### Personal Aliases

```bash
# Add to ~/.bashrc or ~/.zshrc
alias ffs='./run_ff_command.sh flowforge:session:start'
alias ffe='./run_ff_command.sh flowforge:session:end'
alias ffstatus='./run_ff_command.sh flowforge:dev:namespace-status'
alias ffteam='./scripts/namespace/integrate.sh active'
alias ffcheck='./scripts/namespace/integrate.sh check'

# Usage:
# ffs 456          # Start session for task 456
# ffe "Done"       # End session with message
# ffstatus         # Check namespace status
# ffteam           # See team activity
# ffcheck auth*    # Check auth-related conflicts
```

### Custom Scripts

```bash
# Create personal workflow script
cat > ~/ff-morning.sh << 'EOF'
#!/bin/bash
echo "🌅 FlowForge Morning Routine"
echo "==============================="
echo "Team Status:"
./scripts/namespace/integrate.sh active
echo ""
echo "Your Namespace:"
./run_ff_command.sh flowforge:dev:namespace-status
echo ""
echo "Ready to start your day! 🚀"
EOF

chmod +x ~/ff-morning.sh

# Run each morning
~/ff-morning.sh
```

## 🎯 Tips and Tricks

### Productivity Tips

1. **Always check team status before starting work**
   ```bash
   ./scripts/namespace/integrate.sh active
   ```

2. **Use wildcards to check related tasks**
   ```bash
   ./scripts/namespace/integrate.sh check auth*
   ./scripts/namespace/integrate.sh check api*
   ```

3. **Set up morning routine**
   ```bash
   # Check overnight activity
   ./run_ff_command.sh flowforge:dev:switch --status
   ```

4. **End sessions properly**
   ```bash
   # Always include meaningful messages
   ./run_ff_command.sh flowforge:session:end "Auth module: JWT implementation complete"
   ```

### Collaboration Tips

1. **Communicate proactively**
   - Check conflicts before starting
   - Announce major changes
   - Coordinate shared resources

2. **Use descriptive task names**
   - `auth-jwt-implementation` vs `auth-stuff`
   - `payment-gateway-stripe` vs `payment-work`

3. **Respect others' sessions**
   - Don't force-claim locked tasks
   - Coordinate timing for shared resources

### Performance Tips

1. **Monitor cache size**
   ```bash
   # Weekly cache check
   du -sh .flowforge/dev-*/cache/
   ```

2. **Clean regularly**
   ```bash
   # Clean after each major feature
   ./run_ff_command.sh flowforge:dev:namespace-clean
   ```

3. **Use local temp directory for large files**
   ```bash
   # Don't put large files in FlowForge workspace
   mkdir -p /tmp/my-work
   ```

## 🆘 Quick Reference

### Essential Commands

| Command | Purpose |
|---------|---------|
| `./run_ff_command.sh flowforge:dev:namespace-init` | Initialize your namespace |
| `./run_ff_command.sh flowforge:dev:namespace-status` | Check your status |
| `./run_ff_command.sh flowforge:dev:switch --list` | See team activity |
| `./scripts/namespace/integrate.sh active` | Active developers |
| `./scripts/namespace/integrate.sh check <task>` | Check task conflicts |
| `./run_ff_command.sh flowforge:dev:namespace-clean` | Clean your cache |

### File Locations

| File | Purpose |
|------|---------|
| `.flowforge/dev-<id>/sessions/current.json` | Your session state |
| `.flowforge/dev-<id>/cache/` | Your cached data |
| `.flowforge/dev-<id>/workspace/` | Your workspace |
| `.flowforge/shared/active-developers.json` | Team activity |
| `.flowforge/shared/task-assignments.json` | Task ownership |

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `FLOWFORGE_DEVELOPER` | Your developer ID |
| `FLOWFORGE_CACHE_LIMIT` | Cache size limit |
| `FLOWFORGE_SESSION_TIMEOUT` | Session timeout |
| `LOG_LEVEL` | Debug logging level |

---

**Pro Tip**: Bookmark this guide! You'll reference it frequently as you master FlowForge v2.0's namespace system. 📚

---

*Usage guide for FlowForge v2.0 | September 2025*