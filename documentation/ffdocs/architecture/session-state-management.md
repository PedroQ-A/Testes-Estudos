# Session State Management Architecture

## Overview

FlowForge's session state management system ensures accurate time tracking for developer payment. This document describes the multi-layered protection architecture implemented after critical session corruption incidents.

## Core Principles

1. **Time = Money**: Every second of developer work must be accurately tracked
2. **Data Integrity**: Session state must never be corrupted
3. **Fail-Safe**: Automatic detection and recovery from corruption
4. **Type Safety**: Clear distinction between Issue IDs and PR numbers
5. **Local State**: Session files are local-only, never in Git

## Architecture Components

### 1. Session State Files

#### Primary Files
- `.flowforge/sessions/current.json` - Active session state
- `.flowforge/sessions/next.json` - Queued next task
- `.flowforge/sessions/archive/*.json` - Completed sessions

#### File Structure
```json
{
  "sessionId": "session-1736442000000-315",
  "taskId": "315",              // GitHub Issue number ONLY
  "taskTitle": "GitHub Package Registry Setup",
  "branch": "feature/315-github-package",
  "startTime": 1736442000000,
  "lastActivity": 1736443800000,
  "status": "active",
  "prNumber": null,              // Separate PR tracking
  "originalTaskId": "315",       // Corruption detection
  "validated": true              // Validation flag
}
```

### 2. Validation Layers

#### Layer 1: Entry Validation
```bash
# scripts/validate-task-id.sh
#!/bin/bash
validate_task_id() {
    local task_id=$1
    
    # Reject PR numbers (typically >= 300)
    if [[ "$task_id" =~ ^[0-9]+$ ]] && [ "$task_id" -ge 300 ]; then
        echo "ERROR: Task ID $task_id might be a PR number"
        return 1
    fi
    
    # Reject ghost tasks (> 10000)
    if [ "$task_id" -gt 10000 ]; then
        echo "ERROR: Task ID $task_id is suspiciously high"
        return 1
    fi
    
    return 0
}
```

#### Layer 2: JSON Format Validation
```javascript
// Before any read operation
function validateSessionJson(filepath) {
    try {
        const content = fs.readFileSync(filepath, 'utf8');
        JSON.parse(content);
        return true;
    } catch (e) {
        console.error(`Invalid JSON in ${filepath}`);
        return false;
    }
}
```

#### Layer 3: Runtime Guards
```bash
# hooks/pre-session-guard.sh
#!/bin/bash
before_session_operation() {
    # Check JSON validity
    if ! jq empty .flowforge/sessions/current.json 2>/dev/null; then
        echo "Session corrupted - triggering recovery"
        ./scripts/recover-session.sh
    fi
    
    # Validate task ID
    TASK_ID=$(jq -r '.taskId' .flowforge/sessions/current.json)
    if ! ./scripts/validate-task-id.sh "$TASK_ID"; then
        echo "Invalid task ID detected"
        exit 1
    fi
}
```

### 3. Protection Mechanisms

#### Git Protection
```gitignore
# .gitignore entries
.flowforge/sessions/current.json
.flowforge/sessions/next.json
.flowforge/local/
.flowforge/sessions/*.json
!.flowforge/sessions/.gitkeep
```

#### Atomic Writes
```javascript
function atomicWrite(filepath, data) {
    const tempFile = `${filepath}.tmp`;
    
    // Write to temp file
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    
    // Validate temp file
    if (!validateSessionJson(tempFile)) {
        throw new Error('Invalid JSON generated');
    }
    
    // Atomic rename
    fs.renameSync(tempFile, filepath);
}
```

#### Lock Files
```javascript
class SessionLock {
    constructor() {
        this.lockFile = '.flowforge/local/session.lock';
    }
    
    async acquire() {
        while (fs.existsSync(this.lockFile)) {
            await sleep(100);
        }
        fs.writeFileSync(this.lockFile, process.pid.toString());
    }
    
    release() {
        if (fs.existsSync(this.lockFile)) {
            fs.unlinkSync(this.lockFile);
        }
    }
}
```

### 4. Recovery System

#### Automatic Recovery
```bash
# scripts/recover-session.sh
#!/bin/bash
recover_session() {
    echo "🔧 Starting session recovery..."
    
    # Backup corrupted state
    if [ -f .flowforge/sessions/current.json ]; then
        cp .flowforge/sessions/current.json \
           .flowforge/sessions/backup.$(date +%s).json
    fi
    
    # Extract task from branch
    BRANCH=$(git branch --show-current)
    TASK_ID=$(echo $BRANCH | grep -oP 'feature/\K\d+' | head -1)
    
    # Validate extracted task
    if ./scripts/validate-task-id.sh "$TASK_ID"; then
        # Create clean session
        cat > .flowforge/sessions/current.json << EOF
{
  "taskId": "$TASK_ID",
  "branch": "$BRANCH",
  "status": "recovered",
  "recoveredAt": $(date +%s)000
}
EOF
        echo "✅ Session recovered with task #$TASK_ID"
    else
        echo "❌ Could not recover valid task ID"
        echo '{}' > .flowforge/sessions/current.json
    fi
}
```

