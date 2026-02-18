# FlowForge Bug Management System - User Guide

## Overview

The FlowForge Bug Management System is a comprehensive solution for intelligent bug tracking, immediate sidetracking, and seamless context switching. It implements Rule #37 (No Bug Left Behind) to ensure every bug is tracked, timed, and resolved without losing productivity context.

## Core Features

- **Smart Context Detection** - Automatically detects current task, branch, and file context
- **Priority-Based Assignment** - Intelligent priority assignment using keyword analysis
- **GitHub Integration** - Seamless issue creation and synchronization
- **Sidetracking System** - Immediate bug fixing with context preservation
- **Multiple Export Formats** - JSON, CSV, Markdown, and table outputs
- **Batch Operations** - Bulk management of multiple bugs
- **Time Tracking Integration** - Accurate billing for bug work vs. feature work

## Command Overview

FlowForge provides 4 core bug management commands:

| Command | Purpose | Performance Target |
|---------|---------|-------------------|
| `/flowforge:bug:add` | Smart bug addition with auto-detection | <200ms |
| `/flowforge:bug:list` | Advanced listing with filtering and export | <300ms |
| `/flowforge:bug:nobugbehind` | Immediate sidetracking for bug fixes | <370ms |
| `/flowforge:bug:popcontext` | Return to previous work context | <250ms |

## 1. Adding Bugs (`/flowforge:bug:add`)

### Basic Usage

```bash
# Interactive mode with full auto-detection
/flowforge:bug:add

# Quick add with auto-detection
/flowforge:bug:add "Login button not working"

# Explicit priority
/flowforge:bug:add "Database timeout" critical

# With additional options
/flowforge:bug:add "API error" high --description="500 error on POST /users" --tags="api,backend"

# Add and fix immediately
/flowforge:bug:add "UI spacing issue" low --immediate
```

### Smart Priority Detection

The system automatically assigns priority based on keywords in the title and description:

#### Critical Priority Keywords
- `crash`, `security`, `vulnerability`, `production`, `down`, `broken`
- **Example**: "Production crash on user login" → **Critical**

#### High Priority Keywords  
- `performance`, `slow`, `timeout`, `error`, `exception`, `fail`
- **Example**: "API performance degradation" → **High**

#### Medium Priority Keywords
- `bug`, `issue`, `incorrect`, `wrong`, `missing`
- **Example**: "Incorrect validation message" → **Medium**

#### Low Priority Keywords
- `cosmetic`, `ui`, `ux`, `enhancement`, `suggestion`
- **Example**: "Button spacing needs adjustment" → **Low**

### Auto-Detection Features

When you run `/flowforge:bug:add`, the system automatically detects:

- **Current Context**: Active task and branch information
- **Modified Files**: Files you're currently working on
- **Related Tags**: Based on file types (frontend, backend, database, etc.)
- **Priority**: Based on keywords in the bug description
- **GitHub Integration**: Creates issues with proper labels and context

### Complete Options Reference

```bash
/flowforge:bug:add [title] [priority] [options]

Arguments:
  [title]     Bug title (interactive prompt if not provided)
  [priority]  critical|high|medium|low (auto-detected if not provided)

Options:
  --description="text"    Bug description
  --tags="tag1,tag2"     Additional tags  
  --files="path1,path2"  Related files (auto-detected if not provided)
  --assignee="user"      Assign to specific user
  --milestone="name"     Associate with milestone
  --immediate            Sidetrack immediately after creation
```

### Interactive Example

