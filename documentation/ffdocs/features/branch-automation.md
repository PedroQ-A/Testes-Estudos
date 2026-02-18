# Branch Automation Features Documentation

**Issue #206: Context restoration and branch automation**

## Overview

FlowForge Branch Automation provides intelligent, seamless branch switching with automatic context preservation, conflict prevention, and smart stash management. This system eliminates the friction of context switching by automatically handling the tedious tasks developers face when moving between branches.

### Core Features

- **Enhanced Context Management**: Preserves file positions, workspace layout, and uncommitted changes
- **Intelligent Conflict Prevention**: Proactive conflict detection and resolution strategies
- **Smart Stash Management**: Automatic categorization, prioritization, and application of stashes
- **Git Hook Integration**: Seamless integration with standard Git workflows
- **Configuration-Driven**: Highly customizable behavior through configuration files

### Benefits

- **Zero-Friction Branch Switching**: Maintain productivity when switching contexts
- **Conflict Prevention**: Detect and prevent merge conflicts before they occur
- **Intelligent Restoration**: Automatically restore your exact working state
- **Minimal Manual Intervention**: Let the system handle routine tasks automatically

## Installation

### Quick Install

Run the installation script from the FlowForge root directory:

```bash
# Navigate to FlowForge directory
cd /path/to/flowforge

# Run the installer
./scripts/install-branch-automation.sh
```

### Manual Installation Steps

If you prefer to install manually or need to understand the components:

1. **Create Directory Structure**:
```bash
mkdir -p .flowforge/{contexts,stashes,merge-backups,rebase-contexts,logs,conflict-backups,stash-backups}
```

2. **Install Git Hooks**:
```bash
# Copy hook handler
cp hooks/branch-automation-hooks.sh .git/hooks/

# Install individual hooks
for hook in post-checkout pre-merge-commit post-merge pre-rebase post-rewrite pre-commit; do
    cat > .git/hooks/$hook << 'EOF'
#!/bin/bash
# Git hook - FlowForge Branch Automation
./hooks/branch-automation-hooks.sh $hook "$@"
EOF
    chmod +x .git/hooks/$hook
done
```

3. **Create Configuration**:
```bash
cp .flowforge/branch-automation.conf.example .flowforge/branch-automation.conf
# Edit configuration as needed
```

### Verification

After installation, verify everything is working:

```bash
# Test Git hooks are installed
ls -la .git/hooks/

# Check configuration
cat .flowforge/branch-automation.conf

# Test smart checkout (if available)
git smart-checkout --help
```

## Usage Examples

### Basic Branch Switching

```bash
# Standard Git checkout with automatic enhancements
git checkout feature/new-feature
# → Automatically preserves context, stashes changes, handles conflicts

# Smart checkout with context preservation
git smart-checkout feature/new-feature
# → Enhanced context switching with full restoration

# Analyze potential conflicts before switching
git analyze-conflicts main
# → Shows conflict analysis and recommendations
```

### Smart Stash Operations

```bash
# Create intelligent stash with categorization
git smart-stash "Working on user authentication"
# → Creates: [WIP] Working on user authentication (feature/auth-system)

# Standard stash operations are enhanced automatically
git stash push -m "Bug fix in progress"
# → Automatically categorized and prioritized
```

### Context Management

The system automatically:
- Saves cursor positions and open files
- Preserves workspace layout
- Backs up uncommitted changes
- Restores context when returning to branches

## Core Components

### EnhancedContextManager

The core component responsible for context preservation and restoration.

#### Key Methods

```typescript
// Capture enhanced context with conflict prevention
const context = await manager.captureEnhancedContext(
  'task-123', 
  'bug-456',
  {
    strategy: 'conservative',
    autoResolve: true,
    backupChanges: true
  }
);

// Restore context with conflict resolution
const result = await manager.restoreEnhancedContext(
  'ctx-123',
  {
    restoreFiles: true,
    restoreGit: true,
    resolveConflicts: true
  }
);

// Validate context integrity
const validation = await manager.validateEnhancedContext('ctx-123');
if (!validation.valid) {
  console.log('Issues:', validation.issues);
}
```

