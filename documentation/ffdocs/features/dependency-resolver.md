# Dependency Resolver for Automatic Task Selection

## Overview

The dependency resolver is a critical component of FlowForge v2.2.0 that automatically selects the next appropriate task based on the implementation order defined in `tasks.json`. This ensures developers always work on tasks in the optimal sequence, respecting dependencies and parallel track capabilities.

## Features

### 1. **Implementation Order Compliance**
- Follows the v2.2.0 implementation order strictly
- Automatically skips completed tasks
- Finds the first available incomplete task

### 2. **Dependency Resolution**
- Checks task dependencies before selection
- Ensures all prerequisite tasks are completed
- Detects and reports circular dependencies

### 3. **Parallel Track Support**
- Identifies tasks that can be worked on simultaneously
- Groups tasks by phases for better coordination
- Supports team collaboration on independent tasks

### 4. **Smart Task Status Filtering**
- Skips completed, blocked, and cancelled tasks
- Prioritizes in-progress tasks
- Falls back to ready/pending tasks

## Usage

### Command Line Interface

```bash
# Get next task (simple format - returns task ID only)
node scripts/provider-bridge.js get-next-task --format=simple

# Get next task with full details (JSON format)
node scripts/provider-bridge.js get-next-task --format=json

# Include parallel tasks that can be worked on simultaneously
node scripts/provider-bridge.js get-next-task --format=json --include-parallel=true

# Use in session:start (automatic)
./run_ff_command.sh flowforge:session:start
```

### Output Formats

#### Simple Format
Returns just the task ID or "NONE" if no tasks are available:
```
101
```

#### JSON Format
Returns comprehensive task information:
```json
{
  "taskId": 101,
  "task": {
    "id": 101,
    "title": "Audit current time tracking implementation",
    "status": "ready",
    "priority": "critical"
  },
  "reason": "Next in implementation order",
  "parallel": []
}
```

#### Text Format
Human-readable output:
```
Next task: #101 - Audit current time tracking implementation
Reason: Next in implementation order
```

## Integration with session:start

The dependency resolver is automatically integrated into the `session:start` command. The auto-detection order is:

1. **Current session data** - Resume existing work
2. **Next task from v2.2.0 implementation order** - Intelligent selection
3. **In-progress tasks** - Continue ongoing work
4. **Position tracking** - Saved position (if available)
5. **GitHub assigned issues** - Personal assignments

## Configuration

### tasks.json Structure

The resolver reads from `.flowforge/tasks.json` with the following structure:

```json
{
  "metadata": {
    "v2_2_0_implementation_order": [239, 244, 240, 241, 101, 102],
    "v2_2_0_phases": {
      "phase1_architecture": [244, 240, 241],
      "phase2_billing_fixes": [101, 102]
    }
  },
  "tasks": [
    {
      "id": 101,
      "status": "ready",
      "dependencies": [],
      "title": "Task title"
    }
  ]
}
```

### Task Status Values

- `ready` - Task is available to work on
- `in_progress` - Task is currently being worked on
- `completed` - Task is finished
- `blocked` - Task cannot be started (skipped)
- `cancelled` - Task was cancelled (skipped)

## Algorithm

### Task Selection Logic

1. **Read implementation order** from `metadata.v2_2_0_implementation_order`
2. **Iterate through tasks** in order
3. For each task:
   - Check if task exists in task list
   - Verify task is not completed/blocked/cancelled
   - Check all dependencies are met
   - Return first available task
4. **Parallel detection** (if requested):
   - Find task's phase from `v2_2_0_phases`
   - Return other available tasks in same phase

### Dependency Checking

```javascript
function areDependenciesMet(taskId) {
  const task = taskMap.get(taskId);
  if (!task || !task.dependencies) return true;
  
  // Check circular dependencies
  detectCircularDependencies(taskId);
  
  // Verify all dependencies completed
  return task.dependencies.every(depId => {
    const depTask = taskMap.get(depId);
    return depTask && depTask.status === 'completed';
  });
}
```

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Tasks file not found` | Missing `.flowforge/tasks.json` | Run `flowforge:project:setup` |
| `Failed to parse tasks file` | Invalid JSON | Check JSON syntax |
| `Circular dependency detected` | Tasks depend on each other | Fix dependency chain |
| `No available tasks` | All tasks completed/blocked | Create new tasks or unblock existing |

## Testing

### Unit Tests
Located in `/tests/provider-bridge.test.js`:
- Expected use cases
- Edge cases (empty orders, missing tasks)
- Failure cases (invalid JSON, circular deps)
- Performance tests (< 1s for 1000 tasks)

### Integration Tests
Located in `/tests/get-next-task-integration.sh`:
- Format validation
- Session:start integration
- Performance benchmarks

### Running Tests
```bash
# Unit tests (when test runner available)
npm test provider-bridge

# Integration tests
./tests/get-next-task-integration.sh
```

## Performance

- **Optimized for speed**: < 50ms for typical task lists
- **Scalable**: Handles 1000+ tasks efficiently
- **Memory efficient**: Uses Map for O(1) lookups

## Best Practices

1. **Keep implementation order updated** - Reflect actual priorities
2. **Mark tasks completed promptly** - Ensures accurate selection
3. **Use phases for parallel work** - Enable team collaboration
4. **Set proper dependencies** - Prevent work on blocked tasks
5. **Regular sync** - Keep tasks.json synchronized with GitHub

## Troubleshooting

### No Tasks Being Selected

1. Check if all tasks are completed:
   ```bash
   node scripts/provider-bridge.js list-tasks --status=ready --format=text
   ```

2. Verify implementation order exists:
   ```bash
   cat .flowforge/tasks.json | grep v2_2_0_implementation_order
   ```

3. Check for unmet dependencies:
   ```bash
   node scripts/provider-bridge.js get-next-task --format=json | jq '.reason'
   ```

### Wrong Task Selected

1. Verify task statuses are correct
2. Check if higher priority task has unmet dependencies
3. Ensure implementation order reflects current priorities

## Future Enhancements

- [ ] Priority overrides for urgent tasks
- [ ] Team assignment considerations
- [ ] Skill-based task matching
- [ ] Time estimation integration
- [ ] Multi-milestone support

---

*Last updated: 2025-09-06*
*Version: 2.2.0*