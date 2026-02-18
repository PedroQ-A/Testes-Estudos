# Session Management Guide

**Version**: 2.0  
**Last Updated**: August 2025  
**Audience**: FlowForge Users & Developers

## Overview

FlowForge's session management system provides seamless, zero-friction workflow management using pure JSON data structures. This guide covers how to use the session commands effectively with the new JSON-only architecture.

## Core Session Commands

### `/flowforge:session:start` - Begin Work Session

**Purpose**: Start a new work session with intelligent task detection and zero-friction setup.

#### Basic Usage
```bash
# Auto-detect current task
/flowforge:session:start

# Start specific task
/flowforge:session:start 214

# Show help
/flowforge:session:start ?
```

#### What It Does

1. **Intelligent Task Detection**
   ```bash
   # Detection priority order:
   1. Current session (.flowforge/sessions/current.json)
   2. In-progress tasks from provider
   3. Ready/pending tasks
   4. GitHub assigned issues
   5. Position tracking (if available)
   ```

2. **Issue Verification**
   ```bash
   # Provider bridge verification
   node scripts/provider-bridge.js verify-task --id=214
   
   # Fallback to GitHub
   gh issue view 214 --json state,title
   ```

3. **Git Branch Setup**
   ```bash
   # Auto-creates feature branches
   git checkout -b feature/214-work
   
   # Or switches to existing branch
   git checkout feature/214-work
   ```

4. **Time Tracking Activation**
   ```bash
   # Provider-based time tracking
   node scripts/provider-bridge.js start-tracking --id=214 --user=cruzalex
   
   # Fallback to traditional script
   ./scripts/task-time.sh start 214
   ```

5. **Session Data Creation**
   ```json
   {
     "sessionId": "session-1724984763-12345",
     "taskId": "214",
     "taskTitle": "Fix session management commands",
     "taskStatus": "in_progress", 
     "branch": "feature/214-work",
     "startTime": "2025-08-29T12:46:03.000Z",
     "user": "cruzalex",
     "detectionSource": "provider system",
     "lastActivity": "2025-08-29T12:46:03.000Z"
   }
   ```

#### Advanced Features