```bash
$ /flowforge:bug:add
🐛 Smart Bug Addition - Context-Aware Registration
════════════════════════════════════════════════
🔍 Auto-detecting current context...
📍 Context Detection Results:
• Branch: feature/123-user-auth
• Task: 123
• Last commit: abc1234 Add login validation
• Modified files: src/auth/login.js,tests/auth.test.js
• Detected tags: frontend, javascript, testing

📝 Bug Information Required:
Bug title: Login form doesn't validate email
Description (optional): Users can submit empty email field

🧠 Analyzing priority...
🔍 Auto-detected priority: medium
  Reason: Contains standard bug keywords: incorrect, wrong, missing, etc.
Accept priority 'medium'? [Y/n]: Y

🏷️ Final tags: bug, medium, frontend, javascript, testing

📋 Creating GitHub issue...
✅ Issue created successfully
✅ Added to bug backlog (JSON format)

════════════════════════════════════════════════
✅ BUG ADDED SUCCESSFULLY
════════════════════════════════════════════════

📋 Bug Summary:
• Title: Login form doesn't validate email
• Priority: medium (Contains standard bug keywords)
• Issue: #156 (https://github.com/user/repo/issues/156)
• Tags: bug, medium, frontend, javascript, testing
• Context: Task 123 on feature/123-user-auth

🔧 Available Actions:
• Fix immediately: /flowforge:bug:nobugbehind 156
• View all bugs: /flowforge:bug:list
• View issue: gh issue view 156

💡 Rule #37: No Bug Left Behind - Bug tracked and won't be forgotten!
```

## 2. Listing Bugs (`/flowforge:bug:list`)

### Basic Usage

```bash
# List all open bugs (default)
/flowforge:bug:list

# Quick filters
/flowforge:bug:list critical        # Only critical bugs
/flowforge:bug:list mine           # My assigned bugs
/flowforge:bug:list all            # All bugs (open and closed)
```

### Advanced Filtering

```bash
# Filter by priority
/flowforge:bug:list --priority=critical,high

# Filter by status
/flowforge:bug:list --status=open,in_progress

# Filter by assignee
/flowforge:bug:list --assignee=john

# Search in titles and descriptions
/flowforge:bug:list --search="login"

# Date range filtering
/flowforge:bug:list --since="1 week ago"
/flowforge:bug:list --until="2024-01-01"

# Tag-based filtering
/flowforge:bug:list --tags=frontend,ui

# Complex queries
/flowforge:bug:list --priority=high --assignee=me --since="3 days ago"
```

### Output Formats

```bash
# Table format (default)
/flowforge:bug:list --format=table

# JSON output
/flowforge:bug:list --format=json

# CSV for spreadsheets
/flowforge:bug:list --format=csv

# Markdown for documentation
/flowforge:bug:list --format=markdown
```

### Export Options

```bash
# Export to files
/flowforge:bug:list --export=bugs.csv
/flowforge:bug:list --export=report.md --format=markdown
/flowforge:bug:list --export=data.json --format=json

# Templates
/flowforge:bug:list --export=summary.csv --template=summary
/flowforge:bug:list --export=detailed.md --template=detailed
```

### Batch Operations

FlowForge supports powerful batch operations on filtered bugs:

```bash
# Close all low priority bugs
/flowforge:bug:list --priority=low --batch-close

# Assign all critical bugs to john
/flowforge:bug:list --priority=critical --batch-assign=john

# Change priority of old bugs
/flowforge:bug:list --since="30 days ago" --batch-priority=low

# Update status of multiple bugs
/flowforge:bug:list --assignee=me --batch-status=in_progress

# Force batch operations without confirmation
/flowforge:bug:list --priority=low --batch-close --force
```

### Display Example

```bash
$ /flowforge:bug:list --priority=critical,high
📋 FlowForge Bug List Management
════════════════════════════════════════════════
🔍 Loading bug data...
📋 Loading from local bug backlog...
✅ Loaded 15 bugs from local backlog
📊 Data sources: local, github
🔍 Applying filters and search...
📊 Generating table output...

════════════════════════════════════════════════
🐛 BUG LIST - 8 RESULTS
════════════════════════════════════════════════

┌─────┬─────────────────────────────────────────┬──────────┬────────┬───────────┬─────────────┐
│ ID  │ Title                                   │ Priority │ Status │ Assignee  │ Created     │
├─────┼─────────────────────────────────────────┼──────────┼────────┼───────────┼─────────────┤
│ 156 │ 🔴 Production crash on user login      │ critical │ open   │ john      │ 2024-01-15  │
│ 157 │ 🔴 Security vulnerability in API       │ critical │ open   │ alice     │ 2024-01-14  │
│ 158 │ 🟡 Database timeout on large queries   │ high     │ open   │ bob       │ 2024-01-13  │
│ 159 │ 🟡 Performance issue in search         │ high     │ open   │ -         │ 2024-01-12  │
└─────┴─────────────────────────────────────────┴──────────┴────────┴───────────┴─────────────┘

📊 Summary Statistics:
• Total: 8 bugs
• Critical: 2 (25%)
• High: 2 (25%)
• Assigned: 6 (75%)
• Average age: 3.5 days

🔧 Available Actions:
• Fix bug: /flowforge:bug:nobugbehind [id]
• Add bug: /flowforge:bug:add
• View details: gh issue view [id]
```