#### Enhanced Context Structure

```typescript
interface EnhancedContext extends SidetrackContext {
  conflictPrevention?: {
    mergeBase: string;
    potentialConflicts: string[];
    strategy: 'merge' | 'rebase' | 'cherry-pick';
  };
  fileSnapshots?: Map<string, {
    content: string;
    hash: string;
    lastModified: Date;
    cursorPosition?: { line: number; column: number };
  }>;
  stashStrategy?: {
    autoStash: boolean;
    includeUntracked: boolean;
    message: string;
  };
  workspaceLayout?: {
    openTabs: string[];
    splitPanes: Array<{ file: string; position: string }>;
    terminalState: { cwd: string; history: string[] };
  };
}
```

### ConflictPrevention

Intelligent conflict detection and prevention system.

#### Conflict Analysis

```typescript
// Analyze conflicts between branches
const analysis = await conflictPrevention.analyzeConflicts(
  'feature/206-work', 
  'main'
);

console.log(`Found ${analysis.conflictCount} potential conflicts`);
console.log(`Risk Level: ${analysis.riskLevel}`);
console.log(`Estimated Resolution Time: ${analysis.estimatedResolutionTime} minutes`);

// Get conflict details
for (const file of analysis.files) {
  console.log(`${file.path}: ${file.severity} (${file.regions.length} regions)`);
}
```

#### Conflict Prevention

```typescript
// Apply conflict prevention strategies
const result = await conflictPrevention.preventConflicts(analysis, {
  autoResolve: true,
  preferOurs: false,
  preferTheirs: false,
  interactiveMode: false,
  backupBeforeResolve: true,
  testAfterResolve: true
});

if (!result.success) {
  console.error('Prevention failed:', result.error);
}
```

#### Analysis Results Structure

```typescript
interface ConflictAnalysis {
  hasConflicts: boolean;
  conflictCount: number;
  files: ConflictFile[];
  mergeBase: string;
  strategy: MergeStrategy;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedResolutionTime: number; // in minutes
}

interface ConflictFile {
  path: string;
  conflictType: 'content' | 'rename' | 'delete' | 'mode';
  severity: 'minor' | 'major' | 'critical';
  lineCount: number;
  regions: ConflictRegion[];
  suggestions: ResolutionSuggestion[];
}
```

### StashManager

Intelligent stash management with categorization and prioritization.

#### Intelligent Stash Creation

```typescript
// Create intelligent stash with automatic categorization
const result = await stashManager.createIntelligentStash(
  'WIP: Implementing new feature',
  {
    taskId: 'task-123',
    priority: 'high',
    metadata: {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  }
);

// Auto-stash during context switch
const autoResult = await stashManager.autoStash('Switching to bug fix');
```

#### Stash Organization

```typescript
// List stashes with filtering
const stashes = await stashManager.listStashes({
  category: 'wip',
  branch: 'feature/206-work',
  priority: 'high',
  sortBy: 'priority'
});

// Organize stashes
await stashManager.organizeStashes({
  maxStashes: 20,
  autoCleanup: true,
  groupByCategory: true,
  sortBy: 'priority'
});

// Clean up old stashes
const cleaned = await stashManager.cleanupOldStashes();
console.log(`Cleaned ${cleaned} old stashes`);
```

#### Stash Application

```typescript
// Apply stash with intelligent conflict resolution
const result = await stashManager.applyStashIntelligently('stash-123', {
  conflictResolution: 'merge',
  preserveIndex: true,
  createBackup: true,
  verifyIntegrity: true
});

// Convert stash to commit
const commitResult = await stashManager.stashToCommit(
  'stash-123',
  'feat: Complete user authentication feature'
);
```

## Configuration Options

### Configuration File Location

The configuration is stored in `.flowforge/branch-automation.conf`:

```bash
# View current configuration
cat .flowforge/branch-automation.conf

# Edit configuration
$EDITOR .flowforge/branch-automation.conf
```

