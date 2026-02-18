# Bug Management Workflow Guide

## Table of Contents
- [Quick Start](#quick-start)
- [Complete Workflow Examples](#complete-workflow-examples)
- [Best Practices](#best-practices)
- [Team Collaboration](#team-collaboration)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 5-Minute Setup
```bash
# 1. Ensure GitHub CLI is authenticated
gh auth login

# 2. Test the system with a sample bug
/flowforge:bug:add "Test bug for workflow validation" low

# 3. View the bug
/flowforge:bug:list

# 4. Practice sidetracking (safe test)
/flowforge:bug:nobugbehind [bug-id] --dry-run

# 5. Clean up
gh issue close [bug-id]
```

### Essential Commands
```bash
# Add bug: /flowforge:bug:add [title] [priority]
# Fix now: /flowforge:bug:nobugbehind [id]
# List all: /flowforge:bug:list
# Return:   /flowforge:bug:popcontext
```

## Complete Workflow Examples

### Scenario 1: Bug Discovered During Development

#### Situation
You're working on feature #142 when you notice the login button isn't working properly.

#### Workflow
```bash
# Current context: feature/142-user-dashboard
# You notice the login bug while testing

# Step 1: Capture the bug immediately
/flowforge:bug:add "Login button not responding to clicks"
# System detects:
# - Priority: medium (based on "not responding" keywords)
# - Context: feature/142, modified files: src/Login.tsx
# - Tags: frontend, javascript (from file analysis)
# - Creates GitHub issue #156

# Step 2: Continue your current work or fix immediately
# Option A: Continue current work, fix later
echo "Bug captured, continuing with feature development"

# Option B: Fix immediately
/flowforge:bug:nobugbehind 156
# System:
# - Saves context of feature/142 work
# - Creates bugfix/156-work branch
# - Starts separate time tracking
# - Opens issue #156 for reference

# Step 3: Fix the bug (after investigation and testing)
git add . && git commit -m "Fix login button click handler

- Added missing onClick event handler
- Fixed event propagation issue
- Updated tests for click behavior

Fixes #156"

# Step 4: Return to your feature work
/flowforge:bug:popcontext
# System:
# - Stops bug time tracking
# - Restores feature/142 branch
# - Restores uncommitted changes
# - Resumes feature time tracking
# - Updates documentation
```

### Scenario 2: Critical Production Bug

#### Situation
Production alert: "Database connection timeout affecting all users"

#### Emergency Workflow
```bash
# Step 1: Immediate bug registration with sidetracking
/flowforge:bug:add "Database connection timeout in production" critical --immediate
# System automatically:
# - Detects critical priority from "production" keyword
# - Saves current work context
# - Creates hotfix/157-work branch from main
# - Starts critical bug time tracking
# - Creates GitHub issue with high visibility

# Step 2: Investigate and fix (you're now in bug context)
# Check database connections
# Review logs
# Implement fix
git add . && git commit -m "Fix database connection pool exhaustion

- Increased max connections from 50 to 200
- Added connection pooling timeout
- Improved error handling and retry logic
- Added monitoring for connection health

Critical fix for production issue #157"

# Step 3: Deploy hotfix (follow your deployment process)
git push origin hotfix/157-work
# Create deployment PR, deploy to production, etc.

# Step 4: Return to previous work
/flowforge:bug:popcontext
# Back to your original task with all context restored
```

### Scenario 3: Bug Triage and Management

#### Situation
Weekly bug review meeting - need to assess current bug backlog

#### Management Workflow
```bash
# Step 1: Generate current bug status
/flowforge:bug:list --format=table
# Shows color-coded priority view

# Step 2: Export for stakeholder meeting
/flowforge:bug:list --format=markdown --export=weekly-bug-report.md --template=summary

# Step 3: Focus on critical issues
/flowforge:bug:list critical
# Identify bugs needing immediate attention

# Step 4: Assign bugs to team members
gh issue edit 158 --assignee="developer1"
gh issue edit 159 --assignee="developer2"

# Step 5: Track progress over time
/flowforge:bug:list --since="1 week ago" --format=csv --export=weekly-progress.csv

# Step 6: Plan sprint work
/flowforge:bug:list --priority=high,medium --assignee=me --format=json > my-sprint-bugs.json
```

### Scenario 4: Collaborative Bug Resolution

#### Situation
Working on a complex bug that requires multiple team members

#### Collaboration Workflow
```bash
# Developer 1: Discovers and documents the bug
/flowforge:bug:add "User data corruption in profile updates" high \
  --description="Users report profile data being corrupted when updating multiple fields simultaneously" \
  --tags="backend,database,data-integrity" \
  --assignee="team-lead"

# Team Lead: Reviews and adds more context
gh issue edit 160 --body "$(gh issue view 160 --json body -q .body)

## Investigation Plan
- [ ] Reproduce the issue in staging
- [ ] Identify database race conditions  
- [ ] Check transaction boundaries
- [ ] Review concurrent update handling

## Team Assignment
- @developer1: Investigation and reproduction
- @developer2: Database analysis
- @developer3: Test case development"

# Developer 1: Starts investigation
/flowforge:bug:nobugbehind 160 high
# Investigates, adds findings as comments
gh issue comment 160 --body "Found race condition in ProfileService.updateMultipleFields()"

# Developer 2: Joins investigation (different approach)
# Adds analysis without sidetracking (maintaining current work)
gh issue comment 160 --body "Database logs show deadlock patterns in user_profiles table during concurrent updates"

# Developer 1: Implements fix
git add . && git commit -m "Fix race condition in profile updates

- Added proper transaction locking
- Implemented optimistic locking with version field
- Added retry mechanism for deadlock handling
- Enhanced error reporting

Collaborative fix with @developer2 analysis
Fixes #160"

# Developer 1: Returns to original work
/flowforge:bug:popcontext

# Team: Reviews and validates fix
gh issue view 160  # Check comments and resolution
```

## Best Practices

### Bug Documentation Standards

#### Effective Bug Titles
```bash
# Good examples
/flowforge:bug:add "User authentication fails with special characters in password"
/flowforge:bug:add "Dashboard performance degrades with >1000 items"
/flowforge:bug:add "API returns 500 error for invalid date format"

# Avoid vague titles
# "Something is broken"
# "Fix this"
# "Error in system"
```

#### Rich Bug Descriptions
```bash
# Use --description for detailed information
/flowforge:bug:add "File upload fails for large files" medium \
  --description="Files larger than 50MB fail to upload with timeout error. 
  
## Steps to Reproduce
1. Navigate to file upload page
2. Select file larger than 50MB
3. Click upload button
4. Wait for timeout after 30 seconds
  
## Expected Behavior
Files up to 100MB should upload successfully
  
## Actual Behavior  
Upload fails with generic timeout error
  
## Environment
- Browser: Chrome 120
- File types tested: PDF, MP4, ZIP
- Network: Corporate (stable connection)"
```

### Context Preservation Best Practices

#### Before Starting Bug Work
```bash
# Always check your current state
git status
git branch

# Ensure you're in a good state for context switching
# Commit or stash significant work
git add . && git commit -m "WIP: Feature progress checkpoint"

# Then proceed with bug sidetracking
/flowforge:bug:nobugbehind 123
```

#### During Bug Work
```bash
# Make frequent, meaningful commits
git commit -m "Investigate user authentication issue

- Added debug logging to auth service
- Identified token validation problem
- Need to check expiration logic next

Progress on #123"

# Document findings in the issue
gh issue comment 123 --body "Investigation update: Token expiration logic has edge case for timezone handling"
```

#### After Bug Resolution
```bash
# Always test your fix thoroughly
npm test
npm run e2e:auth

# Write clear resolution commits
git commit -m "Fix authentication token timezone handling

- Normalize all timestamps to UTC before validation
- Add timezone test cases
- Update documentation for token format

Fixes #123
Tested with multiple timezone scenarios"

# Return to previous work cleanly
/flowforge:bug:popcontext
```

### Priority Management

#### Priority Guidelines
```bash
# Critical: Production down, data loss, security breach
/flowforge:bug:add "Production database corrupted" critical --immediate

# High: Major feature broken, performance severely impacted
/flowforge:bug:add "User login completely broken" high

# Medium: Feature partially broken, workaround exists  
/flowforge:bug:add "Profile image upload sometimes fails" medium

# Low: Cosmetic issues, minor enhancements
/flowforge:bug:add "Button alignment slightly off in mobile view" low
```

#### Priority Escalation
```bash
# Monitor for priority changes
/flowforge:bug:list --priority=medium --assignee=me

# Escalate when needed
gh issue edit 124 --add-label "critical" --remove-label "medium"

# Re-prioritize in system
/flowforge:bug:add "Updated priority based on user impact" critical \
  --description="Escalating bug #124 based on increased user reports"
```

## Team Collaboration

### Bug Assignment Strategies

#### Self-Assignment
```bash
# Find bugs in your expertise area
/flowforge:bug:list --tags="frontend" --status=open

# Assign to yourself
gh issue edit 125 --assignee=@me

# Start work immediately
/flowforge:bug:nobugbehind 125
```

#### Team Load Balancing
```bash
# Check team workload
/flowforge:bug:list --assignee="developer1" --status=open
/flowforge:bug:list --assignee="developer2" --status=open

# Reassign if needed
gh issue edit 126 --assignee="developer3"
```

### Communication Patterns

#### Status Updates
```bash
# Regular progress updates
gh issue comment 127 --body "Progress update:
- ✅ Reproduced the issue in staging
- ✅ Identified root cause in payment service  
- 🔄 Currently implementing fix
- ⏱️ ETA: End of day"

# Blocked status
gh issue comment 128 --body "⚠️ BLOCKED: Need database access to investigate further. 
@database-team can you provide read access to production logs?"
```

#### Knowledge Sharing
```bash
# Share investigation findings
gh issue comment 129 --body "💡 Investigation findings for future reference:

## Root Cause
The issue occurs when concurrent requests modify the same user session data.

## Technical Details
- Race condition in SessionManager.update()
- No locking mechanism on session storage  
- Redis transaction not atomic

## Similar Issues
This pattern might affect other areas that modify shared state:
- Cart updates (#130)
- Notification preferences (#131)

## Recommended Fix Pattern
Use Redis WATCH/MULTI/EXEC for atomic operations"
```

### Code Review Integration

#### Bug Fix Reviews
```bash
# After implementing fix, create PR
git push origin bugfix/132-work
gh pr create --title "Fix session race condition (#132)" \
  --body "Resolves #132

## Changes
- Added Redis transaction locks
- Implemented retry mechanism  
- Added comprehensive tests

## Testing
- [x] Unit tests pass
- [x] Integration tests pass
- [x] Manual testing in staging
- [x] Performance impact assessed

## Deployment Notes
- No database migration required
- Redis version 6+ required for WATCH command
- Monitor session update performance after deployment"

# Link to bug for traceability
gh issue comment 132 --body "Fix implemented in PR #456"
```

## Performance Optimization

### Efficient Bug Queries

#### Optimized Filtering
```bash
# Use specific filters to reduce data transfer
/flowforge:bug:list --assignee=me --priority=critical,high --limit=20

# Cache frequently used queries
alias my-bugs='/flowforge:bug:list --assignee=me --status=open'
alias critical-bugs='/flowforge:bug:list critical --format=table'
```

#### Batch Operations
```bash
# Export multiple reports efficiently
/flowforge:bug:list --format=csv --export=all-bugs.csv
/flowforge:bug:list --priority=critical --format=json --export=critical-bugs.json
/flowforge:bug:list --since="1 month ago" --format=markdown --export=monthly-report.md
```

### Context Switch Optimization

#### Minimize Context Loss
```bash
# Pre-commit work before bug sidetracking
git add . && git commit -m "WIP: Save progress before bug fix"

# Use targeted sidetracking
/flowforge:bug:nobugbehind 133 high  # Explicit priority avoids detection delay

# Quick fixes in current context (for minor bugs)
# Sometimes faster than full sidetracking for 1-line fixes
```

#### Batch Bug Processing
```bash
# Group related bugs
/flowforge:bug:list --tags="authentication" --assignee=me

# Fix multiple related bugs in single session
/flowforge:bug:nobugbehind 134  # Auth bug 1
# Fix, commit
/flowforge:bug:nobugbehind 135  # Related auth bug 2  
# Fix, commit
/flowforge:bug:popcontext      # Return after batch
```

## Troubleshooting

### Common Issues and Solutions

#### Context Restoration Problems
```bash
# Issue: "No bug sidetrack state found"
# Solution: Check if you're actually in a sidetrack session
ls -la .flowforge/.bug-sidetrack-state
# If missing, you're not in a sidetrack. Use /flowforge:bug:nobugbehind first

# Issue: "Uncommitted changes prevent restoration"  
# Solution: Commit or force restoration
git status
git add . && git commit -m "Bug fix progress"
# OR
/flowforge:bug:popcontext --force

# Issue: Context restoration fails
# Solution: Use dry-run to diagnose, then force with cleanup
/flowforge:bug:popcontext --dry-run
/flowforge:bug:popcontext --force --keep-branch
```

#### GitHub Integration Issues
```bash
# Issue: "GitHub CLI not authenticated"
# Solution: Re-authenticate
gh auth login
gh auth status

# Issue: "Could not create GitHub issue"
# Solution: Check repository permissions and rate limits
gh repo view  # Verify you have write access
gh api rate_limit  # Check API limits

# Issue: Labels not applied correctly
# Solution: Verify labels exist in repository
gh label list
# Create missing labels if needed
gh label create "critical" --color="d73a49" --description="Critical priority bug"
```

#### Time Tracking Issues
```bash
# Issue: Time tracking not starting
# Solution: Check provider bridge setup
ls -la scripts/provider-bridge.js
# Fallback to manual tracking if needed

# Issue: Time not stopped properly
# Solution: Manual cleanup
scripts/task-time.sh stop [bug-id]
rm -f .flowforge/.bug-session
```

#### Performance Issues
```bash
# Issue: Bug listing is slow
# Solution: Use more specific filters and limits
/flowforge:bug:list --limit=20 --priority=high --assignee=me

# Issue: Context switching takes too long
# Solution: Check sidetracking engine status
ls -la dist/src/sidetracking/core/index.js
# Rebuild if necessary
npm run build

# Issue: GitHub API rate limiting
# Solution: Cache results and reduce API calls
# Use local backlog more, sync periodically
/flowforge:bug:list --format=json > cached-bugs.json
```

### Debug Mode Usage

#### Enable Debug Logging
```bash
# For any command, prepend with DEBUG=1
DEBUG=1 /flowforge:bug:add "Debug this issue"
DEBUG=1 /flowforge:bug:nobugbehind 123
DEBUG=1 /flowforge:bug:popcontext
```

#### Debug Output Analysis
```bash
# Debug output shows:
# - Command argument parsing
# - Context detection results
# - GitHub API interactions
# - Sidetracking engine operations
# - Time tracking integration
# - File operations and cleanup

# Use to diagnose:
# - Why priority detection failed
# - Why context switching failed
# - Why GitHub integration failed
# - Performance bottlenecks
```

### Recovery Procedures

#### Manual Context Recovery
```bash
# If automatic recovery fails, manual steps:
# 1. Check current state
git status
git branch

# 2. Find context backup
ls -la .flowforge/context/
# OR check sidetracking state
cat .flowforge/.bug-sidetrack-state

# 3. Restore manually
git checkout [original-branch]
git stash pop  # If stash exists

# 4. Clean up
rm -f .flowforge/.bug-sidetrack-state
rm -f .flowforge/.bug-session
```

#### Emergency Bug Fix Without Sidetracking
```bash
# When sidetracking system is unavailable
# 1. Manual context save
git add . && git stash push -m "Manual save before bug fix"
ORIGINAL_BRANCH=$(git branch --show-current)

# 2. Create bug branch manually
git checkout -b hotfix/emergency-fix

# 3. Fix bug and commit
# ... make changes ...
git add . && git commit -m "Emergency fix for critical issue"

# 4. Return to original work
git checkout "$ORIGINAL_BRANCH"
git stash pop

# 5. Track the work manually
# Create GitHub issue post-facto
# Update time tracking records
```

### Best Practices for Reliability

#### Pre-Session Checks
```bash
# Before starting any bug work
git status --porcelain | wc -l  # Check for uncommitted changes
git branch --show-current        # Confirm current branch
df -h                           # Check disk space
gh auth status                  # Verify GitHub access
```

#### Regular Maintenance
```bash
# Weekly cleanup
find .flowforge/context -type d -mtime +7 -exec rm -rf {} \;  # Old context backups
/flowforge:bug:list --status=closed --since="1 month ago" | wc -l  # Closed bug count

# Monthly audit
/flowforge:bug:list --format=csv --export=monthly-audit.csv
# Review for:
# - Stale open bugs
# - Unassigned critical bugs  
# - Performance trends
```

This comprehensive workflow guide ensures teams can efficiently manage bugs while maintaining high productivity and code quality. The key is consistent application of these patterns and regular practice to build muscle memory for the bug management workflows.