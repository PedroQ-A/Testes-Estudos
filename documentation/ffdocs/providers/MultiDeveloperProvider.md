# MultiDeveloperProvider Documentation

## Overview

The `MultiDeveloperProvider` is a routing layer that enables multi-developer support in FlowForge v2.0. It provides developer isolation while maintaining team-wide visibility of tasks, addressing Issue #543.

## Architecture

### Core Concepts

1. **Developer Isolation**: Each developer has their own provider instance with isolated data storage
2. **Team Aggregation**: Team-wide views aggregate data from all developer namespaces
3. **Provider Caching**: Instances are cached for performance optimization
4. **Ownership Verification**: Ensures developers can only modify their own tasks

### Component Diagram

```
┌─────────────────────────────────────────────────┐
│           MultiDeveloperProvider                 │
├─────────────────────────────────────────────────┤
│  - baseProvider: TaskProvider                   │
│  - teamConfig: TeamConfiguration                │
│  - developerProviders: Map<devId, Provider>     │
│  - teamCache: Task[]                            │
├─────────────────────────────────────────────────┤
│  + getProviderForDeveloper(devId)               │
│  + createTask(task, devId)                      │
│  + updateTask(id, updates, devId)               │
│  + deleteTask(id, devId)                        │
│  + listTasks(filter, devId)                     │
│  + aggregateTeamTasks(filter)                   │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   AliceProvider BobProvider CharlieProvider
   (Isolated)    (Isolated)   (Isolated)
```

## Usage

### Basic Setup

```javascript
const { MultiDeveloperProvider } = require('@flowforge/providers');
const { JsonProvider } = require('@flowforge/providers');

// Create base provider template
const baseProvider = new JsonProvider({
    name: 'json-base',
    type: 'json',
    filePath: '/path/to/base/tasks.json'
}, logger);

// Configure team settings
const teamConfig = {
    developersDir: '/home/user/.flowforge/users',
    currentDeveloper: 'alice',
    team: {
        members: ['alice', 'bob', 'charlie'],
        lead: 'alice'
    }
};

// Initialize multi-developer provider
const multiProvider = new MultiDeveloperProvider(baseProvider, teamConfig);
```

### Creating Tasks

```javascript
// Create task for specific developer
const result = await multiProvider.createTask({
    title: 'Implement feature X',
    description: 'Add new functionality',
    priority: 'high',
    status: 'todo'
}, 'alice');

if (result.success) {
    console.log('Task created:', result.data.id);
}
```

### Updating Tasks

```javascript
// Update task (requires ownership)
const updateResult = await multiProvider.updateTask(
    taskId,
    { status: 'in_progress' },
    'alice'  // Must be task owner
);

if (!updateResult.success) {
    console.error('Update failed:', updateResult.error.message);
}
```

### Team Aggregation

```javascript
// Get all team tasks
const teamTasks = await multiProvider.listTasks(
    { scope: 'team' },
    'alice'
);

// Filter team tasks
const highPriorityTasks = await multiProvider.aggregateTeamTasks({
    priority: 'high',
    status: 'in_progress'
});

// Sort team tasks
const sortedTasks = await multiProvider.aggregateTeamTasks({
    sortBy: 'createdAt',
    order: 'desc'
});
```

### Individual Developer View

```javascript
// Get only Alice's tasks
const aliceTasks = await multiProvider.listTasks(
    {}, // No special filters
    'alice'
);

// Get specific provider instance
const aliceProvider = await multiProvider.getProviderForDeveloper('alice');
const tasks = await aliceProvider.listTasks({});
```

## Configuration

### Team Configuration Structure

```javascript
{
    developersDir: string,      // Base directory for developer namespaces
    currentDeveloper: string,   // Active developer ID
    team: {
        members: string[],       // Array of developer IDs
        lead: string            // Team lead developer ID
    }
}
```

### Provider Isolation

Each developer gets:
- Isolated storage path: `{developersDir}/{devId}/tasks/`
- Separate provider instance
- Independent task namespace
- Own configuration

## Features

### 1. Developer Isolation

- Each developer's tasks are stored separately
- No cross-contamination of data
- Independent provider instances
- Isolated file storage

### 2. Team Visibility

- Aggregate view of all team members' tasks
- Filter across team data
- Sort combined results
- Deduplicated task lists

### 3. Ownership Verification

- Only task creators can update/delete
- Automatic permission checking
- Clear error messages for permission failures

