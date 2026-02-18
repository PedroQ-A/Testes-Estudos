# FlowForge Bug Management System - Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting information for the FlowForge Bug Management System, covering common issues, error messages, debugging techniques, and recovery procedures.

## Quick Diagnostic Commands

Before diving into specific issues, run these commands to get system status:

```bash
# Check system status
/flowforge:dev:status

# Validate all rules (includes bug management)
/flowforge:dev:checkrules

# Check git repository status
git status

# Verify GitHub CLI
gh auth status

# Check Node.js and dependencies
node --version && npm list --depth=0

# Test time tracking
ls -la scripts/provider-bridge.js scripts/task-time.sh
```

## Common Error Messages and Solutions

### 1. Bug Addition Issues

#### Error: "❌ Bug addition failed on line X"

**Symptoms**:
- Command fails during bug creation
- Partial bug data may be created
- GitHub issue may not be created

**Diagnostic Commands**:
```bash
DEBUG=1 /flowforge:bug:add "test bug"
```

**Common Causes and Solutions**:

**GitHub Token Issues**:
```bash
# Check GitHub authentication
gh auth status

# Re-authenticate if needed
gh auth login

# Test GitHub API access
gh issue list --limit 1
```

**Missing Dependencies**:
```bash
# Check for required utilities
command -v jq || echo "jq not installed"
command -v git || echo "git not installed"
command -v node || echo "node not installed"

# Install missing dependencies (Ubuntu/Debian)
sudo apt install jq git nodejs npm

# Install missing dependencies (macOS)
brew install jq git node
```

**File Permission Issues**:
```bash
# Check .flowforge directory permissions
ls -la .flowforge/
mkdir -p .flowforge/
chmod 755 .flowforge/

# Check if we can write to backlog
touch .flowforge/bug-backlog.json
chmod 644 .flowforge/bug-backlog.json
```

#### Error: "⚠️ jq not available - cannot load JSON backlog"

**Solution**:
```bash
# Install jq
# Ubuntu/Debian
sudo apt install jq

# macOS
brew install jq

# CentOS/RHEL
sudo yum install jq

# Verify installation
jq --version
```

**Workaround**: The system falls back to text format, but functionality is limited.

#### Error: "❌ Not in a git repository!"

**Solution**:
```bash
# Initialize git repository if needed
git init
git remote add origin <your-repo-url>

# Or navigate to correct directory
cd /path/to/your/project
pwd  # Verify you're in the right place
```

### 2. Bug Listing Issues

#### Error: "❌ Bug listing failed on line X"

**Diagnostic Commands**:
```bash
DEBUG=1 /flowforge:bug:list
```

**Common Causes and Solutions**:

**Corrupted Bug Backlog**:
```bash
# Backup existing backlog
cp .flowforge/bug-backlog.json .flowforge/bug-backlog.json.backup

# Validate JSON syntax
jq . .flowforge/bug-backlog.json

# If invalid, recreate with empty structure
echo '{"bugs": []}' > .flowforge/bug-backlog.json
```

**Large Dataset Performance**:
```bash
# Check file size
ls -lh .flowforge/bug-backlog.json

# Use pagination for large datasets
/flowforge:bug:list --limit=10

# Filter to reduce data
/flowforge:bug:list --status=open --priority=high
```

**GitHub API Rate Limiting**:
```bash
# Check rate limit status
gh api rate_limit

# Wait for rate limit reset or use local data only
/flowforge:bug:list --format=json | jq '.bugs'
```

#### Error: "📭 No bugs match your criteria"

**Diagnostic Steps**:
```bash
# Check if any bugs exist
/flowforge:bug:list --status=""

# Check specific filters
/flowforge:bug:list all

# Verify backlog content
cat .flowforge/bug-backlog.json | jq '.bugs | length'
```

### 3. Sidetracking Issues

#### Error: "❌ Bug sidetracking failed on line X"

**Diagnostic Commands**:
```bash
DEBUG=1 /flowforge:bug:nobugbehind 123
```

**Common Causes and Solutions**:

**Sidetracking Engine Not Available**:
```bash
# Check for sidetracking engine
ls -la dist/src/sidetracking/core/index.js
ls -la src/sidetracking/core/index.ts

# Build if necessary
npm run build

# Or use basic mode
export SIDETRACK_ENGINE=basic
/flowforge:bug:nobugbehind 123
```

