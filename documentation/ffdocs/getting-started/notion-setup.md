# FlowForge Notion Provider Quick Setup

## 5-Minute Setup Guide

This guide will get you connected to Notion in under 5 minutes. Perfect for Monday's v2.0 deployment to 6 developers.

## Prerequisites

- FlowForge v2.0 installed
- Notion workspace with a task database
- 5 minutes of your time

## Step 1: Notion API Setup (2 minutes)

### 1.1 Create Integration

1. **Go to Notion Developers**: https://developers.notion.com/
2. **Click "New Integration"**
3. **Fill out the form**:
   - Name: `FlowForge Integration`
   - Logo: (optional)
   - Workspace: Select your workspace
4. **Click "Submit"**
5. **Copy the API Key**: Starts with `secret_`

### 1.2 Share Your Database

1. **Open your task database in Notion**
2. **Click "Share" button** (top right)
3. **Click "Invite"**
4. **Add your integration**: Search for "FlowForge Integration"
5. **Set permissions to "Edit"**
6. **Click "Invite"**

### 1.3 Get Database ID

From your database URL: `https://notion.so/workspace/DATABASE_ID?v=...`

Copy the `DATABASE_ID` part (32 characters, like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

## Step 2: Choose Your Schema (1 minute)

Pick the configuration that matches your Notion database:

### Quick Schema Selector

**Check your database and pick the closest match:**

| Your Database Uses | Choose Schema | Example Fields |
|-------------------|---------------|----------------|
| Standard task names | `default` | Name, Status, Priority, Assignee |
| User stories, sprints | `agile-scrum` | User Story, Sprint Status, Story Points |
| Traditional PM | `project-management` | Task Name, Task Status, Importance |
| Simple kanban | `kanban` | Card Title, Column, Priority Level |
| Bug tracking | `software-development` | Feature/Bug, Dev Status, Severity |
| Minimal setup | `minimal` | Title, Status, Priority, Person |

**Can't decide?** Start with `default` - it works with most setups.

## Step 3: FlowForge Configuration (2 minutes)

### 3.1 Create Environment File

```bash
# Create .env file in your FlowForge directory
cat > .env << EOF
NOTION_API_KEY=secret_YOUR_API_KEY_HERE
NOTION_DATABASE_ID=your-database-id-here
EOF
```

### 3.2 Configure Provider

Add to your `.flowforge/config.yml`:

```yaml
providers:
  - name: "my-notion"
    type: "notion"
    enabled: true
    priority: 1
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${NOTION_DATABASE_ID}"
      fieldMappingConfig: "default"  # Change to your chosen schema
```

### 3.3 Test Connection

```bash
./run_ff_command.sh flowforge:provider:test my-notion
```

**Expected output:**
```
✅ Connected to Notion successfully
✅ Database access verified
✅ Field mappings validated
🎉 Notion provider ready!
```

## Schema-Specific Setup

### For Scrum Teams

If you chose `agile-scrum`, ensure your Notion database has these fields:

```yaml
# .flowforge/config.yml
providers:
  - name: "scrum-board"
    type: "notion"
    enabled: true
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${NOTION_DATABASE_ID}"
      fieldMappingConfig: "agile-scrum"
```

**Required Notion fields:**
- User Story (Title)
- Sprint Status (Select: Backlog, In Sprint, Done, Impediment, Removed)
- Story Points (Select: 1, 3, 5, 8)
- Developer (Person)
- Acceptance Criteria (Text)

### For Solo Developers

If you chose `software-development`:

```yaml
# .flowforge/config.yml  
providers:
  - name: "dev-tasks"
    type: "notion"
    enabled: true
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${NOTION_DATABASE_ID}"
      fieldMappingConfig: "software-development"
```

**Required Notion fields:**
- Feature/Bug (Title)
- Dev Status (Select: Open, In Development, Resolved, Needs Info, Won't Fix)
- Severity (Select: Minor, Major, Critical, Blocker)
- Engineer (Person)

## Quick Test

### Create Your First Task

```bash
./run_ff_command.sh flowforge:task:create \
  --provider=my-notion \
  --title="Test FlowForge Integration" \
  --status=ready \
  --priority=medium \
  --assignee="your-email@example.com"
```

### List Your Tasks

```bash
./run_ff_command.sh flowforge:task:list --provider=my-notion
```

### Start Working on a Task

```bash
# Find your task ID from the list above
./run_ff_command.sh flowforge:session:start TASK_ID
```

## Troubleshooting

### ❌ "Invalid API Key" Error

**Solution:**
1. Check your API key starts with `secret_`
2. Verify the integration exists in your workspace
3. Make sure you copied the entire key

### ❌ "Database Not Found" Error

**Solution:**
1. Verify database ID is correct (32 characters)
2. Ensure database is shared with your integration
3. Check integration has "Edit" permissions

### ❌ "Field Not Found" Error

**Solution:**
1. Check your schema selection matches your database
2. Run validation: `./run_ff_command.sh flowforge:provider:validate my-notion`
3. Try the `minimal` schema if others don't work

### ❌ "Rate Limited" Error

**Solution:**
1. Wait 60 seconds and try again
2. Reduce concurrent operations
3. This is normal for high usage

## Advanced Quick Setup

### Multiple Databases

For teams with multiple projects:

```yaml
providers:
  - name: "project-alpha"
    type: "notion"
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${ALPHA_DATABASE_ID}"
      fieldMappingConfig: "agile-scrum"
      
  - name: "project-beta"
    type: "notion"
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${BETA_DATABASE_ID}"
      fieldMappingConfig: "software-development"
```

### Custom Field Mapping

If none of the 6 schemas work:

```yaml
providers:
  - name: "custom-notion"
    type: "notion"
    settings:
      apiKey: "${NOTION_API_KEY}"
      databaseId: "${NOTION_DATABASE_ID}"
      fieldMappings:
        title: "Your Title Field"
        status: "Your Status Field"
        priority: "Your Priority Field"
        assignee: "Your Assignee Field"
      statusMapping:
        ready: "Your Ready Status"
        in-progress: "Your In Progress Status" 
        completed: "Your Completed Status"
```

## Monday Deployment Checklist

For the v2.0 deployment to 6 developers:

### Before Monday

- [ ] Each developer completes this 5-minute setup
- [ ] Test task creation and updates
- [ ] Verify time tracking works
- [ ] Share team configuration examples
- [ ] Document any custom field mappings

### Monday Morning

- [ ] Quick team standup on FlowForge+Notion workflow
- [ ] Everyone runs connection test
- [ ] Create first real tasks
- [ ] Start time tracking for work sessions
- [ ] Share any issues in team chat

### Success Metrics

By end of Monday:
- [ ] All 6 developers connected to Notion
- [ ] At least 10 tasks created across team
- [ ] Time tracking active for all work
- [ ] Zero manual task management needed

## Next Steps

1. **Read the full documentation**: [Notion Provider Docs](../providers/NOTION_PROVIDER.md)
2. **Join team configuration session**: Share configurations with teammates
3. **Set up team workflows**: Standardize on task creation and updates
4. **Monitor usage**: Check logs and performance

## Support

**Need help?**
- Run: `./run_ff_command.sh flowforge:help notion`
- Check: [Troubleshooting Guide](../providers/NOTION_PROVIDER.md#troubleshooting)
- Ask: Team lead or FlowForge community

---

**🎉 That's it! You're now connected to Notion with FlowForge v2.0**

Your development workflow just became seamless. Welcome to the future of developer productivity!