### 4. Performance Optimization

- Provider instance caching
- Team aggregation caching (5-second TTL)
- Automatic stale provider cleanup
- Efficient deduplication

### 5. Error Handling

- Graceful degradation on provider failures
- Automatic reconnection attempts
- Comprehensive error logging
- Fallback mechanisms

## Advanced Usage

### Custom Providers

```javascript
// Use any TaskProvider implementation
const customProvider = new CustomProvider(config);
const multiProvider = new MultiDeveloperProvider(
    customProvider,
    teamConfig
);
```

### Cache Management

```javascript
// Manual cache cleanup
await multiProvider.cleanupStaleProviders();

// Invalidate team cache
multiProvider.invalidateTeamCache();
```

### Task Reassignment

```javascript
// Alice creates task
const task = await multiProvider.createTask(
    { title: 'Task', assignee: 'alice' },
    'alice'
);

// Alice reassigns to Bob (still in Alice's namespace)
await multiProvider.updateTask(
    task.data.id,
    { assignee: 'bob' },
    'alice'
);
```

## Best Practices

1. **Always specify developer ID**: Don't rely on defaults
2. **Check operation results**: Handle errors gracefully
3. **Use team scope judiciously**: Can be performance intensive
4. **Cache providers**: Reuse provider instances when possible
5. **Clean up resources**: Disconnect providers when done

## Testing

### Unit Testing

```javascript
// Mock provider for testing
class MockProvider extends TaskProvider {
    constructor(config, logger) {
        super(config, logger);
        this.tasks = new Map();
    }

    validateConfig() {
        return { valid: true, errors: [] };
    }

    // Implement required methods...
}

// Test isolation
const multiProvider = new MultiDeveloperProvider(
    new MockProvider(config, logger),
    teamConfig
);
```

### Integration Testing

```javascript
// Test with real JsonProvider
const baseProvider = new JsonProvider(config, logger);
const multiProvider = new MultiDeveloperProvider(
    baseProvider,
    teamConfig
);

// Verify file creation
const result = await multiProvider.createTask(task, 'alice');
const filePath = path.join(developersDir, 'alice', 'tasks', 'tasks.json');
expect(fs.existsSync(filePath)).toBe(true);
```

## Migration Guide

### From Single Provider

Before:
```javascript
const provider = new JsonProvider(config);
await provider.createTask(taskData);
```

After:
```javascript
const multiProvider = new MultiDeveloperProvider(baseProvider, teamConfig);
await multiProvider.createTask(taskData, developerId);
```

### From Manual Isolation

Before:
```javascript
// Manual provider per developer
const aliceProvider = new JsonProvider(aliceConfig);
const bobProvider = new JsonProvider(bobConfig);
```

After:
```javascript
// Automatic isolation
const multiProvider = new MultiDeveloperProvider(baseProvider, teamConfig);
// Providers created on-demand
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Verify developer owns the task
   - Check developer ID is correct
   - Ensure task exists in developer's namespace

2. **Missing Tasks in Team View**
   - Check team.members configuration
   - Verify providers are connected
   - Check cache invalidation

3. **Provider Connection Failures**
   - Verify base directory exists
   - Check file permissions
   - Review provider logs

### Debug Logging

```javascript
// Enable detailed logging
const logger = {
    debug: console.log,
    info: console.log,
    warn: console.warn,
    error: console.error
};

const multiProvider = new MultiDeveloperProvider(
    baseProvider,
    teamConfig
);
```

## Performance Considerations

- **Provider Caching**: Max 5 cached providers by default
- **Team Cache**: 5-second TTL for aggregated data
- **File I/O**: Each provider may perform disk operations
- **Memory Usage**: Scales with number of active developers

## Security

- **Task Isolation**: Developers cannot modify others' tasks
- **Namespace Separation**: File-level isolation per developer
- **Permission Checks**: Every write operation verified
- **No Cross-Contamination**: Separate provider instances

## Future Enhancements

1. **Configurable cache policies**
2. **Bulk operations support**
3. **Cross-developer task sharing**
4. **Advanced permission models**
5. **Real-time synchronization**
6. **Conflict resolution strategies**

## API Reference

See [API Documentation](./api/MultiDeveloperProvider.md) for complete method signatures and return types.

---

*Last updated: 2025-01-16*
*Version: 2.0.0*
*Issue: #543*