**Uncommitted Changes Blocking Switch**:
```bash
# Check current status
git status

# Options:
# 1. Commit changes
git add .
git commit -m "WIP: Save before bug fix"

# 2. Stash manually
git stash save "Manual stash before bug fix"

# 3. Force sidetracking (may lose changes)
# This is handled automatically by the system
```

**Branch Creation Failures**:
```bash
# Check git repository status
git status
git branch -a

# Ensure we have push permissions
git push --dry-run

# Check if branch already exists
git branch | grep "hotfix\|bugfix"

# Clean up if needed
git branch -D hotfix/123-work
```

#### Error: "⚠️ Could not create GitHub issue - continuing anyway"

**Investigation Steps**:
```bash
# Check GitHub authentication
gh auth status

# Test issue creation manually
gh issue create --title "Test Issue" --body "Test" --label bug

# Check repository permissions
gh api repos/:owner/:repo | jq '.permissions'

# Verify we're in the right repository
git remote -v
```

**Resolution**:
- The system continues without GitHub integration
- Issue can be created manually later
- Local bug tracking still functions

### 4. Context Restoration Issues

#### Error: "❌ No bug sidetrack state found!"

**Symptoms**:
- Cannot return from bug sidetracking
- Lost context information
- Stuck on bug branch

**Diagnostic Commands**:
```bash
# Check for sidetrack state files
ls -la .flowforge/.bug-sidetrack-state
ls -la .flowforge/.sidetrack-context
ls -la .flowforge/.bug-session

# Check git branch
git branch --show-current

# Look for context directories
ls -la .flowforge/context/
```

**Recovery Procedures**:

**Manual Context Restoration**:
```bash
# If you know the original branch
git checkout feature/123-original-work

# Apply stashed changes if they exist
git stash list | grep "Auto-stash before bug sidetrack"
git stash pop stash@{0}  # Adjust index as needed

# Restart time tracking manually
/flowforge:session:start 123
```

**Force Cleanup**:
```bash
# Clean up bug branch if safe
git branch -D hotfix/456-work
git branch -D bugfix/456-work

# Remove partial state files
rm -f .flowforge/.bug-sidetrack-state
rm -f .flowforge/.sidetrack-context
rm -f .flowforge/.bug-session

# Restart clean session
/flowforge:session:start [original-task-id]
```

#### Error: "❌ Context restoration failed"

**Diagnostic Commands**:
```bash
DEBUG=1 /flowforge:bug:popcontext

# Check sidetracking engine status
ls -la dist/src/sidetracking/core/
node -e "console.log(require('./dist/src/sidetracking/core/index.js'))"
```

**Solutions**:

**Sidetracking Engine Issues**:
```bash
# Rebuild engine
npm run build

# Use basic restoration
/flowforge:bug:popcontext --force

# Manual restoration process (see recovery procedures above)
```

**Stash Application Conflicts**:
```bash
# Check stash list
git stash list

# Apply stash manually with conflict resolution
git stash pop
# Resolve conflicts
git add .
git commit -m "Resolved stash conflicts"
```

## GitHub Integration Troubleshooting

### Authentication Issues

#### Error: "gh: command not found"

**Solution**:
```bash
# Install GitHub CLI
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo gpg --dearmor -o /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows (via Chocolatey)
choco install gh
```

#### Error: "gh: To get started with GitHub CLI, please run: gh auth login"

**Solution**:
```bash
# Authenticate with GitHub
gh auth login

# Choose authentication method
# - GitHub.com
# - HTTPS or SSH
# - Login via web browser or token

# Verify authentication
gh auth status
```

#### Error: "API rate limit exceeded"

**Diagnostic Commands**:
```bash
# Check rate limit status
gh api rate_limit

# Check current usage
gh api rate_limit | jq '.rate.remaining'
```

**Solutions**:
- Wait for rate limit reset (shown in response)
- Use authentication token for higher limits
- Implement caching to reduce API calls
- Use local-only mode temporarily

### Issue Management Issues

#### Error: "Could not create issue: Not Found"

**Causes and Solutions**:

**Wrong Repository**:
```bash
# Check current repository
gh repo view

# Set correct repository
gh repo set-default owner/repository-name

# Or specify explicitly
gh issue create --repo owner/repository-name --title "Bug"
```

**Missing Permissions**:
```bash
# Check permissions
gh api repos/:owner/:repo | jq '.permissions'

# Required permissions: issues: write
# Contact repository admin if needed
```

#### Error: "Issue labels not found"