## 3. Bug Sidetracking (`/flowforge:bug:nobugbehind`)

The sidetracking system implements Rule #37 by allowing immediate bug fixes without losing current work context.

### Basic Usage

```bash
# Auto-detect everything
/flowforge:bug:nobugbehind

# Work on specific bug
/flowforge:bug:nobugbehind 456

# Explicit priority and type
/flowforge:bug:nobugbehind 456 critical hotfix
```

### What Sidetracking Does

1. **Preserves Current Context**
   - Saves current work state using the advanced sidetracking engine
   - Stashes uncommitted changes if needed
   - Records current branch and task information

2. **Sets Up Bug Environment**
   - Creates appropriate branch (`hotfix/` for critical/high, `bugfix/` for others)
   - Starts separate time tracking for accurate billing
   - Creates or links GitHub issue with proper labels

3. **Enables Seamless Return**
   - All context information stored for restoration
   - Clear instructions for returning to previous work
   - Integration with FlowForge session management

### Branch Strategy

- **Hotfix branches** (`hotfix/456-work`) for critical and high priority bugs
  - Created from main/master branch
  - Fast-track deployment process
  - Immediate attention required

- **Bugfix branches** (`bugfix/456-work`) for medium and low priority bugs
  - Created from current branch
  - Normal development workflow
  - Can be batched with other changes

### Performance Targets