### Core Feature Toggles

```bash
# Enable/disable main features
AUTO_STASH_ENABLED=true
CONFLICT_PREVENTION_ENABLED=true
CONTEXT_PRESERVATION_ENABLED=true
SMART_BRANCH_NAMING_ENABLED=true
AUTO_CLEANUP_ENABLED=true
```

### Stash Management Configuration

```bash
# Stash behavior
STASH_INCLUDE_UNTRACKED=true
STASH_CREATE_BACKUP=true
STASH_AUTO_APPLY=true
STASH_MAX_AGE_DAYS=30
```

### Conflict Prevention Configuration

```bash
# Conflict handling
CONFLICT_AUTO_RESOLVE=false
CONFLICT_PREFER_OURS=false
CONFLICT_PREFER_THEIRS=false
CONFLICT_CREATE_BACKUP=true
```

### Context Preservation Configuration

```bash
# Context features
CONTEXT_SAVE_CURSOR_POSITION=true
CONTEXT_SAVE_WORKSPACE_LAYOUT=true
CONTEXT_RESTORE_AUTO=true
```

### Branch Management Configuration

```bash
# Branch naming
BRANCH_MAX_LENGTH=80
BRANCH_USE_ISSUE_NUMBER=true
BRANCH_SANITIZE_NAMES=true
```

### Advanced Options

```bash
# Logging and debugging
VERBOSE=false
LOG_LEVEL="INFO"  # DEBUG, INFO, WARNING, ERROR

# Experimental features
ENABLE_TELEMETRY=false
ENABLE_EXPERIMENTAL_FEATURES=false
```

### Runtime Configuration

You can also set configuration options as environment variables:

```bash
# Temporary override for single operation
AUTO_STASH_ENABLED=false git checkout main

# Session-wide override
export CONFLICT_PREVENTION_ENABLED=false
git checkout feature/risky-branch
```

## API Reference

### EnhancedContextManager Class

#### Constructor
```typescript
constructor()
```

#### Methods

##### captureEnhancedContext
```typescript
async captureEnhancedContext(
  taskId: string,
  bugId?: string,
  conflictOptions?: ConflictPreventionOptions
): Promise<EnhancedContext>
```

Captures enhanced context with additional metadata including conflict prevention analysis, file snapshots, stash strategy, and workspace layout.

**Parameters:**
- `taskId`: Current task identifier
- `bugId`: Optional bug identifier  
- `conflictOptions`: Conflict prevention settings

**Returns:** Enhanced context with metadata

**Example:**
```typescript
const context = await manager.captureEnhancedContext('task-123', 'bug-456', {
  strategy: 'conservative',
  autoResolve: true
});
```

##### restoreEnhancedContext
```typescript
async restoreEnhancedContext(
  contextId: string,
  options: RestoreOptions & { resolveConflicts?: boolean }
): Promise<AsyncResult<string>>
```

Restores context with enhanced features including file snapshots and conflict resolution.

**Parameters:**
- `contextId`: Context to restore
- `options`: Restore options with conflict resolution

**Returns:** Restoration result

##### intelligentStash
```typescript
async intelligentStash(
  options: StashManagementOptions
): Promise<AsyncResult<string>>
```

Manages stash operations intelligently with backup creation and conflict handling.

**Parameters:**
- `options`: Stash management configuration

**Returns:** Stash reference or error

##### validateEnhancedContext
```typescript
async validateEnhancedContext(
  contextId: string
): Promise<{ valid: boolean; issues?: string[] }>
```

Validates enhanced context integrity including file snapshots and conflict prevention data.

### ConflictPrevention Class

#### Methods

##### analyzeConflicts
```typescript
async analyzeConflicts(
  sourceBranch: string,
  targetBranch: string
): Promise<ConflictAnalysis>
```

Analyzes potential conflicts between two branches with detailed risk assessment.

**Parameters:**
- `sourceBranch`: Source branch name
- `targetBranch`: Target branch name

**Returns:** Detailed conflict analysis

