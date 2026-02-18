# NotionUserFilter API Documentation

## Overview

The `NotionUserFilter` class enables automatic user identification and task filtering for team Notion databases. This feature was implemented as part of Issue #231 for the emergency 6-developer team deployment, allowing multiple developers to share a single Notion database while each developer only sees their assigned tasks.

## Key Features

- **Automatic User Identification**: Automatically identifies the current user from the Notion API key
- **Task Filtering**: Filters tasks to show only those assigned to the current user
- **Multiple Modes**: Supports auto, manual, and off modes for different scenarios
- **Team Workspace Support**: Allows multiple developers to use the same database
- **Performance Optimization**: Includes user caching to minimize API calls
- **Flexible Matching**: Matches users by name, email, or Notion ID

## Configuration

### Provider Settings

Add these settings to your Notion provider configuration:

```javascript
{
  type: 'notion',
  name: 'team-notion',
  enabled: true,
  settings: {
    apiKey: 'secret_xxx',
    databaseId: 'database-id',
    assigneeField: 'Assignee',  // Field name for assignee
    
    // User filter configuration
    userFilter: 'auto',          // 'auto' | 'manual' | 'off'
    manualUser: 'Jane Developer', // For manual mode
    userCacheTTL: 3600000        // Cache TTL in ms (default: 1 hour)
  }
}
```

## Usage Modes

### Auto Mode

Automatically identifies the current user from the API key and filters tasks:

```javascript
// Configuration
{
  userFilter: 'auto'
}

// Result: Tasks are automatically filtered to show only those assigned to the API key owner
```

### Manual Mode

Manually specify which user's tasks to show:

```javascript
// Configuration
{
  userFilter: 'manual',
  manualUser: 'John Developer'
}

// Result: Only tasks assigned to "John Developer" are shown
```

### Off Mode

Disables user filtering, showing all tasks:

```javascript
// Configuration
{
  userFilter: 'off'
}

// Result: All tasks in the database are shown
```

## API Reference

### Class: NotionUserFilter

#### Constructor

```typescript
constructor(
  client: Client,
  config: NotionProviderConfig,
  logger: Logger
)
```

#### Methods

##### getCurrentUser()

Gets the current authenticated user from Notion API.

```typescript
async getCurrentUser(): AsyncResult<UserIdentification>
```

**Returns:**
- `UserIdentification` object with id, name, email, and type

##### enhanceFilterWithUser()

Enhances a TaskFilter with user filtering based on mode.

```typescript
async enhanceFilterWithUser(
  filter: TaskFilter,
  mode?: UserFilterMode,
  manualUser?: string
): Promise<TaskFilter>
```

**Parameters:**
- `filter`: Original filter to enhance
- `mode`: Optional override for filter mode
- `manualUser`: Optional manual user for manual mode

**Returns:**
- Enhanced TaskFilter with user filtering applied

##### enhanceNotionFilterWithUser()

Enhances a Notion database query with user filtering.

```typescript
async enhanceNotionFilterWithUser(
  query: QueryDatabaseParameters,
  mode?: UserFilterMode,
  manualUser?: string
): Promise<QueryDatabaseParameters>
```

**Parameters:**
- `query`: Original Notion query
- `mode`: Optional override for filter mode
- `manualUser`: Optional manual user for manual mode

**Returns:**
- Enhanced query with user filter conditions

##### setMode()

Sets the filter mode dynamically.

```typescript
setMode(mode: UserFilterMode, manualUser?: string): void
```

**Parameters:**
- `mode`: New filter mode ('auto', 'manual', or 'off')
- `manualUser`: User for manual mode

##### clearUserCache()

Clears the cached user information.

```typescript
clearUserCache(): void
```

## Team Scenarios

### Scenario 1: Individual Developer

Each developer uses their own API key:

```javascript
// Developer 1 config
{
  apiKey: 'john_api_key',
  userFilter: 'auto'
}
// Sees only John's tasks

// Developer 2 config
{
  apiKey: 'jane_api_key',
  userFilter: 'auto'
}
// Sees only Jane's tasks
```

### Scenario 2: Team Lead Overview

Team lead wants to see all team tasks:

```javascript
{
  apiKey: 'lead_api_key',
  userFilter: 'off'
}
// Sees all tasks in database
```

### Scenario 3: Manager Review

Manager wants to review specific developer's work:

```javascript
{
  apiKey: 'manager_api_key',
  userFilter: 'manual',
  manualUser: 'Junior Developer'
}
// Sees only Junior Developer's tasks
```

## Integration with NotionProviderCore

The NotionUserFilter is automatically integrated into NotionProviderCore:

```javascript
// Access the user filter
const userFilter = notionProvider.getUserFilter();

// Change mode dynamically
notionProvider.setUserFilterMode('manual', 'Team Member');

// Clear cache if needed
userFilter.clearUserCache();
```

## Performance Considerations

1. **User Caching**: User information is cached to minimize API calls
2. **Cache TTL**: Default 1 hour, configurable via `userCacheTTL`
3. **Batch Operations**: Multiple operations share the same cached user
4. **Flexible Matching**: Uses multiple identifiers for robust matching

## Error Handling

The NotionUserFilter handles errors gracefully:

- API failures in auto mode fall back to unfiltered results
- Invalid configurations default to 'off' mode
- All errors are logged for debugging

## Testing

Comprehensive test suite included:

```bash
npm test src/providers/notion/NotionUserFilter.test.ts
```

Test coverage includes:
- User identification (person and bot users)
- All filter modes (auto, manual, off)
- Team workspace scenarios
- Caching and performance
- Error handling

## Migration Guide

For teams migrating to shared Notion databases:

1. **Each developer** creates their own Notion integration
2. **Configure FlowForge** with individual API keys
3. **Set userFilter to 'auto'** for automatic filtering
4. **Assign tasks** using the configured assignee field
5. **Start working** - each developer sees only their tasks

## Troubleshooting

### Tasks not filtering

1. Check the `assigneeField` matches your Notion database
2. Verify tasks have assignees set
3. Check API key has proper permissions
4. Review logs for user identification errors

### Wrong user identified

1. Verify API key belongs to correct user
2. Clear cache with `clearUserCache()`
3. Check Notion integration settings

### Performance issues

1. Increase `userCacheTTL` for less frequent API calls
2. Use manual mode if user doesn't change
3. Consider database indexing on assignee field

## Support

For issues or questions:
- GitHub Issues: #231
- Team deployment support
- Emergency hotfix procedures