**Investigation**:
```bash
# List available labels
gh label list

# Check if our required labels exist
gh label list | grep -E "bug|critical|high|medium|low"
```

**Solution**:
```bash
# Create missing labels
gh label create bug --color "d73a4a" --description "Something isn't working"
gh label create critical --color "b60205" --description "Critical priority"
gh label create high --color "ff9f43" --description "High priority"
gh label create medium --color "0366d6" --description "Medium priority"
gh label create low --color "28a745" --description "Low priority"
```

## Time Tracking Issues

### Provider Bridge Issues

#### Error: "⚠️ Time tracking not available"

**Diagnostic Commands**:
```bash
# Check provider bridge existence
ls -la scripts/provider-bridge.js

# Test Node.js execution
node scripts/provider-bridge.js --help

# Check task-time script
ls -la scripts/task-time.sh
chmod +x scripts/task-time.sh
```

**Solutions**:

**Missing Provider Bridge**:
```bash
# Check if file exists but not executable
chmod +x scripts/provider-bridge.js

# Verify Node.js installation
node --version
npm --version

# Install dependencies if needed
npm install
```

**Task Time Script Issues**:
```bash
# Make script executable
chmod +x scripts/task-time.sh

# Test script
./scripts/task-time.sh status

# Check shell compatibility
bash scripts/task-time.sh status
```

### Time Tracking Data Issues

#### Error: "Could not load time tracking data"

**Investigation**:
```bash
# Check time tracking directories
ls -la .flowforge/time/
ls -la .task-time/

# Check file permissions
ls -la .flowforge/time/*.json
```

**Recovery**:
```bash
# Recreate time tracking structure
mkdir -p .flowforge/time
chmod 755 .flowforge/time

# Initialize empty time data if needed
echo '{"sessions": []}' > .flowforge/time/sessions.json
```

## Performance Issues

### Slow Command Execution

#### Commands Taking Too Long

**Performance Targets**:
- `bug:add`: <200ms
- `bug:list`: <300ms  
- `bug:nobugbehind`: <370ms
- `bug:popcontext`: <250ms

**Diagnostic Commands**:
```bash
# Enable timing information
time /flowforge:bug:add "test bug"
time /flowforge:bug:list

# Profile with debug mode
DEBUG=1 time /flowforge:bug:nobugbehind 123
```

**Common Causes and Solutions**:

**Large Bug Backlog**:
```bash
# Check backlog size
ls -lh .flowforge/bug-backlog.json
wc -l .flowforge/bug-backlog.json

# Archive old bugs
cp .flowforge/bug-backlog.json .flowforge/bug-backlog-$(date +%Y%m%d).json

# Filter active bugs only
jq '.bugs |= map(select(.status == "open"))' .flowforge/bug-backlog.json > temp.json
mv temp.json .flowforge/bug-backlog.json
```

**Network Latency**:
```bash
# Test GitHub connectivity
time gh api user

# Use local-only mode if needed
/flowforge:bug:list --format=json  # Avoid GitHub sync
```

**System Resource Issues**:
```bash
# Check system resources
free -m  # Memory usage
df -h    # Disk usage
top      # CPU usage

# Clean up temporary files
rm -rf .flowforge/context/*/
rm -f /tmp/flowforge_*
```

### Context Switch Performance

#### Sidetracking Too Slow

**Optimization Strategies**:

**Reduce Context Size**:
```bash
# Check context directory sizes
du -sh .flowforge/context/*/

# Clean up old contexts
find .flowforge/context/ -type d -mtime +7 -exec rm -rf {} \;

# Limit context depth
export MAX_CONTEXT_DEPTH=5
```

**Optimize Git Operations**:
```bash
# Clean up git repository
git gc --aggressive --prune=now

# Remove large files from history if needed
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch large-file.txt' --prune-empty --tag-name-filter cat -- --all
```

## File System Issues

### Permission Problems

#### Error: "Permission denied"

**Common Scenarios**:

**Directory Permission Issues**:
```bash
# Fix .flowforge directory permissions
sudo chown -R $USER:$USER .flowforge/
chmod -R 755 .flowforge/

# Ensure parent directory is writable
ls -la . | grep flowforge
```

**Script Execution Issues**:
```bash
# Make scripts executable
find commands/flowforge/bug/ -name "*.sh" -exec chmod +x {} \;
chmod +x scripts/*.sh
```