**Example:**
```typescript
const analysis = await conflictPrevention.analyzeConflicts('feature/206-work', 'main');
console.log(`Found ${analysis.conflictCount} potential conflicts`);
```

##### preventConflicts
```typescript
async preventConflicts(
  analysis: ConflictAnalysis,
  strategy: ResolutionStrategy
): Promise<AsyncResult<void>>
```

Applies conflict prevention strategies proactively.

**Parameters:**
- `analysis`: Conflict analysis results
- `strategy`: Resolution strategy configuration

**Returns:** Prevention result

##### getConflictHistory
```typescript
getConflictHistory(source: string, target: string): ConflictAnalysis[]
```

Retrieves historical conflict data for learning and pattern recognition.

### StashManager Class

#### Methods

##### createIntelligentStash
```typescript
async createIntelligentStash(
  message: string,
  metadata?: Partial<StashEntry>
): Promise<AsyncResult<StashEntry>>
```

Creates an intelligent stash with automatic categorization and metadata.

**Parameters:**
- `message`: Stash message
- `metadata`: Optional metadata

**Returns:** Created stash entry

**Example:**
```typescript
const result = await stashManager.createIntelligentStash(
  'WIP: Implementing new feature',
  { taskId: 'task-123', priority: 'high' }
);
```

##### applyStashIntelligently
```typescript
async applyStashIntelligently(
  stashId: string,
  strategy: StashApplicationStrategy
): Promise<AsyncResult<void>>
```

Applies a stash with intelligent conflict resolution.

**Parameters:**
- `stashId`: Stash identifier
- `strategy`: Application strategy

**Returns:** Application result

##### listStashes
```typescript
async listStashes(options?: {
  category?: StashCategory;
  branch?: string;
  priority?: StashPriority;
  sortBy?: 'date' | 'priority' | 'size';
}): Promise<StashEntry[]>
```

Lists stashes with filtering and sorting capabilities.

##### organizeStashes
```typescript
async organizeStashes(
  options: StashOrganizationOptions
): Promise<AsyncResult<void>>
```

Organizes stashes with cleanup and categorization.

##### cleanupOldStashes
```typescript
async cleanupOldStashes(): Promise<number>
```

Cleans up old and expired stashes, returns number of stashes cleaned.

##### stashToCommit
```typescript
async stashToCommit(
  stashId: string,
  commitMessage: string
): Promise<AsyncResult<string>>
```

Converts a stash to a permanent commit.

## Git Hook Integration

### Supported Hooks

The branch automation system integrates with these Git hooks:

#### post-checkout
Triggered after switching branches:
- Preserves context before switch
- Auto-stashes uncommitted changes  
- Restores context for target branch
- Applies relevant stashes
- Performs cleanup operations

#### pre-merge-commit
Triggered before merge operations:
- Analyzes potential conflicts
- Creates safety backups
- Provides conflict warnings
- Can abort risky merges

#### post-merge
Triggered after successful merges:
- Cleans up merge backups
- Updates context after merge
- Handles stash references

#### pre-rebase
Triggered before rebase operations:
- Saves current state
- Analyzes rebase conflicts
- Provides risk warnings

#### post-rewrite
Triggered after commit rewrites:
- Updates stash references
- Maintains data consistency

#### pre-commit
Triggered before commits:
- Validates merge conflict markers
- Verifies branch naming conventions
- Prevents accidental conflict commits

### Hook Configuration

Each hook can be customized through the configuration file:

```bash
# Hook-specific settings
ENABLE_POST_CHECKOUT=true
ENABLE_PRE_MERGE=true
ENABLE_POST_MERGE=true
ENABLE_PRE_REBASE=true
ENABLE_POST_REWRITE=true
ENABLE_PRE_COMMIT=true
```

### Custom Hook Extensions

You can add custom behavior by creating `.custom` files:

```bash
# Add custom post-checkout behavior
cat > .git/hooks/post-checkout.custom << 'EOF'
#!/bin/bash
# Custom post-checkout actions
echo "Custom action: Branch switched to $2"
# Your custom logic here
EOF
```

