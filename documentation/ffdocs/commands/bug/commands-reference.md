# Bug Management Commands Reference

## Command Index

- [/flowforge:bug:add](#flowforgebugadd) - Smart bug addition with context detection
- [/flowforge:bug:nobugbehind](#flowforgebugnobugbehind) - Immediate bug sidetracking
- [/flowforge:bug:list](#flowforgebuglist) - Advanced bug listing and filtering
- [/flowforge:bug:popcontext](#flowforgebugpopcontext) - Return from bug sidetrack

---

## /flowforge:bug:add

### Purpose
Intelligently add bugs to the backlog with automatic context detection, priority assignment, and GitHub integration.

### Syntax
```bash
/flowforge:bug:add [title] [priority] [options]
```

### Parameters
- `[title]` - Bug title (required, prompts if not provided)
- `[priority]` - Priority level: critical|high|medium|low (auto-detected if not provided)

### Options
| Option | Type | Description |
|--------|------|-------------|
| `--description="text"` | String | Detailed bug description |
| `--tags="tag1,tag2"` | String | Additional comma-separated tags |
| `--files="path1,path2"` | String | Related files (auto-detected if not provided) |
| `--assignee="user"` | String | Assign to specific GitHub user |
| `--milestone="name"` | String | Associate with GitHub milestone |
| `--immediate` | Flag | Sidetrack immediately after creation |

### Auto-Detection Features

#### Priority Keywords
- **Critical**: crash, security, vulnerability, production, down, broken, critical, urgent, emergency
- **High**: performance, slow, timeout, error, exception, fail, high, important, blocking
- **Medium**: bug, issue, incorrect, wrong, missing, medium, problem (default)
- **Low**: cosmetic, ui, ux, enhancement, suggestion, low, minor, trivial

#### Context Detection
- Current task ID extracted from branch name patterns
- Modified files in working directory
- Git branch and last commit information
- File type analysis for automatic tagging

#### Smart Tagging
| File Pattern | Tags Applied |
|--------------|--------------|
| `*.js, *.ts, *.jsx, *.tsx` | frontend, javascript |
| `*.py` | backend, python |
| `*.go` | backend, golang |
| `*.java` | backend, java |
| `*.css, *.scss, *.sass` | ui, styling |
| `*.html, *.vue` | frontend, ui |
| `*.md, *.rst` | documentation |
| `*.sql` | database |
| `*.json, *.yaml, *.yml` | configuration |
| `*test*, *spec*` | testing |

### Examples

#### Basic Usage
```bash
# Interactive mode with full auto-detection
/flowforge:bug:add

# Quick add with auto-detection
/flowforge:bug:add "Login button not working"

# Explicit priority
/flowforge:bug:add "Database timeout" critical
```

#### Advanced Usage
```bash
# Add with custom description and tags
/flowforge:bug:add "API error" --description="500 error on POST /users" --tags="api,backend"

# Add with assignee and milestone
/flowforge:bug:add "UI spacing issue" low --assignee="designer" --milestone="v2.1"

# Add and fix immediately
/flowforge:bug:add "Critical security issue" critical --immediate
```

### Output
Creates:
- GitHub issue with structured description including context
- Entry in local bug backlog (`.flowforge/bug-backlog.json`)
- Updates to `TASKS.md` if present
- Project statistics updates

---

## /flowforge:bug:nobugbehind

### Purpose
Immediately sidetrack to fix a bug while preserving complete work context using the advanced sidetracking engine.

### Syntax
```bash
/flowforge:bug:nobugbehind [bug-id] [priority] [type]
```

### Parameters
- `[bug-id]` - Bug identifier (auto-generated if not provided)
- `[priority]` - Priority: critical|high|medium|low (auto-detected if not provided)
- `[type]` - Branch type: hotfix|bugfix (auto-selected based on priority)

### Auto-Selection Logic
| Priority | Branch Type | Branch Pattern |
|----------|-------------|----------------|
| critical, high | hotfix | `hotfix/[id]-work` |
| medium, low | bugfix | `bugfix/[id]-work` |

### Context Preservation
The command preserves:
- Current git branch and working directory state
- Uncommitted changes (automatically stashed)
- Open files and cursor positions (IDE integration)
- Environment variables and terminal state
- Time tracking session for current task
- Task progress and documentation state

### Process Flow
1. **Context Detection**: Analyzes current work environment
2. **Bug ID Generation**: Creates or validates bug identifier
3. **Priority Assignment**: Auto-detects or confirms priority
4. **Context Saving**: Uses sidetracking engine to preserve state
5. **Branch Creation**: Creates appropriate bug fix branch
6. **GitHub Integration**: Creates or updates issue
7. **Time Tracking**: Starts separate bug tracking session
8. **Documentation**: Updates session notes and guides

### Examples

#### Basic Usage
```bash
# Auto-detect everything in interactive mode
/flowforge:bug:nobugbehind

# Work on specific GitHub issue
/flowforge:bug:nobugbehind 456

# Explicit priority and type
/flowforge:bug:nobugbehind 456 critical hotfix
```

#### Emergency Usage
```bash
# Production issue - fastest path
/flowforge:bug:nobugbehind 999 critical

# Auto-generate bug ID for urgent issue
/flowforge:bug:nobugbehind "" critical
```

### Performance
- Target context switch time: <370ms
- Context preservation: Complete working state
- Recovery guarantee: 100% restoration capability

---

## /flowforge:bug:list

### Purpose
Advanced bug listing with powerful filtering, searching, and export capabilities.

### Syntax
```bash
/flowforge:bug:list [filter] [options]
```

### Quick Filters
| Filter | Effect |
|--------|--------|
| `all` | Show all bugs regardless of status |
| `open` | Show only open bugs (default) |
| `critical` | Show only critical open bugs |
| `high` | Show only high priority open bugs |
| `medium` | Show only medium priority open bugs |
| `low` | Show only low priority open bugs |
| `mine` | Show bugs assigned to current user |

### Filter Options
| Option | Type | Description |
|--------|------|-------------|
| `--priority=LIST` | String | Filter by priority: critical,high,medium,low |
| `--status=LIST` | String | Filter by status: open,closed,in_progress |
| `--assignee=USER` | String | Filter by assignee (use 'me' for current user) |
| `--search=TEXT` | String | Full-text search in titles and descriptions |
| `--tags=LIST` | String | Filter by tags: frontend,backend,ui,etc. |
| `--since=DATE` | String | Show bugs since date (YYYY-MM-DD or relative) |
| `--until=DATE` | String | Show bugs until date |

### Display Options
| Option | Type | Description |
|--------|------|-------------|
| `--format=FORMAT` | String | Output format: table\|json\|markdown\|csv |
| `--sort=FIELD` | String | Sort by: priority\|created\|updated\|title |
| `--group=FIELD` | String | Group by: priority\|status\|assignee\|tags |
| `--limit=N` | Number | Limit results (default: 50) |
| `--color` | Flag | Force color output |
| `--no-color` | Flag | Disable color output |

### Export Options
| Option | Type | Description |
|--------|------|-------------|
| `--export=FILE` | String | Export to file (format auto-detected from extension) |
| `--template=NAME` | String | Use template: summary\|detailed\|report |

### Examples

#### Basic Listing
```bash
# List all open bugs (default)
/flowforge:bug:list

# Show only critical bugs
/flowforge:bug:list critical

# Show my assigned bugs
/flowforge:bug:list --assignee=me
```

#### Advanced Filtering
```bash
# Search for login-related high priority bugs
/flowforge:bug:list --search="login" --priority=high

# Recent bugs in specific tags
/flowforge:bug:list --since="1 week ago" --tags="frontend,ui"

# Closed bugs assigned to specific user
/flowforge:bug:list --status=closed --assignee=developer
```

#### Export and Reporting
```bash
# Export all bugs to CSV
/flowforge:bug:list --export=bugs.csv --format=csv

# Generate markdown report for stakeholders
/flowforge:bug:list --format=markdown --export=bug-report.md --template=summary

# JSON export for API consumption
/flowforge:bug:list --format=json --export=bugs.json --limit=100
```

#### Date Range Queries
```bash
# Bugs from last month
/flowforge:bug:list --since="1 month ago"

# Bugs in specific date range
/flowforge:bug:list --since="2024-01-01" --until="2024-01-31"

# Bugs created this week
/flowforge:bug:list --since="1 week ago" --format=table
```

### Output Formats

#### Table Format (default)
- Color-coded priority indicators
- Real-time GitHub status sync
- Summary statistics
- Actionable next steps

#### JSON Format
- Complete bug data structure
- Suitable for API consumption
- Preserves all metadata

#### CSV Format
- Standard comma-separated values
- Headers: ID,Title,Priority,Status,Assignee,Created,Updated,URL,Tags
- Excel/spreadsheet compatible

#### Markdown Format
- Human-readable reports
- GitHub-flavored markdown
- Grouped by priority
- Clickable issue links

---

## /flowforge:bug:popcontext

### Purpose
Intelligently return from bug sidetracking to previous work context with complete state restoration.

### Syntax
```bash
/flowforge:bug:popcontext [options]
```

### Options
| Option | Description |
|--------|-------------|
| `--force` | Force restoration even if current work is dirty |
| `--keep-branch` | Keep the bug branch after restoration |
| `--no-stash` | Don't apply any stashed changes |
| `--dry-run` | Show what would be restored without doing it |

### Restoration Process
1. **State Validation**: Verifies current sidetrack session exists
2. **Time Tracking**: Stops bug time tracking and shows summary
3. **GitHub Updates**: Adds completion comment to issue
4. **Context Restoration**: Uses sidetracking engine to restore previous state
5. **Git Cleanup**: Manages stashed changes and branch cleanup
6. **Time Resume**: Restarts time tracking for original task
7. **Documentation**: Updates session notes and task tracking

### What Gets Restored
- Git branch and working directory state
- Open files and cursor positions (IDE integration)
- Environment variables and terminal state
- Time tracking session for original task
- Documentation and session notes
- Project progress tracking

### Safety Features
- Validates context before restoration
- Backs up current state before switching
- Handles merge conflicts gracefully
- Preserves work if restoration fails
- Dry-run mode for preview

### Examples

#### Standard Usage
```bash
# Complete restoration with all defaults
/flowforge:bug:popcontext

# Preview what would be restored
/flowforge:bug:popcontext --dry-run
```

#### Advanced Options
```bash
# Force restoration despite uncommitted changes
/flowforge:bug:popcontext --force

# Keep bug branch for future work
/flowforge:bug:popcontext --keep-branch

# Restore without applying stashed changes
/flowforge:bug:popcontext --no-stash
```

#### Emergency Recovery
```bash
# Force restoration with branch preservation
/flowforge:bug:popcontext --force --keep-branch

# Dry-run to check state before forcing
/flowforge:bug:popcontext --dry-run --force
```

---

## Common Workflows

### Standard Bug Handling
```bash
# 1. Discover bug during development
/flowforge:bug:add "Issue with user authentication"

# 2. Later, when ready to fix
/flowforge:bug:list --priority=high

# 3. Fix the bug immediately
/flowforge:bug:nobugbehind 123

# 4. After fixing, return to original work
/flowforge:bug:popcontext
```

### Emergency Bug Response
```bash
# Production issue reported
/flowforge:bug:add "Critical login failure" critical --immediate
# (Automatically switches to bug fixing mode)

# Fix the issue...
# When done:
/flowforge:bug:popcontext
```

### Bug Triage and Management
```bash
# Review all bugs
/flowforge:bug:list --format=table

# Focus on critical issues
/flowforge:bug:list critical

# Export report for stakeholders
/flowforge:bug:list --format=markdown --export=weekly-bugs.md
```

## Error Handling

All commands include comprehensive error handling:
- Meaningful error messages with suggested solutions
- Debug mode available with `DEBUG=1` environment variable
- Graceful fallbacks for missing dependencies
- Automatic cleanup of temporary files
- Context preservation in case of failures

## Integration Notes

### GitHub CLI Requirements
- Commands work best with GitHub CLI (`gh`) installed
- Automatic issue creation and management
- Real-time status synchronization
- Comment and label management

### Time Tracking Integration
- Works with FlowForge provider bridge system
- Falls back to traditional time tracking scripts
- Separate tracking for bugs vs main tasks
- Accurate billing and reporting

### Sidetracking Engine
- Advanced context preservation with TypeScript engine
- Fallback to basic context saving
- Complete environment restoration
- IDE integration for file and cursor state

## Performance Considerations

- Target response times maintained for all operations
- Efficient GitHub API usage with caching
- Optimized JSON processing for large bug lists
- Minimal overhead for context switching
- Background operations where possible

## Troubleshooting

### Common Issues
1. **GitHub authentication**: Ensure `gh auth login` is completed
2. **Sidetracking engine**: Check TypeScript compilation if advanced features fail
3. **Time tracking**: Verify provider bridge setup for accurate billing
4. **Context restoration**: Use `--dry-run` to preview before applying

### Debug Mode
Enable with `DEBUG=1` before any command:
```bash
DEBUG=1 /flowforge:bug:add "Debug this issue"
```

This enables verbose logging and detailed error information for troubleshooting.