**File Lock Issues**:
```bash
# Check for lock files
ls -la .flowforge/.lock*

# Remove stale locks (be careful!)
rm -f .flowforge/.lock*
```

### Disk Space Issues

#### Error: "No space left on device"

**Investigation**:
```bash
# Check disk usage
df -h
du -sh .flowforge/

# Check for large context files
find .flowforge/ -type f -size +10M -exec ls -lh {} \;
```

**Cleanup Procedures**:
```bash
# Clean up old contexts
find .flowforge/context/ -mtime +7 -delete

# Archive old time tracking data
tar czf time-backup-$(date +%Y%m%d).tar.gz .flowforge/time/
rm -rf .flowforge/time/old/

# Remove temporary files
rm -f /tmp/flowforge_*
rm -f /tmp/ff_*
```

## Data Recovery Procedures

### Bug Data Recovery

#### Lost Bug Backlog

**Recovery Steps**:
```bash
# Check for backups
ls -la .flowforge/bug-backlog*.json
ls -la .git/refs/heads/ | grep backup

# Recover from GitHub if available
gh issue list --state all --limit 100 --json number,title,state,labels > recovered-bugs.json

# Reconstruct backlog from git history
git log --grep="Bug" --oneline | head -20
```

#### Corrupted JSON Files

**Recovery Procedure**:
```bash
# Backup corrupted file
mv .flowforge/bug-backlog.json .flowforge/bug-backlog.json.corrupted

# Try to recover valid JSON
jq -e . .flowforge/bug-backlog.json.corrupted || echo "JSON is invalid"

# Extract valid entries manually
grep -E '"id"|"title"|"priority"' .flowforge/bug-backlog.json.corrupted

# Recreate minimal structure
echo '{"bugs": [], "metadata": {"version": "2.0.0", "lastUpdated": "'$(date -Iseconds)'", "totalBugs": 0}}' > .flowforge/bug-backlog.json
```

### Context Recovery

#### Lost Context Files

**Manual Context Reconstruction**:
```bash
# Check for context backups
ls -la .flowforge/context/*/

# Look for stash references
git stash list

# Check for session backups
ls -la .flowforge/sessions/

# Reconstruct context manually
cat > .flowforge/.bug-sidetrack-state << EOF
bug_id=UNKNOWN
priority=medium
type=bugfix
branch=bugfix/UNKNOWN-work
context_id=manual-recovery
parent_task=UNKNOWN
parent_branch=main
start_time=$(date -Iseconds)
EOF
```

### Git State Recovery

#### Detached HEAD or Lost Branches

**Recovery Steps**:
```bash
# Check current state
git status
git log --oneline -10

# Find lost commits
git reflog

# Recover specific commit
git checkout <commit-hash>
git branch recovery-branch

# Find lost branches
git branch -a
git for-each-ref --format='%(refname:short) %(committerdate)' refs/heads | sort -k2

# Recover from remote if available
git fetch --all
git branch -r
```

## Debug Mode Usage

### Enabling Debug Output

**Environment Variable**:
```bash
# Enable debug mode for single command
DEBUG=1 /flowforge:bug:add "test bug"

# Enable for session
export DEBUG=1
/flowforge:bug:nobugbehind 123
unset DEBUG
```

### Debug Output Analysis

**Key Debug Information**:
- Command argument parsing
- Context detection results
- File system operations
- Network requests and responses
- Performance timing data
- Error stack traces

**Debug Output Example**:
```bash
$ DEBUG=1 /flowforge:bug:add "test bug"
+ set -x
+ [[ 0 == \1 ]]
+ echo '🐛 Smart Bug Addition - Context-Aware Registration'
+ BUG_DIR=commands/flowforge/bug
+ source commands/flowforge/bug/add-github-utils.sh
++ echo 'Loaded GitHub utilities'
+ TITLE='test bug'
+ echo '🔍 Auto-detecting current context...'
+ git branch --show-current
+ CURRENT_BRANCH=feature/123-test
...
```

## System Integration Issues

### VS Code Integration

#### Context Restoration in VS Code

**Issues**:
- Files not reopening correctly
- Cursor positions lost
- Extension state not preserved

**Solutions**:
```bash
# Check VS Code settings
ls -la .vscode/settings.json

# Ensure workspace restoration is enabled
echo '{
  "workbench.startupEditor": "none",
  "files.restoreUndoStack": true,
  "workbench.editor.restoreViewState": true
}' > .vscode/settings.json

# Manual file reopening if needed
code src/file1.js src/file2.js
```