### Hook Logs

All hook activity is logged:

```bash
# View hook logs
tail -f .flowforge/logs/branch-automation.log

# Hook log levels
LOG_LEVEL="INFO"    # INFO, WARNING, ERROR
VERBOSE=true        # Detailed logging
```

## Troubleshooting Guide

### Common Issues

#### Installation Issues

**Problem**: Hooks not executing
```bash
# Check hook permissions
ls -la .git/hooks/

# Fix permissions
chmod +x .git/hooks/post-checkout
chmod +x .git/hooks/pre-merge-commit
# ... repeat for all hooks
```

**Problem**: Configuration not found
```bash
# Check configuration file exists
ls -la .flowforge/branch-automation.conf

# Recreate configuration
./scripts/install-branch-automation.sh
```

#### Context Preservation Issues

**Problem**: Context not being saved
```bash
# Check if context preservation is enabled
grep CONTEXT_PRESERVATION_ENABLED .flowforge/branch-automation.conf

# Enable context preservation
sed -i 's/CONTEXT_PRESERVATION_ENABLED=false/CONTEXT_PRESERVATION_ENABLED=true/' \
  .flowforge/branch-automation.conf
```

**Problem**: Context restoration fails
```bash
# Check context files
ls -la .flowforge/contexts/

# Validate context integrity
# (Requires TypeScript environment)
node -e "
const manager = new EnhancedContextManager();
manager.validateEnhancedContext('context-id').then(console.log);
"
```

#### Stash Management Issues

**Problem**: Auto-stash not working
```bash
# Check auto-stash setting
grep AUTO_STASH_ENABLED .flowforge/branch-automation.conf

# Enable auto-stash
sed -i 's/AUTO_STASH_ENABLED=false/AUTO_STASH_ENABLED=true/' \
  .flowforge/branch-automation.conf
```

**Problem**: Stash database corruption
```bash
# Backup and reset stash database
cp .flowforge/stash-db.json .flowforge/stash-db.json.backup
echo '[]' > .flowforge/stash-db.json

# Resync with Git stashes
# (Manual process - re-categorize stashes)
```

#### Conflict Prevention Issues

**Problem**: Conflicts not being detected
```bash
# Check conflict prevention setting
grep CONFLICT_PREVENTION_ENABLED .flowforge/branch-automation.conf

# Test conflict analysis manually
git analyze-conflicts main
```

**Problem**: False positive conflicts
```bash
# Review conflict thresholds in code
# Adjust RISK_THRESHOLDS if needed

# Use conservative strategy
sed -i 's/CONFLICT_AUTO_RESOLVE=true/CONFLICT_AUTO_RESOLVE=false/' \
  .flowforge/branch-automation.conf
```

### Performance Issues

#### Large Repository Performance

**Problem**: Slow context switching
```bash
# Enable performance monitoring
sed -i 's/VERBOSE=false/VERBOSE=true/' .flowforge/branch-automation.conf

# Check logs for performance bottlenecks
grep "slow\|timeout\|performance" .flowforge/logs/branch-automation.log

# Optimize by reducing snapshot frequency
CONTEXT_SAVE_LARGE_FILES=false
```

**Problem**: High memory usage
```bash
# Limit file snapshot size
SNAPSHOT_MAX_FILE_SIZE=1048576  # 1MB limit

# Disable snapshots for binary files
SNAPSHOT_BINARY_FILES=false

# Clean up old data more frequently
AUTO_CLEANUP_ENABLED=true
CLEANUP_FREQUENCY_HOURS=6
```

#### Stash Performance

**Problem**: Too many stashes slowing operations
```bash
# Reduce maximum stashes
STASH_MAX_COUNT=10

# Enable aggressive cleanup
STASH_AGGRESSIVE_CLEANUP=true

# Organize stashes by category
node -e "
const manager = new StashManager();
manager.organizeStashes({
  maxStashes: 10,
  autoCleanup: true,
  groupByCategory: true
});
"
```

### Error Recovery

#### Recovering from Hook Failures