#### Manual Recovery
```bash
# For emergency situations
reset_session() {
    rm -f .flowforge/sessions/*.json
    rm -rf .flowforge/local/
    git checkout .flowforge/sessions/.gitkeep
    echo "Session state reset - please start fresh"
}
```

### 5. Provider Bridge Integration

#### Ghost Task Detection
```javascript
// scripts/provider-bridge.js
function filterValidTasks(tasks, tasksData) {
    return tasks.filter(taskId => {
        // Check task exists
        const exists = tasksData.tasks.some(t => t.id === taskId);
        
        // Check not a PR number
        const notPR = taskId < 300 || taskId.includes('-');
        
        // Check not a ghost
        const notGhost = taskId < 10000;
        
        return exists && notPR && notGhost;
    });
}
```

#### Session Validation
```javascript
function validateSession(session) {
    const validators = [
        () => session.taskId !== undefined,
        () => !isNaN(parseInt(session.taskId)),
        () => parseInt(session.taskId) < 300 || session.taskId.includes('-'),
        () => session.branch && session.branch.includes(session.taskId),
        () => session.originalTaskId === session.taskId
    ];
    
    return validators.every(v => v());
}
```

### 6. Monitoring & Alerts

#### Corruption Detection
```bash
# Continuous monitoring
monitor_session() {
    while true; do
        if [ -f .flowforge/sessions/current.json ]; then
            TASK_ID=$(jq -r '.taskId' .flowforge/sessions/current.json 2>/dev/null)
            
            # Check for PR contamination
            if [ "$TASK_ID" -ge 300 ] 2>/dev/null; then
                echo "🚨 ALERT: Possible session corruption!"
                ./scripts/recover-session.sh
            fi
        fi
        sleep 5
    done
}
```

#### Health Checks
```javascript
// Regular validation
setInterval(() => {
    const session = loadSession();
    if (!validateSession(session)) {
        console.error('Session validation failed');
        triggerRecovery();
    }
}, 60000); // Every minute
```

## State Transitions

### Normal Flow
```
INIT → START_SESSION → ACTIVE → PAUSE → RESUME → END_SESSION → ARCHIVED
```

### Recovery Flow
```
CORRUPTED → DETECT → BACKUP → EXTRACT_FROM_BRANCH → VALIDATE → RESTORE → ACTIVE
```

### Error Flow
```
ERROR → CAPTURE_STATE → ANALYZE → RECOVER → VALIDATE → RETRY
```

## Security Considerations

### Input Validation
- All task IDs validated before use
- JSON format verified before parsing
- Command injection prevention

### Data Protection
- Session files never in Git
- Atomic writes prevent partial updates
- Backup before any modification

### Access Control
- Lock files prevent concurrent modification
- Read-only archives
- Protected recovery scripts

## Performance Optimizations

### Caching
```javascript
class SessionCache {
    constructor() {
        this.cache = new Map();
        this.maxAge = 5000; // 5 seconds
    }
    
    get(key) {
        const entry = this.cache.get(key);
        if (entry && Date.now() - entry.time < this.maxAge) {
            return entry.value;
        }
        return null;
    }
    
    set(key, value) {
        this.cache.set(key, {
            value,
            time: Date.now()
        });
    }
}
```

### Lazy Loading
- Archives loaded on-demand
- Historical data paginated
- Minimal memory footprint

## Testing Strategy

### Unit Tests
- Validation functions
- Recovery procedures
- State transitions

### Integration Tests
- Full workflow scenarios
- Corruption recovery
- Git integration

### Stress Tests
- Concurrent sessions
- Large task IDs
- Rapid state changes

## Maintenance Procedures

### Daily
- Monitor session health
- Check for corruption alerts
- Verify time tracking

### Weekly
- Archive old sessions
- Clean temporary files
- Update recovery scripts

### Monthly
- Review incident logs
- Update documentation
- Performance analysis

## Troubleshooting Guide

### Common Issues

#### Session Shows Wrong Task
**Cause**: PR number contamination  
**Fix**: Run `./scripts/recover-session.sh`

#### JSON Parse Errors
**Cause**: Corrupted file format  
**Fix**: Delete and recreate session file

#### Time Tracking Gaps
**Cause**: Session interruption  
**Fix**: Check archives and reconcile

### Emergency Contacts
- Lead Developer: Review architecture
- DevOps: Monitor infrastructure
- QA: Test recovery procedures

## Future Improvements

### Planned Enhancements
1. Event sourcing for complete audit trail
2. Distributed session state
3. Real-time corruption prevention
4. Statistical analysis for anomaly detection
5. Blockchain for immutable time logs

### Research Areas
- Zero-trust session architecture
- Quantum-resistant encryption
- Automated recovery systems
- Predictive corruption detection

---

**Version**: 2.0.4  
**Status**: Production  
**Last Updated**: 2025-01-09  
**Critical**: This architecture protects developer payment tracking