**Context Restoration** (Issue #139)
```bash
# Restores previous work context
if [ -f "scripts/context-preservation.sh" ]; then
    ./scripts/context-preservation.sh restore
fi
```

**Pre-flight Checks**
```bash
# Runs comprehensive checks:
- Git status validation
- Test suite execution
- FlowForge rules compliance
- Branch protection validation
```

### `/flowforge:session:end` - Complete Work Session

**Purpose**: Complete work session with automatic cleanup and comprehensive reporting.

#### Basic Usage
```bash
# End with auto-generated commit
/flowforge:session:end

# End with custom commit message  
/flowforge:session:end "Completed user authentication"

# Show help
/flowforge:session:end ?
```

#### What It Does

1. **Load Current Session**
   ```bash
   # Loads from current.json
   ACTIVE_TASK=$(jq -r '.taskId' .flowforge/sessions/current.json)
   SESSION_ID=$(jq -r '.sessionId' .flowforge/sessions/current.json)
   ```

2. **Stop Time Tracking**
   ```bash
   # Provider-based stopping
   node scripts/provider-bridge.js stop-tracking --id=214 --session=session-123
   
   # Fallback to traditional
   ./scripts/task-time.sh pause 214 "End of session"
   ```

3. **Generate Comprehensive Metrics**
   ```bash
   # Session metrics calculation:
   - Duration calculation
   - Commit counting
   - File change analysis
   - Test results capture
   ```

4. **Update Task Status**
   ```bash
   # Update to 'paused' status
   node scripts/provider-bridge.js update-task --id=214 --status=paused
   ```

5. **Archive Session Data**
   ```json
   {
     "sessionId": "session-1724984763-12345",
     "taskId": "214", 
     "branch": "feature/214-work",
     "startTime": "2025-08-29T12:46:03.000Z",
     "endTime": "2025-08-29T16:30:15.000Z",
     "duration": "3h 44m",
     "metrics": {
       "commits": 3,
       "filesAdded": 2,
       "filesModified": 8,
       "testsRun": "5 passed, 0 failed"
     },
     "sessionNotes": "Completed provider bridge implementation"
   }
   ```

6. **Enhanced Commit Creation**
   ```bash
   # Auto-generated commit with metadata
   git commit -m "feat: implement provider bridge

   Session: 2025-08-29
   Issue: #214
   Time: 3h 44m
   
   Changes:
   scripts/provider-bridge.js
   .flowforge/tasks.json
   
   [skip ci]"
   ```

7. **GitHub Issue Updates**
   ```bash
   # Comprehensive progress report
   gh issue comment 214 --body "## 🏁 Session End Update
   **Total Time**: 3h 44m
   **Files changed**: +2, ~8, -0
   **Commits today**: 3
   **Tests**: 5 passed, 0 failed"
   ```

8. **Next Session Preparation**
   ```json
   {
     "lastSession": {
       "taskId": "214",
       "duration": "3h 44m",
       "branch": "feature/214-work"
     },
     "suggestions": {
       "continueTask": 214,
       "pendingTasks": [...],
       "lastBranch": "feature/214-work"
     }
   }
   ```

### `/flowforge:session:pause` - Temporary Session Pause

**Purpose**: Temporarily pause session without ending it (for breaks, meetings).

#### Usage
```bash
/flowforge:session:pause
/flowforge:session:pause "lunch break"
```

#### What It Does
- Pauses time tracking
- Preserves session data
- Updates last activity timestamp
- Does NOT archive session

### Advanced Session Features

## Multi-Instance Session Management

FlowForge supports multiple concurrent sessions across different Claude instances:

### Instance Isolation
```bash
# Each instance gets unique ID
INSTANCE_ID="${USER}@$(hostname):$$:$(date +%s)"

# Session data is instance-aware
{
  "sessionId": "session-1724984763-12345",
  "instanceId": "cruzalex@dev-machine:12345:1724984763",
  "user": "cruzalex"
}
```

### Concurrent Work Prevention
```bash
# Prevents conflicts:
1. Task verification before start
2. Instance-specific time tracking
3. Atomic JSON operations
4. Branch validation
```

### Session Recovery
```bash
# Recover from crashed sessions
if [ -f ".flowforge/sessions/current.json" ]; then
    # Resume previous session
    /flowforge:session:start $(jq -r '.taskId' .flowforge/sessions/current.json)
fi
```

## JSON Data Structures in Detail

### Current Session Structure
```json
{
  "sessionId": "session-[timestamp]-[pid]",
  "taskId": "214",
  "taskTitle": "Fix session management commands",
  "taskStatus": "in_progress",
  "branch": "feature/214-work",
  "startTime": "2025-08-29T12:46:03.000Z",
  "user": "cruzalex", 
  "detectionSource": "provider system|manual|github",
  "lastActivity": "2025-08-29T12:46:03.000Z",
  "instanceId": "session-1724984763-12345",
  "metadata": {
    "gitStatus": "clean|dirty",
    "testsPassing": true,
    "rulesCompliant": true
  }
}
```

### Archive Structure
```bash
.flowforge/sessions/archive/
├── 2025-08/
│   ├── session-2025-08-29-session-123.json
│   ├── session-2025-08-28-session-456.json
│   └── ...
├── 2025-07/
│   └── ...
```

### Archive Entry Example
```json
{
  "sessionId": "session-1724984763-12345",
  "taskId": "214",
  "taskTitle": "Fix session management commands",
  "branch": "feature/214-work",
  "startTime": "2025-08-29T12:46:03.000Z",
  "endTime": "2025-08-29T16:30:15.000Z", 
  "duration": "3h 44m",
  "user": "cruzalex",
  "metrics": {
    "commits": 3,
    "filesAdded": 2,
    "filesModified": 8,
    "filesDeleted": 0,
    "testsRun": "5 passed, 0 failed",
    "linesAdded": 247,
    "linesDeleted": 32
  },
  "commits": [
    "f638211 chore: Clean up temporary files",
    "71d2ba2 feat: Implement JSON provider bridge",
    "cafec46 fix: Resolve critical issues"
  ],
  "lastCommit": "cafec46 fix: Resolve critical issues",
  "sessionNotes": "Completed provider bridge implementation",
  "context": {
    "lastFiles": ["scripts/provider-bridge.js:45", ".flowforge/tasks.json:12"],
    "lastDiff": "+15 -3 scripts/provider-bridge.js"
  }
}
```

## Session Analytics & Reporting

### Daily Summary
```bash
# Generate daily report
find .flowforge/sessions/archive/$(date +%Y-%m) -name "*$(date +%Y-%m-%d)*" \
  | xargs jq '.duration' \
  | awk '{sum+=$1} END {print "Total time today:", sum}'
```

### Weekly Metrics
```bash
# Get week's productivity metrics
for file in .flowforge/sessions/archive/$(date +%Y-%m)/*; do
  jq '.metrics.commits' "$file"
done | awk '{sum+=$1} END {print "Total commits this week:", sum}'
```

### Task Progress Tracking
```bash
# Track progress on specific task
grep -r "taskId.*214" .flowforge/sessions/archive/ \
  | jq '.duration' \
  | awk '{sum+=$1} END {print "Total time on task #214:", sum}'
```

## Integration with Provider System

### Task Status Synchronization
```bash
# Session start → Task status: in_progress
node scripts/provider-bridge.js update-task --id=214 --status=in_progress

# Session pause → Task status: paused  
node scripts/provider-bridge.js update-task --id=214 --status=paused

# Session end → Task status: paused (preserves work)
node scripts/provider-bridge.js update-task --id=214 --status=paused
```

### Time Tracking Integration
```bash
# Provider-native time tracking
node scripts/provider-bridge.js start-tracking \
  --id=214 \
  --user=cruzalex \
  --instance=session-123

# Time data flows to tasks.json
{
  "timeSessions": {
    "214": [
      {
        "id": "json-1755586284593-xid4us6l3",
        "taskId": "214", 
        "startTime": "2025-08-29T12:46:03.000Z",
        "user": "cruzalex",
        "instanceId": "session-1724984763-12345"
      }
    ]
  }
}
```

## Best Practices

### 1. **Always Start Sessions Properly**
```bash
# ✅ Correct
/flowforge:session:start 214

# ❌ Avoid working without session
git checkout feature/214-work  # No time tracking!
```

### 2. **End Sessions Cleanly**
```bash
# ✅ Proper session end
/flowforge:session:end "Completed authentication module"

# ❌ Avoid abrupt stops
# Just closing terminal without ending session
```

### 3. **Use Descriptive Commit Messages**
```bash
# ✅ Enhanced commit with session data
/flowforge:session:end "feat: implement user authentication with JWT tokens"

# ❌ Generic message
/flowforge:session:end "updates"
```

### 4. **Monitor Session Health**
```bash
# Check for orphaned sessions
if [ -f ".flowforge/sessions/current.json" ]; then
  SESSION_AGE=$(jq -r '.startTime' .flowforge/sessions/current.json | xargs date -d)
  if [ $(date -d "$SESSION_AGE" +%s) -lt $(date -d "1 day ago" +%s) ]; then
    echo "⚠️ Session is over 24 hours old!"
  fi
fi
```

### 5. **Regular Session Cleanup**
```bash
# Archive old sessions (automatic)
# Clean up failed sessions
find .flowforge/sessions -name "*.tmp" -delete

# Validate JSON integrity
jq empty .flowforge/sessions/current.json 2>/dev/null || echo "Session JSON corrupted"
```

## Troubleshooting

### Common Issues

#### 1. **Session Won't Start**
```bash
# Check provider bridge
node scripts/provider-bridge.js get-provider

# Verify task exists
node scripts/provider-bridge.js verify-task --id=214

# Check JSON integrity
jq empty .flowforge/tasks.json
```

#### 2. **Time Tracking Issues**
```bash
# Check active tracking
jq '.timeSessions["214"]' .flowforge/tasks.json

# Verify instance isolation
echo "Current instance: $CLAUDE_INSTANCE_ID"
```

#### 3. **Session Data Corruption**
```bash
# Restore from backup
cp .flowforge/tasks.json.backup .flowforge/tasks.json

# Manual session recovery
rm .flowforge/sessions/current.json
/flowforge:session:start 214
```

#### 4. **Git Branch Issues**
```bash
# Check branch status
git status
git branch --show-current

# Reset to clean state
git stash push -m "Pre-session cleanup"
git checkout main
```

### Debug Mode
```bash
# Enable detailed logging
DEBUG=1 /flowforge:session:start 214
DEBUG=1 /flowforge:session:end "debug session"

# Check session file directly  
cat .flowforge/sessions/current.json | jq .

# Monitor provider bridge
node scripts/provider-bridge.js get-provider --debug=true
```

## Migration Notes

### From Legacy MD System
If you have old session data in MD format:

```bash
# Archive old MD files (backup only)
mkdir -p .flowforge/legacy/
mv TASKS.md SESSIONS.md NEXT_SESSION.md .flowforge/legacy/

# Start fresh with JSON system
/flowforge:session:start [your-current-task]
```

### Data Recovery
```bash
# Emergency session recovery
if [ -f ".flowforge/sessions/current.json.backup" ]; then
  mv .flowforge/sessions/current.json.backup .flowforge/sessions/current.json
fi

# Task data recovery
if [ -f ".flowforge/tasks.json.backup" ]; then
  cp .flowforge/tasks.json.backup .flowforge/tasks.json
fi
```

---

**Next Steps**: 
- [Provider Bridge Usage Guide](../providers/provider-bridge-usage.md)
- [JSON Workflow Architecture](../architecture/json-workflow.md)
- [Time Tracking Guide](../guides/time-tracking.md)