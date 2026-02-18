# Bug Batch Operations - FlowForge v2.0

## Overview

FlowForge v2.0 introduces powerful batch operations for bug management, allowing you to efficiently handle multiple bugs at once. This feature is essential for issue #204 and provides both list-based batch operations and bulk bug creation capabilities.

## Batch List Operations

The `/flowforge:bug:list` command now supports batch operations to modify multiple bugs that match your filters.

### Available Batch Operations

#### 1. Batch Close (`--batch-close`)
Close all bugs matching the current filters.

```bash
# Close all low priority bugs (dry run first)
/flowforge:bug:list --priority=low --batch-close --dry-run

# Actually close them
/flowforge:bug:list --priority=low --batch-close
```

#### 2. Batch Assign (`--batch-assign=USER`)
Assign all filtered bugs to a specific user.

```bash
# Assign all open bugs to current user
/flowforge:bug:list --status=open --batch-assign=me

# Assign all critical bugs to team lead
/flowforge:bug:list --priority=critical --batch-assign=team-lead
```

#### 3. Batch Priority Change (`--batch-priority=LEVEL`)
Change priority of all filtered bugs to a new level.

```bash
# Upgrade all bugs containing "security" to critical priority
/flowforge:bug:list --search="security" --batch-priority=critical

# Downgrade all old low priority bugs to documentation
/flowforge:bug:list --priority=low --since="3 months ago" --batch-priority=low
```

### Safety Features

- **Dry Run Mode**: Always test with `--dry-run` first
- **Confirmation Required**: Interactive confirmation before executing
- **Preview Table**: Shows exactly which bugs will be affected
- **Progress Tracking**: Real-time feedback during batch operations

### Complete Examples

```bash
# Example 1: Clean up old resolved bugs
/flowforge:bug:list --status=open --search="resolved" --batch-close --dry-run

# Example 2: Reassign bugs from departing team member
/flowforge:bug:list --assignee=old-dev --batch-assign=new-dev

# Example 3: Escalate critical issues found in search
/flowforge:bug:list --search="production" --batch-priority=critical --dry-run
```

## Batch Bug Creation

The `/flowforge:bug:add` command now supports creating multiple bugs from JSON input.

### Input Methods

#### 1. From File (`--batch=FILE`)
```bash
# Create bugs from JSON file
/flowforge:bug:add --batch=bugs.json --dry-run

# Create and immediately sidetrack first critical bug
/flowforge:bug:add --batch=critical-bugs.json --immediate
```

#### 2. From stdin (`--stdin`)
```bash
# Pipe JSON data directly
cat bugs.json | /flowforge:bug:add --stdin

# From API or other tools
curl https://api.example.com/bugs | /flowforge:bug:add --stdin --dry-run
```

### JSON Format

The batch input should follow this format:

```json
{
  "bugs": [
    {
      "title": "Required: Bug title",
      "priority": "optional: critical|high|medium|low (default: medium)",
      "description": "optional: Detailed bug description",
      "tags": ["optional", "array", "of", "tags"],
      "assignee": "optional: GitHub username",
      "milestone": "optional: Milestone name"
    }
  ]
}
```

### Example JSON File

See `/documentation/examples/batch-bug-import.json` for a complete example with 5 different bug types.

### Features

- **Context Preservation**: Current branch, task, and commit info added automatically
- **Smart Validation**: Invalid priorities default to medium
- **Progress Tracking**: Real-time creation feedback
- **Immediate Sidetracking**: `--immediate` flag sidestracks first critical bug
- **Rich Templates**: Structured GitHub issues with sections for reproduction, acceptance criteria

## Usage Patterns

### 1. Issue Triage Workflow
```bash
# Import bugs from external system
curl https://jira.company.com/export | /flowforge:bug:add --stdin

# Review and prioritize
/flowforge:bug:list --priority=medium --batch-priority=high --dry-run

# Assign to team members
/flowforge:bug:list --tags=frontend --batch-assign=frontend-team
```

### 2. Bug Cleanup Workflow
```bash
# Find old, inactive bugs
/flowforge:bug:list --status=open --until="6 months ago"

# Close bugs resolved elsewhere
/flowforge:bug:list --search="resolved" --batch-close --dry-run

# Downgrade low-impact issues
/flowforge:bug:list --priority=medium --tags=cosmetic --batch-priority=low
```

### 3. Release Management
```bash
# Create bugs from release testing
/flowforge:bug:add --batch=release-testing-bugs.json --immediate

# Assign all critical bugs for hotfix
/flowforge:bug:list --priority=critical --batch-assign=hotfix-team

# Close bugs fixed in release
/flowforge:bug:list --milestone=v2.0 --status=open --batch-close
```

## Advanced Features

### Filtering Integration
All batch operations work with the full filtering system:

```bash
# Complex filter with batch operation
/flowforge:bug:list \
  --priority=high,critical \
  --assignee=john \
  --tags=backend,api \
  --since="1 week ago" \
  --batch-priority=critical \
  --dry-run
```

### Output Formats
Batch operations provide detailed reporting:

- **Preview Tables**: Show affected bugs before execution
- **Progress Indicators**: Real-time operation feedback  
- **Summary Statistics**: Success/failure counts
- **Error Handling**: Graceful handling of GitHub API failures

### Safety Mechanisms

1. **Dry Run First**: Always preview changes
2. **Confirmation Prompts**: Prevent accidental bulk changes
3. **Atomic Operations**: Either all succeed or none are applied
4. **Rollback Friendly**: Operations can be manually reversed
5. **Audit Trail**: All changes tracked in GitHub activity

## Error Handling

### Common Issues and Solutions

#### GitHub API Rate Limits
- Batch operations are respectful of API limits
- Automatic retry logic for temporary failures
- Clear error messages when limits exceeded

#### Permission Issues  
- Check GitHub authentication: `gh auth status`
- Ensure repository write access
- Verify label creation permissions

#### Invalid Data
- JSON validation before processing
- Clear error messages for format issues
- Graceful handling of missing fields

## Integration with FlowForge Workflow

### Rule #37 Compliance
Batch operations fully support FlowForge's "No Bug Left Behind" principle:
- All bugs are tracked in local backlog
- GitHub integration ensures centralized tracking
- Context information preserved across operations

### Time Tracking Integration
- Batch operations are logged for billing purposes
- Context information links bugs to active tasks
- Immediate sidetracking respects time tracking rules

### Agent Integration
These batch operations are designed to work with FlowForge agents:
- `fft-documentation` can create documentation bugs in batch
- `fft-testing` can import test failure bugs
- `fft-project-manager` can manage release bug workflows

## Performance Considerations

### Scalability
- Batch operations handle 100+ bugs efficiently
- Progressive feedback prevents timeout perception
- Memory-efficient processing of large JSON files

### GitHub API Optimization  
- Minimal API calls per operation
- Efficient label management (bulk updates)
- Smart deduplication prevents unnecessary calls

## Conclusion

The batch operations feature transforms FlowForge from a single-bug management tool into a comprehensive bug triage and workflow system. Whether importing bugs from external systems, managing release workflows, or cleaning up old issues, these operations provide the efficiency needed for professional software development.

The combination of safety features (dry run, confirmation) with powerful filtering makes these operations both safe and flexible for any bug management scenario.