The sidetracking system is optimized for speed with targets:
- **Context Capture**: <100ms
- **Branch Creation**: <50ms  
- **Total Switch Time**: <370ms (Rule #37 requirement)

### Sidetracking Example

```bash
$ /flowforge:bug:nobugbehind 456 critical
🐛 Starting Bug Sidetracking - No Bug Left Behind
════════════════════════════════════════════════
🔍 Context Detection:
• Current branch: feature/123-user-auth
• Current task: 123
• Sidetracking engine: advanced mode

🎯 Using provided bug ID: 456
🔍 Auto-detecting priority...
✅ Priority validated: critical

🚨 High priority bug - using hotfix branch
🌿 Target branch: hotfix/456-work

📋 Bug Summary:
• ID: 456
• Priority: critical (hotfix)
• Branch: hotfix/456-work

💾 Preserving current work context...
🚀 Using advanced sidetracking engine...
✅ Context saved with ID: ctx-001

🌿 Setting up bug branch...
💾 Stashing uncommitted changes...
✅ Changes stashed successfully
🚨 Creating hotfix from main branch...
✅ Using base branch: main
🌱 Creating new branch: hotfix/456-work
✅ Branch created and checked out

📋 Setting up GitHub issue...
✅ Found existing issue: https://github.com/user/repo/issues/456

⏱️ Starting time tracking for bug...
🔗 Using provider bridge for time tracking...
✅ Time tracking started via provider bridge

════════════════════════════════════════════════
🐛 BUG SIDETRACK COMPLETE - NO BUG LEFT BEHIND
════════════════════════════════════════════════

📋 Bug Information:
• ID: 456
• Priority: critical (hotfix)
• Branch: hotfix/456-work
• Issue: https://github.com/user/repo/issues/456

🎯 Current Status:
• Previous context: Saved (ctx-001)
• Time tracking: Active
• Git branch: hotfix/456-work

📋 Next Steps:
1. 🔍 Investigate and reproduce the bug
2. 🧪 Write a failing test (Rule #3 - TDD)  
3. 🔧 Implement the fix
4. ✅ Verify the fix works
5. 🔄 Return to previous work

🔄 When Done (IMPORTANT):
Run this command to return to your previous work:
• /flowforge:session:end "Fixed bug 456" && /flowforge:bug:popcontext
```

## 4. Returning to Previous Work (`/flowforge:bug:popcontext`)

After fixing a bug, use this command to restore your previous work context.

### Basic Usage

```bash
# Standard restoration
/flowforge:bug:popcontext

# Force restoration even with uncommitted changes
/flowforge:bug:popcontext --force

# Keep bug branch for future work
/flowforge:bug:popcontext --keep-branch

# Preview what would be restored
/flowforge:bug:popcontext --dry-run
```

### What Context Restoration Does

1. **Validates Current State**
   - Checks for uncommitted changes in bug branch
   - Validates available context information
   - Provides safety warnings if needed

2. **Stops Bug Time Tracking**
   - Ends time tracking for bug work
   - Generates time summary
   - Updates GitHub issue with session information

3. **Restores Previous Context**
   - Switches back to original branch
   - Restores file state and cursor positions (if supported)
   - Applies stashed changes if available

4. **Resumes Original Time Tracking**
   - Restarts time tracking for original task
   - Maintains billing separation between bug and feature work
   - Updates session documentation

### Context Restoration Example

```bash
$ /flowforge:bug:popcontext
🔄 Returning from Bug Sidetrack - Context Restoration
════════════════════════════════════════════════
🔍 Validating current state and loading context...

📋 Current Bug Sidetrack:
• Bug ID: 456
• Priority: critical
• Current Branch: hotfix/456-work
• Original Task: 123
• Original Branch: feature/123-user-auth
• Context ID: ctx-001

⏱️ Stopping bug time tracking...
🔗 Using provider bridge for time tracking...
✅ Time tracking stopped via provider bridge
📊 Time tracking summary: 1h 23m spent on bug 456

📋 Updating GitHub issue status...
✅ Added session summary comment to issue

💾 Restoring previous work context...
🚀 Using advanced sidetracking engine for restoration...
✅ Advanced context restoration successful

🔧 Cleaning up git state...
🔍 Checking for stashed changes to restore...
💾 Found auto-stash from bug sidetracking - applying...
✅ Auto-stash applied successfully

🗑️ Cleaning up bug branch: hotfix/456-work
✅ Bug branch deleted: hotfix/456-work

⏱️ Restoring time tracking for original task...
🔗 Restarting time tracking via provider bridge...
✅ Time tracking resumed for task 123

════════════════════════════════════════════════
✅ BUG CONTEXT RESTORATION COMPLETE
════════════════════════════════════════════════

📋 Restoration Summary:
• Bug completed: 456 (critical)
• Returned to: feature/123-user-auth branch
• Original task: 123
• Time tracking: Resumed
• Bug branch: Cleaned up

✨ Welcome back to your original work context!
🐛➡️✅ Bug 456 has been handled - no bug left behind!
```

## Advanced Features

### GitHub Integration

The bug management system integrates seamlessly with GitHub:

- **Automatic Issue Creation**: Creates GitHub issues with rich context
- **Label Management**: Applies appropriate labels based on priority and type
- **Status Synchronization**: Keeps local and remote status in sync
- **Comment Updates**: Adds session summaries and progress updates
- **Link Generation**: Provides direct links to issues

### Time Tracking Integration

FlowForge separates bug work from feature work for accurate billing:

- **Separate Billing Codes**: 
  - Feature work: `FEAT-DEV` (default rate: $150/hr)
  - Bug work: `BUG-FIX` (default rate: $200/hr)  
  - Critical bugs: `CRITICAL-BUG` (premium rate: $300/hr)

- **Nested Bug Tracking**: Supports bugs discovered while fixing other bugs
- **Quality Metrics**: Tracks bug discovery patterns and fix efficiency
- **Comprehensive Reporting**: Detailed time allocation reports

### Smart Context Detection

The system automatically detects:

- **Current Task**: From branch name patterns
- **Related Files**: From git status and modification history
- **Project Context**: From file types and directory structure
- **Priority Indicators**: From keywords and commit history
- **Dependencies**: From related issues and pull requests

## Best Practices

### Workflow Recommendations

1. **Always Use Sidetracking**: Use `/flowforge:bug:nobugbehind` for immediate fixes
2. **Write Tests First**: Follow Rule #3 (TDD) even for bug fixes
3. **Document Context**: Add meaningful descriptions to help future debugging
4. **Use Proper Priority**: Let the system auto-detect or be explicit
5. **Return Promptly**: Use `/flowforge:bug:popcontext` to maintain productivity

### Priority Guidelines

- **Critical**: Production issues, security vulnerabilities, system crashes
- **High**: Major features broken, significant performance issues, blocking issues
- **Medium**: Minor feature issues, incorrect behavior, missing functionality
- **Low**: Cosmetic issues, enhancements, nice-to-have fixes

### Tag Strategy

Use consistent tagging for better organization:

- **Area Tags**: `frontend`, `backend`, `database`, `api`, `ui`
- **Technology Tags**: `javascript`, `python`, `react`, `node`
- **Category Tags**: `performance`, `security`, `accessibility`, `mobile`
- **Process Tags**: `testing`, `documentation`, `deployment`

### Batch Operation Guidelines

- **Use Filters First**: Always preview what will be affected
- **Start Small**: Test batch operations on a few items first
- **Use --force Carefully**: Only when you're certain of the impact
- **Backup Important Data**: Especially before bulk status changes

## Troubleshooting

### Common Issues

**"No bug sidetrack state found"**
- You're not currently in a bug sidetracking session
- Use `/flowforge:bug:nobugbehind` to start sidetracking

**"Context restoration failed"**
- Check if the sidetracking engine is available
- Verify `.flowforge/.bug-sidetrack-state` exists
- Use `--force` option if safe to proceed

**"GitHub integration not working"**
- Verify `gh` CLI is installed and authenticated
- Check repository permissions
- Ensure you're in a git repository

**"Time tracking not available"**
- Check if `scripts/provider-bridge.js` exists
- Verify Node.js is available
- Fall back to manual time tracking

### Performance Issues

If commands are slower than expected:

1. **Check System Resources**: Ensure adequate memory and CPU
2. **Clean Cache**: Remove old context files from `.flowforge/context/`
3. **Optimize Filters**: Use specific filters instead of broad searches
4. **Update Dependencies**: Ensure all components are current

### Debug Mode

Enable debug mode for detailed troubleshooting:

```bash
DEBUG=1 /flowforge:bug:add "test bug"
DEBUG=1 /flowforge:bug:list
DEBUG=1 /flowforge:bug:nobugbehind 456
DEBUG=1 /flowforge:bug:popcontext
```

## Integration Examples

### VS Code Integration

The system can detect and restore VS Code contexts:

```json
{
  "workbench.startupEditor": "none",
  "files.restoreUndoStack": true,
  "workbench.editor.restoreViewState": true
}
```

### CI/CD Integration

Integrate bug tracking with your build pipeline:

```yaml
# .github/workflows/bug-check.yml
name: Bug Check
on: [pull_request]
jobs:
  check-bugs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check for open critical bugs
        run: |
          if /flowforge:bug:list --priority=critical --format=json | jq '.bugs | length > 0'; then
            echo "Critical bugs exist! Review before deployment."
            exit 1
          fi
```

### Slack Integration

Set up notifications for bug activities:

```bash
# In your .bashrc or project configuration
export BUG_WEBHOOK_URL="https://hooks.slack.com/services/..."

# The system will automatically post updates
```

## API Reference

### Export Formats

**JSON Output**:
```json
{
  "bugs": [
    {
      "id": "156",
      "title": "Login button not working",
      "priority": "medium",
      "status": "open",
      "assignee": "john",
      "created": "2024-01-15T10:00:00Z",
      "tags": ["bug", "frontend", "ui"],
      "github": {
        "url": "https://github.com/user/repo/issues/156",
        "number": "156"
      }
    }
  ],
  "summary": {
    "total": 1,
    "byPriority": {
      "critical": 0,
      "high": 0, 
      "medium": 1,
      "low": 0
    }
  }
}
```

**CSV Output**:
```csv
ID,Title,Priority,Status,Assignee,Created,Tags,URL
156,"Login button not working",medium,open,john,2024-01-15,"bug,frontend,ui",https://github.com/user/repo/issues/156
```

This comprehensive user guide ensures developers can effectively use the FlowForge Bug Management System to maintain high productivity while ensuring no bug is left behind.