**Problem**: Hook failure prevents Git operations
```bash
# Disable hooks temporarily
mv .git/hooks .git/hooks.backup

# Perform Git operation
git checkout main

# Re-enable hooks
mv .git/hooks.backup .git/hooks
```

#### Recovering from Context Corruption

**Problem**: Context file corrupted
```bash
# Remove corrupted context
rm .flowforge/contexts/corrupted-branch.json

# Clear all contexts (nuclear option)
rm -rf .flowforge/contexts/*

# Rebuild context from current state
git checkout current-branch  # Triggers new context capture
```

#### Recovering from Stash Issues

**Problem**: Stash references broken
```bash
# Reset stash database
rm .flowforge/stash-db.json

# Rebuild from Git stashes
git stash list --format="%gd %s" > .flowforge/stash-rebuild.txt

# Manually re-categorize if needed
```

### Debug Mode

Enable comprehensive debugging:

```bash
# Enable debug mode
cat >> .flowforge/branch-automation.conf << 'EOF'
DEBUG=true
LOG_LEVEL="DEBUG"
VERBOSE=true
TRACE_HOOKS=true
TRACE_GIT_COMMANDS=true
EOF

# View debug logs
tail -f .flowforge/logs/branch-automation.log | grep DEBUG
```

### Getting Help

1. **Check Logs**: Always start with `.flowforge/logs/branch-automation.log`
2. **Configuration Review**: Verify `.flowforge/branch-automation.conf` settings
3. **Git Status**: Check `git status` for uncommitted changes or conflicts
4. **Test Components**: Use individual component test methods
5. **Reinstall**: When all else fails, run the installer again

### Log Analysis

Common log patterns to look for:

```bash
# Successful operations
grep "✅\|SUCCESS" .flowforge/logs/branch-automation.log

# Errors and warnings
grep "❌\|ERROR\|WARNING" .flowforge/logs/branch-automation.log

# Performance issues
grep "slow\|timeout\|memory" .flowforge/logs/branch-automation.log

# Hook execution
grep "Hook:" .flowforge/logs/branch-automation.log
```

## Best Practices

### Configuration Management

#### Environment-Specific Settings

Create different configurations for different environments:

```bash
# Development environment (more automation)
cp .flowforge/branch-automation.conf .flowforge/branch-automation.dev.conf
sed -i 's/AUTO_STASH_ENABLED=false/AUTO_STASH_ENABLED=true/' \
  .flowforge/branch-automation.dev.conf

# Production environment (more conservative)
cp .flowforge/branch-automation.conf .flowforge/branch-automation.prod.conf
sed -i 's/CONFLICT_AUTO_RESOLVE=true/CONFLICT_AUTO_RESOLVE=false/' \
  .flowforge/branch-automation.prod.conf

# Switch configurations
ln -sf branch-automation.dev.conf .flowforge/branch-automation.conf
```

#### Team Configuration

Standardize team settings with a shared configuration template:

```bash
# Create team template
cat > .flowforge/branch-automation.team.conf << 'EOF'
# Team standard configuration
AUTO_STASH_ENABLED=true
CONFLICT_PREVENTION_ENABLED=true
CONTEXT_PRESERVATION_ENABLED=true
BRANCH_USE_ISSUE_NUMBER=true
VERBOSE=false
LOG_LEVEL="WARNING"
EOF

# Team members copy template
cp .flowforge/branch-automation.team.conf .flowforge/branch-automation.conf
```

### Branch Strategy Integration

#### Feature Branch Workflow

Optimize for feature branch development:

```bash
# Enhanced feature branch settings
SMART_BRANCH_NAMING_ENABLED=true
BRANCH_USE_ISSUE_NUMBER=true
BRANCH_SANITIZE_NAMES=true
AUTO_STASH_ENABLED=true
CONTEXT_PRESERVATION_ENABLED=true
```

#### GitFlow Integration

Configure for GitFlow workflows:

