# 🗺️ Field Mapping Config Templates for Team Deployment

## Overview
Pre-built configuration templates for Monday deployment to 6 developers with different Notion database schemas.

## Template 1: Standard Task Management
**Target**: Traditional project management with status, priority, assignee
```json
{
  "name": "standard-task-management",
  "provider": "notion",
  "schema": {
    "title": {
      "source": "properties.Name.title[0].text.content",
      "target": "flowforge.title",
      "type": "string",
      "required": true,
      "bidirectional": true
    },
    "status": {
      "source": "properties.Status.select.name",
      "target": "flowforge.status",
      "type": "select",
      "required": true,
      "bidirectional": true,
      "valueMapping": {
        "Not started": "pending",
        "In progress": "in-progress", 
        "Done": "completed",
        "Blocked": "blocked"
      }
    },
    "priority": {
      "source": "properties.Priority.select.name",
      "target": "flowforge.priority",
      "type": "select",
      "bidirectional": true,
      "valueMapping": {
        "High": "high",
        "Medium": "medium",
        "Low": "low",
        "Critical": "critical"
      }
    },
    "assignee": {
      "source": "properties.Assignee.people[0].name",
      "target": "flowforge.assignee",
      "type": "person",
      "bidirectional": true
    }
  }
}
```

## Template 2: Kanban-Style Workflow
**Target**: Visual workflow with stages
```json
{
  "name": "kanban-workflow",
  "provider": "notion",
  "schema": {
    "title": {
      "source": "properties.Task.title[0].text.content",
      "target": "flowforge.title",
      "type": "string",
      "required": true,
      "bidirectional": true
    },
    "status": {
      "source": "properties.Stage.select.name",
      "target": "flowforge.status",
      "type": "select",
      "required": true,
      "bidirectional": true,
      "valueMapping": {
        "Backlog": "pending",
        "Ready": "ready",
        "Doing": "in-progress",
        "Review": "review",
        "Done": "completed"
      }
    },
    "effort": {
      "source": "properties.Effort.number",
      "target": "flowforge.estimatedHours", 
      "type": "number",
      "bidirectional": true
    }
  }
}
```

## Template 3: Engineering Sprint Schema
**Target**: Agile development with sprints, story points
```json
{
  "name": "engineering-sprint",
  "provider": "notion",
  "schema": {
    "title": {
      "source": "properties.Story.title[0].text.content",
      "target": "flowforge.title",
      "type": "string",
      "required": true,
      "bidirectional": true
    },
    "status": {
      "source": "properties.Status.select.name", 
      "target": "flowforge.status",
      "type": "select",
      "required": true,
      "bidirectional": true,
      "valueMapping": {
        "Todo": "pending",
        "In Progress": "in-progress",
        "Code Review": "review", 
        "Testing": "testing",
        "Done": "completed"
      }
    },
    "storyPoints": {
      "source": "properties.Points.number",
      "target": "flowforge.estimatedHours",
      "type": "number",
      "transform": "multiply_by_8",
      "bidirectional": true
    },
    "sprint": {
      "source": "properties.Sprint.select.name",
      "target": "flowforge.milestone",
      "type": "string",
      "bidirectional": true
    }
  }
}
```

## Template 4: Content Creation Workflow
**Target**: Content production with review stages
```json
{
  "name": "content-creation",
  "provider": "notion", 
  "schema": {
    "title": {
      "source": "properties.Content.title[0].text.content",
      "target": "flowforge.title",
      "type": "string",
      "required": true,
      "bidirectional": true
    },
    "status": {
      "source": "properties.Production Stage.select.name",
      "target": "flowforge.status", 
      "type": "select",
      "required": true,
      "bidirectional": true,
      "valueMapping": {
        "Ideation": "pending",
        "Drafting": "in-progress",
        "Review": "review",
        "Published": "completed"
      }
    },
    "contentType": {
      "source": "properties.Type.multi_select",
      "target": "flowforge.tags",
      "type": "array",
      "transform": "extract_names",
      "bidirectional": true
    }
  }
}
```

## Template 5: Client Project Management
**Target**: Client work with billing, deadlines
```json
{
  "name": "client-projects",
  "provider": "notion",
  "schema": {
    "title": {
      "source": "properties.Project.title[0].text.content", 
      "target": "flowforge.title",
      "type": "string",
      "required": true,
      "bidirectional": true
    },
    "status": {
      "source": "properties.Project Status.select.name",
      "target": "flowforge.status",
      "type": "select", 
      "required": true,
      "bidirectional": true,
      "valueMapping": {
        "Proposal": "pending",
        "Active": "in-progress",
        "Client Review": "review",
        "Completed": "completed",
        "On Hold": "blocked"
      }
    },
    "client": {
      "source": "properties.Client.relation[0].name",
      "target": "flowforge.assignee",
      "type": "string",
      "bidirectional": true
    },
    "deadline": {
      "source": "properties.Due Date.date.start",
      "target": "flowforge.dueDate",
      "type": "date",
      "bidirectional": true
    }
  }
}
```

## Template 6: Minimalist Task Tracking
**Target**: Simple setup with minimal fields
```json
{
  "name": "minimalist-tracking",
  "provider": "notion",
  "schema": {
    "title": {
      "source": "properties.Name.title[0].text.content",
      "target": "flowforge.title", 
      "type": "string",
      "required": true,
      "bidirectional": true
    },
    "status": {
      "source": "properties.Done.checkbox",
      "target": "flowforge.status",
      "type": "boolean",
      "bidirectional": true,
      "valueMapping": {
        "true": "completed",
        "false": "pending"
      }
    },
    "notes": {
      "source": "properties.Notes.rich_text[0].text.content",
      "target": "flowforge.description",
      "type": "string",
      "bidirectional": true
    }
  }
}
```

## Implementation Notes

### Sunday Priority Order:
1. **Template 1 (Standard)** - Most common, implement first
2. **Template 6 (Minimalist)** - Simplest fallback
3. **Template 2 (Kanban)** - Popular visual workflow
4. **Templates 3-5** - Time permitting

### Validation Requirements:
- JSON schema validation for each template
- Field path validation against Notion API
- Transformation function testing
- Bidirectional mapping verification

### Deployment Strategy:
- Create one config file per developer
- Include setup instructions for each template
- Provide validation script to test connectivity
- Document customization options

### Fallback Options:
- If custom schema: Manual field mapping with support
- If API issues: GitHub provider as backup
- If time constraints: Templates 1 & 6 only

---

**Next Steps for Sunday:**
1. Implement Notion provider MVP (9 AM - 3 PM)
2. Create these 6 config templates (3 PM - 7 PM)
3. Test with real Notion databases
4. Document setup process for each template