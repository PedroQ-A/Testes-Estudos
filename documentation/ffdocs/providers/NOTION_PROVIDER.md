# FlowForge v2.0 Notion Provider Documentation

## Overview

The FlowForge Notion Provider enables seamless integration between FlowForge task management and Notion databases. This provider transforms your existing Notion workspace into a powerful development workflow hub, supporting configurable field mappings for different team structures and methodologies.

### Key Features

- **Configurable Field Mappings**: 6 pre-configured schemas for different workflows
- **Full CRUD Operations**: Create, read, update, and delete tasks in Notion
- **Microtask Support**: Sub-tasks as Notion todo blocks
- **Time Tracking**: Session tracking via Notion comments
- **Real-time Sync**: Bidirectional synchronization with FlowForge
- **Multi-User Support**: Team collaboration with proper assignee handling
- **Search & Filtering**: Advanced task discovery and filtering
- **Status & Priority Mapping**: Flexible status and priority value mapping

### Why Notion Provider?

For FlowForge v2.0's Monday deployment to 6 developers, the Notion Provider addresses a critical need: **developer choice in task management tools**. Each developer can maintain their preferred Notion database structure while still participating in the unified FlowForge workflow.

## Quick Start

### 1. Notion API Setup

1. **Create a Notion Integration**:
   - Go to [Notion Developers](https://developers.notion.com/)
   - Click "New Integration"
   - Name it "FlowForge Integration"
   - Select your workspace
   - Copy the API key

2. **Share Database with Integration**:
   - Open your Notion database
   - Click "Share" → "Invite"
   - Add your integration by name
   - Grant "Edit" permissions

3. **Get Database ID**:
   - Copy the database URL: `https://notion.so/workspace/DATABASE_ID?v=...`
   - Extract the DATABASE_ID portion (32-character string)

### 2. FlowForge Configuration

Add to your `.flowforge/config.yml`:

```yaml
providers:
  - name: "my-notion"
    type: "notion"
    enabled: true
    priority: 1
    settings:
      apiKey: "secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      databaseId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      fieldMappingConfig: "default"  # Choose from 6 configurations
```

### 3. Test Connection

```bash
./run_ff_command.sh flowforge:provider:test my-notion
```

## Field Mapping Configurations

FlowForge v2.0 includes 6 pre-configured field mappings to match different Notion database schemas:

### 1. Default (Standard FlowForge)

**Use Case**: Teams new to FlowForge or creating fresh Notion databases

```json
{
  "title": "Name",
  "status": "Status",
  "priority": "Priority",
  "assignee": "Assignee",
  "description": "Description",
  "estimatedHours": "Estimated Hours",
  "actualHours": "Actual Hours",
  "labels": "Labels",
  "milestone": "Milestone"
}
```

**Status Values**: Ready → In Progress → Completed → Blocked → Cancelled
**Priority Values**: Low → Medium → High → Critical

### 2. Agile/Scrum

**Use Case**: Scrum teams with existing sprint management setups

```json
{
  "title": "User Story",
  "status": "Sprint Status", 
  "priority": "Story Points",
  "assignee": "Developer",
  "description": "Acceptance Criteria",
  "estimatedHours": "Story Points",
  "actualHours": "Velocity",
  "labels": "Epic",
  "milestone": "Sprint"
}
```

**Status Values**: Backlog → In Sprint → Done → Impediment → Removed
**Priority Values**: 1 → 3 → 5 → 8 (Story Points)

### 3. Project Management

**Use Case**: Traditional project management with phases and deliverables

```json
{
  "title": "Task Name",
  "status": "Task Status",
  "priority": "Importance", 
  "assignee": "Owner",
  "description": "Task Details",
  "estimatedHours": "Duration (Hours)",
  "actualHours": "Time Spent",
  "labels": "Category",
  "milestone": "Project Phase"
}
```

**Status Values**: Not Started → Working → Complete → On Hold → Canceled
**Priority Values**: Low → Normal → High → Urgent

### 4. Kanban

**Use Case**: Teams using simple Kanban workflows

```json
{
  "title": "Card Title",
  "status": "Column",
  "priority": "Priority Level",
  "assignee": "Assigned To", 
  "description": "Card Description",
  "estimatedHours": "Estimate",
  "actualHours": "Actual Time",
  "labels": "Tags",
  "milestone": "Release"
}
```

**Status Values**: To Do → Doing → Done → Blocked → Archived
**Priority Values**: P3 → P2 → P1 → P0

### 5. Software Development

**Use Case**: Developer-focused bug tracking and feature development

```json
{
  "title": "Feature/Bug",
  "status": "Dev Status",
  "priority": "Severity",
  "assignee": "Engineer",
  "description": "Requirements", 
  "estimatedHours": "Est. Dev Hours",
  "actualHours": "Actual Dev Hours",
  "labels": "Component",
  "milestone": "Version"
}
```

**Status Values**: Open → In Development → Resolved → Needs Info → Won't Fix
**Priority Values**: Minor → Major → Critical → Blocker

### 6. Minimal

**Use Case**: Simple setups with minimal complexity

```json
{
  "title": "Title",
  "status": "Status",
  "priority": "Priority",
  "assignee": "Person",
  "description": "Notes",
  "estimatedHours": "Hours", 
  "actualHours": "Time",
  "labels": "Type",
  "milestone": "Goal"
}
```

**Status Values**: Todo → Doing → Done → Stuck → Skip
**Priority Values**: Low → Med → High → !!!!

## Configuration Examples

### Example 1: Scrum Team Setup

```yaml
# .flowforge/config.yml
providers:
  - name: "scrum-board"
    type: "notion"
    enabled: true
    priority: 1
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${NOTION_DATABASE_ID}"
      fieldMappingConfig: "agile-scrum"
      
# Required Notion database properties:
# - User Story (Title)
# - Sprint Status (Select)
# - Story Points (Select/Number)
# - Developer (Person)
# - Acceptance Criteria (Text)
# - Epic (Multi-select)
# - Sprint (Select)
```

### Example 2: Solo Developer Setup

```yaml
# .flowforge/config.yml
providers:
  - name: "dev-tasks"
    type: "notion"
    enabled: true
    priority: 1
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${NOTION_DATABASE_ID}"
      fieldMappingConfig: "software-development"

# Required Notion database properties:
# - Feature/Bug (Title)
# - Dev Status (Select) 
# - Severity (Select)
# - Engineer (Person)
# - Requirements (Text)
# - Est. Dev Hours (Number)
# - Component (Multi-select)
# - Version (Select)
```

### Example 3: Custom Field Mapping

For databases that don't match any pre-configured schema:

```yaml
providers:
  - name: "custom-notion"
    type: "notion" 
    enabled: true
    priority: 1
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${NOTION_DATABASE_ID}"
      fieldMappings:
        title: "My Task Name"
        status: "Current State"
        priority: "Urgency Level"
        assignee: "Responsible Person"
        description: "Full Description"
        estimatedHours: "Time Estimate"
        actualHours: "Time Logged"
        labels: "Categories"
        milestone: "Target Release"
      statusMapping:
        ready: "Todo"
        in-progress: "Working On It"
        completed: "Finished"
        blocked: "Waiting"
        cancelled: "Dropped"
      priorityMapping:
        low: "Can Wait"
        medium: "Normal"
        high: "Important"
        critical: "Drop Everything"
```

## API Reference

### NotionProvider Class

The `NotionProvider` class extends `MappedTaskProvider` and implements the full FlowForge provider interface.

#### Constructor

```typescript
constructor(config: NotionProviderConfig, logger: Logger)
```

**Parameters**:
- `config`: Provider configuration including Notion API credentials and field mappings
- `logger`: FlowForge logger instance

#### Connection Methods

##### connect()
```typescript
async connect(): AsyncResult<void>
```
Establishes connection to Notion API and validates database access.

##### disconnect()
```typescript  
async disconnect(): AsyncResult<void>
```
Closes connection (mainly for cleanup and event emission).

##### isAvailable()
```typescript
async isAvailable(): Promise<boolean>
```
Checks if Notion database is accessible.

#### Task Operations

##### createTask()
```typescript
async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'provider'>): AsyncResult<Task>
```
Creates a new task in the Notion database.

**Example**:
```typescript
const newTask = {
  title: "Implement user authentication",
  description: "Add JWT-based authentication system", 
  status: "ready",
  priority: "high",
  assignee: "john@example.com",
  labels: ["backend", "security"],
  estimatedHours: 8
};

const result = await notionProvider.createTask(newTask);
if (result.success) {
  console.log('Created task:', result.data.id);
}
```

##### getTask()
```typescript
async getTask(id: string): AsyncResult<Task>
```
Retrieves a specific task by Notion page ID.

##### updateTask()
```typescript
async updateTask(id: string, updates: Partial<Task>): AsyncResult<Task>
```
Updates task properties in Notion.

**Example**:
```typescript
const updates = {
  status: "in-progress",
  actualHours: 3
};

const result = await notionProvider.updateTask(pageId, updates);
```

##### deleteTask()
```typescript
async deleteTask(id: string): AsyncResult<void>
```
Archives the task in Notion (Notion doesn't support hard deletion).

##### listTasks()
```typescript
async listTasks(filter?: TaskFilter): AsyncResult<Task[]>
```
Lists tasks with optional filtering.

**Example**:
```typescript
const filter = {
  status: "in-progress",
  assignee: "john@example.com",
  limit: 10
};

const result = await notionProvider.listTasks(filter);
```

##### searchTasks()
```typescript
async searchTasks(query: string, filter?: TaskFilter): AsyncResult<Task[]>
```
Searches tasks using Notion's search API.

#### Microtask Operations

##### addMicrotask()
```typescript
async addMicrotask(taskId: string, microtask: Omit<Microtask, 'id' | 'taskId' | 'createdAt'>): AsyncResult<Microtask>
```
Adds a sub-task as a todo block in the Notion page.

##### updateMicrotask()
```typescript
async updateMicrotask(taskId: string, microtaskId: string, updates: Partial<Microtask>): AsyncResult<Microtask>
```
Updates microtask completion status or description.

##### deleteMicrotask()
```typescript
async deleteMicrotask(taskId: string, microtaskId: string): AsyncResult<void>
```
Removes a microtask block from the Notion page.

#### Time Tracking

##### startTimeTracking()
```typescript
async startTimeTracking(taskId: string, user: string, instanceId: string): AsyncResult<TimeSession>
```
Starts a time tracking session and adds a comment to the Notion page.

##### stopTimeTracking()
```typescript
async stopTimeTracking(taskId: string, sessionId: string): AsyncResult<TimeSession>
```
Stops time tracking and logs the duration.

#### Sync Operations

##### sync()
```typescript
async sync(): AsyncResult<SyncResult>
```
Synchronizes all tasks between FlowForge and Notion.

### Configuration Types

#### NotionProviderConfig
```typescript
interface NotionProviderConfig extends ProviderConfig {
  type: "notion";
  settings: {
    apiKey: string;
    databaseId: string;
    fieldMappingConfig?: string; // One of the 6 pre-configured options
    fieldMappings?: NotionFieldMappings; // Custom mappings
    statusMapping?: Record<TaskStatus, string>; // Custom status mapping
    priorityMapping?: Record<TaskPriority, string>; // Custom priority mapping
  };
}
```

#### NotionFieldMappings
```typescript
interface NotionFieldMappings {
  title?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  description?: string;
  estimatedHours?: string;
  actualHours?: string;
  labels?: string;
  milestone?: string;
  blockedReason?: string;
  issueNumber?: string;
  githubUrl?: string;
}
```

## Testing

### Unit Tests

Run the Notion provider test suite:

```bash
npm test src/providers/notion/NotionProvider.test.ts
```

### Integration Tests  

Test with a real Notion database:

```bash
# Set environment variables
export NOTION_API_KEY="your-test-api-key"
export NOTION_DATABASE_ID="your-test-database-id"

# Run integration tests
npm run test:integration -- --testPathPattern=notion
```

### Manual Testing

#### Test Connection
```bash
./run_ff_command.sh flowforge:provider:test my-notion
```

#### Create Test Task
```bash
./run_ff_command.sh flowforge:task:create \
  --provider=my-notion \
  --title="Test Task" \
  --status=ready \
  --priority=medium
```

#### List Tasks
```bash
./run_ff_command.sh flowforge:task:list --provider=my-notion
```

### Field Mapping Validation

Test your field mappings with the validation command:

```bash
./run_ff_command.sh flowforge:provider:validate my-notion
```

This command will:
1. Check if all mapped fields exist in your Notion database
2. Validate field types (Select, Multi-select, Number, etc.)
3. Verify status and priority values are available
4. Report any configuration issues

## Troubleshooting

### Common Issues

#### 1. "Invalid API Key" Error

**Symptoms**: Connection fails with authentication error
**Solutions**:
- Verify API key is correct (starts with `secret_`)
- Check integration has access to the workspace
- Ensure integration wasn't revoked

#### 2. "Database Not Found" Error

**Symptoms**: Database queries fail
**Solutions**:
- Verify database ID is correct (32-character UUID)
- Ensure database is shared with the integration
- Check integration has edit permissions

#### 3. Field Mapping Errors

**Symptoms**: Tasks created with missing or incorrect values
**Solutions**:
- Run field mapping validation
- Check field names match exactly (case-sensitive)
- Verify field types in Notion match expected types

#### 4. Status/Priority Value Mismatches

**Symptoms**: Status or priority values not updating correctly
**Solutions**:
- Check your Notion select field options
- Verify status/priority mappings in configuration
- Use custom mappings for non-standard values

#### 5. Rate Limiting

**Symptoms**: "rate_limited" errors during sync
**Solutions**:
- Reduce sync frequency
- Implement exponential backoff (already included)
- Contact Notion support for rate limit increases

### Debug Mode

Enable debug logging for detailed troubleshooting:

```yaml
# .flowforge/config.yml
logging:
  level: "debug"
  providers:
    notion: "trace"
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `unauthorized` | Invalid API key | Check integration setup |
| `object_not_found` | Database/page not found | Verify IDs and permissions |
| `validation_error` | Invalid request format | Check field mappings |
| `rate_limited` | Too many requests | Implement delays |
| `internal_server_error` | Notion API issue | Retry or contact support |

### Support Resources

1. **Notion API Documentation**: https://developers.notion.com/docs
2. **FlowForge GitHub Issues**: Report provider-specific bugs
3. **Community Discord**: Get help from other users
4. **Debug Logs**: Always include debug logs with support requests

## Advanced Configuration

### Environment Variables

For secure credential management:

```bash
# .env
NOTION_API_KEY=secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NOTION_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# .flowforge/config.yml
providers:
  - name: "my-notion"
    type: "notion"
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${NOTION_DATABASE_ID}"
```

### Multiple Notion Databases

Configure multiple databases for different projects:

```yaml
providers:
  - name: "project-a-notion"
    type: "notion"
    enabled: true
    priority: 1
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${PROJECT_A_DATABASE_ID}"
      fieldMappingConfig: "agile-scrum"
      
  - name: "project-b-notion" 
    type: "notion"
    enabled: true
    priority: 2
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${PROJECT_B_DATABASE_ID}"
      fieldMappingConfig: "software-development"
```

### Webhook Integration (Future)

FlowForge v2.1 will include webhook support for real-time updates:

```yaml
# Future configuration
providers:
  - name: "my-notion"
    type: "notion"
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${NOTION_DATABASE_ID}"
      webhooks:
        enabled: true
        endpoint: "https://your-domain.com/flowforge/webhooks/notion"
        secret: "${WEBHOOK_SECRET}"
```

## Best Practices

### 1. Database Structure

**Recommended Notion database setup**:
- Use consistent field types (Select for status/priority)
- Include all mapped fields even if optional
- Set up proper select field options
- Use templates for new pages

### 2. Field Naming

**Guidelines**:
- Use descriptive field names
- Avoid special characters and spaces in field names
- Be consistent across databases
- Document your field purposes

### 3. Status Management

**Best practices**:
- Limit status options to prevent confusion
- Use clear, actionable status names
- Map statuses logically to FlowForge states
- Consider workflow progression

### 4. Priority Handling

**Recommendations**:
- Use consistent priority scales across teams
- Consider using numbers for objective prioritization
- Map business priority to development urgency
- Document priority criteria

### 5. Performance Optimization

**Tips**:
- Use filters to limit sync scope
- Implement pagination for large databases
- Cache frequently accessed data
- Monitor API usage

### 6. Security

**Important considerations**:
- Use environment variables for API keys
- Limit integration permissions to minimum required
- Regularly audit integration access
- Use separate integrations for different environments

## Migration Guide

### From Notion Manual Process

If you're currently managing tasks manually in Notion:

1. **Prepare Your Database**:
   - Add required fields if missing
   - Standardize status/priority values
   - Clean up inconsistent data

2. **Choose Configuration**:
   - Select matching pre-configured schema
   - Or create custom field mappings

3. **Test Migration**:
   - Start with read-only operations
   - Verify field mappings work correctly
   - Test with small subset of tasks

4. **Full Migration**:
   - Enable full CRUD operations
   - Sync existing tasks
   - Train team on new workflow

### From Other Tools

Migrating from GitHub Issues, Jira, or other tools:

1. **Export existing data**
2. **Import to Notion** using CSV or API
3. **Configure FlowForge** with appropriate schema
4. **Sync and validate** data consistency
5. **Update team workflows**

## Changelog

### v2.0.0 (Current)
- Initial Notion provider implementation
- 6 pre-configured field mapping schemas
- Full CRUD operations support
- Microtask integration via todo blocks
- Time tracking via comments
- Comprehensive error handling
- Rate limiting and retry logic

### Planned for v2.1.0
- Real-time webhook support
- Advanced filtering options
- Bulk operations optimization
- Custom field type support
- Team synchronization features
- Performance monitoring dashboard

---

**Next Steps**: 
- See [Quick Setup Guide](../getting-started/notion-setup.md) for immediate configuration
- Review [API Examples](../examples/notion-api-usage.md) for implementation details
- Check [Team Onboarding](../team/notion-team-setup.md) for multi-developer deployments