```bash
# GitFlow-optimized settings
CONFLICT_PREVENTION_ENABLED=true
CONFLICT_CREATE_BACKUP=true
STASH_AUTO_APPLY=false  # Manual control for releases
AUTO_CLEANUP_ENABLED=false  # Preserve release contexts
```

#### Trunk-Based Development

Settings for trunk-based development:

```bash
# Trunk-based settings
CONFLICT_AUTO_RESOLVE=true
CONFLICT_PREFER_THEIRS=true  # Favor main branch
STASH_MAX_AGE_DAYS=7  # Short-lived features
AUTO_CLEANUP_ENABLED=true
```

### Performance Optimization

#### Repository Size Optimization

For large repositories:

```bash
# Large repo optimizations
SNAPSHOT_MAX_FILE_SIZE=524288  # 512KB limit
CONTEXT_SAVE_LARGE_FILES=false
STASH_INCLUDE_UNTRACKED=false
CONFLICT_ANALYSIS_TIMEOUT=30  # 30 second timeout
```

#### Memory Management

Optimize memory usage:

```bash
# Memory optimization
STASH_MAX_COUNT=15
CONTEXT_RETENTION_DAYS=14
AUTO_CLEANUP_ENABLED=true
CLEANUP_FREQUENCY_HOURS=8
```

#### Network Optimization

For remote repositories:

```bash
# Network optimization
CONFLICT_CACHE_ENABLED=true
REMOTE_FETCH_TIMEOUT=60
PARALLEL_OPERATIONS=false
```

### Security Considerations

#### Sensitive Data Protection

Protect sensitive information:

```bash
# Security settings
STASH_EXCLUDE_PATTERNS="*.key,*.pem,*.env"
CONTEXT_EXCLUDE_PATTERNS="secrets/*,private/*"
BACKUP_EXCLUDE_PATTERNS="*.log,*.tmp"
```

#### Access Control

Limit access to sensitive operations:

```bash
# Access control
REQUIRE_CONFIRMATION_FOR_AUTO_RESOLVE=true
BACKUP_BEFORE_DESTRUCTIVE_OPS=true
LOG_SENSITIVE_OPERATIONS=true
```

### Workflow Patterns

#### Bug Fix Interruption Pattern

Handle urgent bug fixes that interrupt feature work:

```typescript
// 1. Automatic context preservation
git checkout hotfix/urgent-bug
// → Auto-stashes feature work, preserves context

// 2. Work on bug fix
// ... make changes and commit

// 3. Return to feature work
git checkout feature/in-progress
// → Auto-restores stashed changes and context
```

#### Experimental Branch Pattern

For experimental work that may be discarded:

```bash
# Create experimental branch with auto-expiration
STASH_AUTO_EXPIRE_EXPERIMENTAL=true
EXPERIMENTAL_BRANCH_TTL_DAYS=3

git checkout -b experimental/new-idea
# → Stashes automatically expire after 3 days
```

#### Code Review Pattern

Optimize for code review workflows:

```bash
# Code review optimizations
CONFLICT_ANALYSIS_ON_PUSH=true
BACKUP_BEFORE_REBASE=true
CONTEXT_SAVE_ON_PR_CREATION=true
```

### Team Collaboration

#### Shared Context Standards

Establish team standards for context sharing:

```bash
# Team context standards
CONTEXT_INCLUDE_TEAM_METADATA=true
BRANCH_NAMING_ENFORCE_STANDARDS=true
STASH_MESSAGE_TEMPLATES=true
```

#### Conflict Resolution Protocols

Define team conflict resolution approaches:

```bash
# Team conflict protocols
CONFLICT_ESCALATION_THRESHOLD=5  # Files
CONFLICT_NOTIFICATION_ENABLED=true
CONFLICT_TEAM_REVIEW_REQUIRED=true
```

## Performance Considerations

### System Requirements

#### Minimum Requirements
- Git 2.20+
- Node.js 16+ (for TypeScript components)
- Bash 4.0+
- 100MB free disk space for contexts and stashes
- 512MB RAM for normal operations