### Terminal Integration

#### Environment Variable Issues

**Problems**:
- Lost environment variables after context switch
- PATH modifications not preserved
- Terminal history cleared

**Recovery**:
```bash
# Check for environment backup
ls -la .flowforge/context/*/env

# Restore environment manually
source .flowforge/context/latest/env

# Add to shell configuration for persistence
echo 'export FLOWFORGE_PROJECT=/path/to/project' >> ~/.bashrc
```

## Prevention Strategies

### Regular Maintenance

**Daily Tasks**:
```bash
# Clean up old contexts (automated)
find .flowforge/context/ -mtime +7 -delete

# Backup critical data
cp .flowforge/bug-backlog.json .flowforge/backups/bug-backlog-$(date +%Y%m%d).json

# Check system health
/flowforge:dev:status
```

**Weekly Tasks**:
```bash
# Archive resolved bugs
jq '.bugs |= map(select(.status != "closed" or (.created | fromlocaltime) > (now - 604800)))' .flowforge/bug-backlog.json > temp.json
mv temp.json .flowforge/bug-backlog.json

# Update documentation
git add documentation/ && git commit -m "Update bug management docs"

# Performance review
grep "duration" .flowforge/logs/*.log | sort -k3 -n | tail -10
```

### Monitoring Setup

**Health Check Script**:
```bash
#!/bin/bash
# health-check.sh

echo "🔍 FlowForge Bug Management Health Check"
echo "========================================"

# Check dependencies
command -v jq >/dev/null || echo "❌ jq not available"
command -v gh >/dev/null || echo "❌ GitHub CLI not available"
command -v git >/dev/null || echo "❌ git not available"
command -v node >/dev/null || echo "❌ Node.js not available"

# Check file permissions
test -w .flowforge/ || echo "❌ .flowforge not writable"
test -f .flowforge/bug-backlog.json || echo "⚠️  Bug backlog not found"

# Check git status
git status --porcelain >/dev/null || echo "❌ Git repository issues"

# Check GitHub auth
gh auth status >/dev/null 2>&1 || echo "⚠️  GitHub auth issues"

# Performance check
start_time=$(date +%s%N)
/flowforge:bug:list >/dev/null 2>&1
end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 ))
echo "📊 List command performance: ${duration}ms"

echo "✅ Health check complete"
```

**Automated Monitoring**:
```bash
# Add to crontab for regular checks
crontab -e

# Add line:
0 9 * * * cd /path/to/project && ./health-check.sh | mail -s "FlowForge Health" admin@company.com
```

## FAQs

### Q: Can I use the bug management system without GitHub?

**A**: Yes, the system works without GitHub integration. Features still available:
- Local bug tracking in `.flowforge/bug-backlog.json`
- Sidetracking and context switching
- Time tracking and reporting
- All list and export functions

GitHub-specific features not available:
- Automatic issue creation
- Remote issue synchronization
- GitHub labels and milestones

### Q: What happens if sidetracking fails mid-operation?

**A**: The system includes comprehensive error handling:
- Partial context is automatically cleaned up
- Original branch is restored if possible
- Stashed changes are preserved
- Error messages provide recovery instructions
- Manual recovery procedures are available

### Q: Can I have multiple nested bug fixes?

**A**: Yes, the system supports nested bug fixes up to 10 levels deep (configurable):
- Each level maintains separate context
- Stack-based session management
- Proper cleanup when returning through levels
- Performance optimizations for deep nesting

### Q: How do I migrate from another bug tracking system?

**A**: Migration strategies:
1. Export data from existing system
2. Convert to FlowForge JSON format
3. Import using provider bridge
4. Validate data integrity
5. Test workflows with sample data

Contact support for migration assistance.

### Q: What's the performance impact on my development workflow?

**A**: Minimal impact with optimization benefits:
- Context switches average <250ms
- Background operations don't block development
- Separate time tracking increases billing accuracy
- Automated workflows reduce manual overhead
- Rule #37 prevents productivity loss from forgotten bugs

### Q: How do I handle conflicts during context restoration?

**A**: Conflict resolution strategies:
1. Automatic stash application with conflict detection
2. Manual conflict resolution guidance
3. Backup creation before risky operations
4. Force options for emergency situations
5. Recovery procedures for failed restorations

This troubleshooting guide should help resolve most issues with the FlowForge Bug Management System. For issues not covered here, enable debug mode and check the logs for detailed information.