#### Recommended Requirements
- Git 2.30+
- Node.js 18+
- Bash 5.0+
- 1GB free disk space
- 2GB RAM for large repositories

### Performance Benchmarks

#### Context Operations

| Operation | Small Repo (<1000 files) | Medium Repo (<10k files) | Large Repo (>10k files) |
|-----------|-------------------------|--------------------------|-------------------------|
| Context Capture | <1s | 2-5s | 5-15s |
| Context Restore | <1s | 1-3s | 3-8s |
| Conflict Analysis | <2s | 5-10s | 15-30s |
| Stash Operations | <1s | 1-2s | 2-5s |

#### Memory Usage

| Component | Baseline | Peak Usage | Recommended Limit |
|-----------|----------|------------|-------------------|
| EnhancedContextManager | 50MB | 200MB | 512MB |
| ConflictPrevention | 20MB | 100MB | 256MB |
| StashManager | 10MB | 50MB | 128MB |
| Total System | 80MB | 350MB | 896MB |

#### Storage Usage

| Data Type | Per Branch | Retention | Cleanup Frequency |
|-----------|------------|-----------|-------------------|
| Context Files | 1-5KB | 30 days | Daily |
| File Snapshots | 10KB-1MB | 14 days | Weekly |
| Stash Database | 5-50KB | 30 days | Daily |
| Conflict Backups | 100KB-10MB | 7 days | Daily |

### Optimization Strategies

#### For Large Repositories

```bash
# Large repository optimizations
CONTEXT_SELECTIVE_CAPTURE=true
CONFLICT_INCREMENTAL_ANALYSIS=true
STASH_LAZY_LOADING=true
CLEANUP_AGGRESSIVE_MODE=true

# File size limits
SNAPSHOT_MAX_FILE_SIZE=1048576  # 1MB
STASH_MAX_FILE_COUNT=100
CONTEXT_MAX_FILES=500

# Performance timeouts
OPERATION_TIMEOUT=300  # 5 minutes
ANALYSIS_TIMEOUT=120   # 2 minutes
NETWORK_TIMEOUT=60     # 1 minute
```

#### For Memory-Constrained Environments

```bash
# Memory optimization
MEMORY_CONSERVATIVE_MODE=true
SNAPSHOT_STREAMING=true
BATCH_SIZE_LIMIT=10
GARBAGE_COLLECTION_FREQUENT=true

# Disable memory-intensive features
FILE_SNAPSHOT_ENABLED=false
WORKSPACE_LAYOUT_CAPTURE=false
STASH_METADATA_MINIMAL=true
```

#### For Fast Operations

```bash
# Speed optimization
PARALLEL_PROCESSING=true
CACHE_ENABLED=true
PRELOAD_CONTEXTS=true
ASYNC_OPERATIONS=true

# Reduce analysis depth
CONFLICT_QUICK_ANALYSIS=true
CONTEXT_MINIMAL_METADATA=true
STASH_FAST_CATEGORIZATION=true
```

### Monitoring and Metrics

#### Performance Monitoring

Enable performance tracking:

```bash
# Performance monitoring
PERFORMANCE_MONITORING=true
METRICS_COLLECTION=true
TIMING_DETAILED=true

# View performance metrics
cat .flowforge/logs/performance.log
```

#### Key Metrics to Monitor

- **Context capture time**: Should be <10s for most repositories
- **Conflict analysis time**: Should be <30s for complex scenarios  
- **Memory usage**: Should not exceed system limits
- **Storage growth**: Should be managed by cleanup operations
- **Hook execution time**: Should be <5s to avoid Git delays

#### Performance Alerts

Set up alerts for performance issues:

```bash
# Performance thresholds
ALERT_CONTEXT_CAPTURE_THRESHOLD=15  # seconds
ALERT_MEMORY_USAGE_THRESHOLD=512    # MB  
ALERT_STORAGE_USAGE_THRESHOLD=1024  # MB
ALERT_HOOK_EXECUTION_THRESHOLD=10   # seconds
```

---

**Created by FlowForge Development Team
**Issue #206: Context restoration and branch automation**