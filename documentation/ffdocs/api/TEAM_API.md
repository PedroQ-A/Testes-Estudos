# FlowForge Team API Documentation

## Overview

The FlowForge Team API provides comprehensive endpoints for managing multi-developer environments, team configuration, developer management, and aggregation queries. This API enables programmatic control over team workflows, productivity tracking, and collaborative features.

## Base Configuration

### API Base URL

```
Local: http://localhost:3000/api/v2/team
Production: https://api.flowforge.dev/v2/team
```

### Authentication

All Team API endpoints require authentication via Bearer token:

```http
Authorization: Bearer <team-api-token>
```

### Headers

```http
Content-Type: application/json
X-FlowForge-Version: 2.0
X-Team-ID: <team-identifier>
X-Developer-Namespace: <developer-namespace> # Optional for team-wide operations
```

## Team Configuration Endpoints

### GET /teams

List all accessible teams for the authenticated user.

**Request:**
```http
GET /api/v2/team/teams
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": "flowforge-demo-team",
        "name": "FlowForge Development Team",
        "created": "2025-09-16T00:00:00.000Z",
        "updated": "2025-09-16T12:00:00.000Z",
        "memberCount": 6,
        "role": "developer",
        "permissions": ["read", "write", "execute"],
        "status": "active"
      }
    ],
    "total": 1
  },
  "meta": {
    "timestamp": "2025-09-16T12:00:00.000Z",
    "version": "2.0"
  }
}
```

### GET /teams/{teamId}

Get detailed information about a specific team.

**Request:**
```http
GET /api/v2/team/teams/flowforge-demo-team
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "team": {
      "id": "flowforge-demo-team",
      "name": "FlowForge Development Team",
      "created": "2025-09-16T00:00:00.000Z",
      "updated": "2025-09-16T12:00:00.000Z",
      "developers": {
        "count": 6,
        "active": 5,
        "roles": {
          "lead": 1,
          "senior": 2,
          "developer": 3
        }
      },
      "provider": {
        "mode": "multi-developer",
        "strategy": "shared-database",
        "isolation": "namespace"
      },
      "features": {
        "crossDeveloperVisibility": true,
        "taskAssignment": true,
        "collaboration": true,
        "reporting": true
      }
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:00:00.000Z",
    "permissions": ["read", "write", "execute"]
  }
}
```

### POST /teams

Create a new team.

**Request:**
```http
POST /api/v2/team/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Development Team",
  "type": "software",
  "provider": {
    "mode": "multi-developer",
    "strategy": "shared-database"
  },
  "features": {
    "crossDeveloperVisibility": true,
    "taskAssignment": true,
    "collaboration": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "team": {
      "id": "new-dev-team",
      "name": "New Development Team",
      "created": "2025-09-16T12:00:00.000Z",
      "status": "active",
      "inviteCode": "NDT-2025-ABC123"
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:00:00.000Z",
    "action": "team_created"
  }
}
```

### PUT /teams/{teamId}

Update team configuration.

**Request:**
```http
PUT /api/v2/team/teams/flowforge-demo-team
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "FlowForge Advanced Team",
  "provider": {
    "sync": {
      "interval": 60000
    }
  },
  "features": {
    "reporting": {
      "frequency": "hourly"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "team": {
      "id": "flowforge-demo-team",
      "name": "FlowForge Advanced Team",
      "updated": "2025-09-16T12:05:00.000Z",
      "changes": [
        "name",
        "provider.sync.interval",
        "features.reporting.frequency"
      ]
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:05:00.000Z",
    "action": "team_updated"
  }
}
```

## Developer Management APIs

### GET /teams/{teamId}/developers

List all developers in a team.

**Request:**
```http
GET /api/v2/team/teams/flowforge-demo-team/developers?include=stats
Authorization: Bearer <token>
```

**Query Parameters:**
- `include`: Optional. Values: `stats`, `permissions`, `activity`
- `status`: Optional. Values: `active`, `inactive`, `all`
- `role`: Optional. Values: `developer`, `senior`, `lead`

**Response:**
```json
{
  "success": true,
  "data": {
    "developers": [
      {
        "id": "dev1",
        "name": "Developer 1",
        "email": "dev1@company.com",
        "github": "dev1-github",
        "namespace": "dev1",
        "role": "developer",
        "active": true,
        "registeredAt": "2025-09-16T00:00:00.000Z",
        "lastActivity": "2025-09-16T11:45:00.000Z",
        "permissions": ["read", "write", "execute"],
        "stats": {
          "tasksCompleted": 23,
          "hoursTracked": 156.5,
          "productivityScore": 8.7
        }
      },
      {
        "id": "dev2",
        "name": "Developer 2",
        "email": "dev2@company.com",
        "github": "dev2-github",
        "namespace": "dev2",
        "role": "senior",
        "active": true,
        "registeredAt": "2025-09-16T00:00:00.000Z",
        "lastActivity": "2025-09-16T11:50:00.000Z",
        "permissions": ["read", "write", "execute", "admin"],
        "stats": {
          "tasksCompleted": 31,
          "hoursTracked": 187.2,
          "productivityScore": 9.1
        }
      }
    ],
    "total": 6,
    "active": 5,
    "summary": {
      "totalTasks": 142,
      "totalHours": 876.3,
      "averageProductivity": 8.6
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:00:00.000Z",
    "includes": ["stats"]
  }
}
```

### POST /teams/{teamId}/developers

Add a new developer to the team.

**Request:**
```http
POST /api/v2/team/teams/flowforge-demo-team/developers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Developer",
  "email": "newdev@company.com",
  "github": "newdev-github",
  "role": "developer",
  "namespace": "newdev",
  "permissions": ["read", "write", "execute"],
  "preferences": {
    "notifications": true,
    "autoSync": true,
    "theme": "default"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "developer": {
      "id": "newdev",
      "name": "New Developer",
      "email": "newdev@company.com",
      "namespace": "newdev",
      "role": "developer",
      "active": true,
      "registeredAt": "2025-09-16T12:00:00.000Z",
      "apiKey": "sk_newdev_1234567890abcdef",
      "setupInstructions": "https://docs.flowforge.dev/team/setup"
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:00:00.000Z",
    "action": "developer_added"
  }
}
```

### PUT /teams/{teamId}/developers/{developerId}

Update developer information and permissions.

**Request:**
```http
PUT /api/v2/team/teams/flowforge-demo-team/developers/dev1
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "senior",
  "permissions": ["read", "write", "execute", "admin"],
  "preferences": {
    "notifications": false,
    "theme": "dark"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "developer": {
      "id": "dev1",
      "role": "senior",
      "permissions": ["read", "write", "execute", "admin"],
      "updated": "2025-09-16T12:05:00.000Z",
      "changes": ["role", "permissions", "preferences.notifications", "preferences.theme"]
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:05:00.000Z",
    "action": "developer_updated"
  }
}
```

### DELETE /teams/{teamId}/developers/{developerId}

Remove a developer from the team.

**Request:**
```http
DELETE /api/v2/team/teams/flowforge-demo-team/developers/dev1?preserve_data=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `preserve_data`: Optional. Whether to preserve developer's data for potential future restoration

**Response:**
```json
{
  "success": true,
  "data": {
    "removed": {
      "id": "dev1",
      "name": "Developer 1",
      "namespace": "dev1",
      "dataPreserved": true,
      "restorationPeriod": "30d"
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:10:00.000Z",
    "action": "developer_removed"
  }
}
```

## Aggregation Query APIs

### GET /teams/{teamId}/aggregation/productivity

Get team productivity aggregation.

**Request:**
```http
GET /api/v2/team/teams/flowforge-demo-team/aggregation/productivity?period=week&granularity=daily
Authorization: Bearer <token>
```

**Query Parameters:**
- `period`: `day`, `week`, `month`, `quarter`, `custom`
- `granularity`: `hourly`, `daily`, `weekly`
- `start_date`: ISO date (for custom period)
- `end_date`: ISO date (for custom period)
- `include_individual`: Boolean (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "type": "week",
      "start": "2025-09-09T00:00:00.000Z",
      "end": "2025-09-15T23:59:59.999Z"
    },
    "team": {
      "totalHours": 198.5,
      "tasksCompleted": 47,
      "averageProductivity": 8.4,
      "velocityPoints": 156
    },
    "daily": [
      {
        "date": "2025-09-09",
        "hours": 32.5,
        "tasks": 8,
        "productivity": 8.6
      },
      {
        "date": "2025-09-10",
        "hours": 38.2,
        "tasks": 9,
        "productivity": 8.1
      }
    ],
    "trends": {
      "hoursVsPrevious": "+12%",
      "tasksVsPrevious": "+8%",
      "productivityVsPrevious": "-2%"
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:00:00.000Z",
    "granularity": "daily"
  }
}
```

### GET /teams/{teamId}/aggregation/tasks

Get task aggregation data.

**Request:**
```http
GET /api/v2/team/teams/flowforge-demo-team/aggregation/tasks?status=all&group_by=assignee,priority
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: `open`, `completed`, `blocked`, `all`
- `priority`: `low`, `medium`, `high`, `critical`
- `group_by`: Comma-separated: `assignee`, `priority`, `status`, `project`
- `period`: Time period filter
- `include_time`: Include time tracking data

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 156,
      "open": 34,
      "inProgress": 12,
      "completed": 98,
      "blocked": 12
    },
    "byAssignee": {
      "dev1@company.com": {
        "total": 23,
        "completed": 18,
        "inProgress": 3,
        "blocked": 2
      },
      "dev2@company.com": {
        "total": 31,
        "completed": 28,
        "inProgress": 2,
        "blocked": 1
      }
    },
    "byPriority": {
      "critical": 5,
      "high": 23,
      "medium": 89,
      "low": 39
    },
    "timeData": {
      "totalHours": 876.3,
      "averagePerTask": 5.6,
      "efficiency": 0.87
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:00:00.000Z",
    "groupBy": ["assignee", "priority"]
  }
}
```

### GET /teams/{teamId}/aggregation/time-tracking

Get time tracking aggregation.

**Request:**
```http
GET /api/v2/team/teams/flowforge-demo-team/aggregation/time-tracking?period=month&billable_only=false
Authorization: Bearer <token>
```

**Query Parameters:**
- `period`: Time period (`day`, `week`, `month`, `quarter`)
- `billable_only`: Boolean (filter billable hours only)
- `developer`: Specific developer namespace
- `project`: Project filter
- `category`: Task category filter

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "type": "month",
      "start": "2025-09-01T00:00:00.000Z",
      "end": "2025-09-30T23:59:59.999Z"
    },
    "total": {
      "hours": 876.3,
      "billableHours": 654.8,
      "sessions": 234,
      "averageSessionLength": 3.7
    },
    "byDeveloper": {
      "dev1": {
        "hours": 156.5,
        "billableHours": 134.2,
        "sessions": 42,
        "efficiency": 0.89
      },
      "dev2": {
        "hours": 187.2,
        "billableHours": 165.1,
        "sessions": 38,
        "efficiency": 0.91
      }
    },
    "byProject": {
      "ProjectA": {
        "hours": 234.5,
        "developers": 3,
        "completion": 0.67
      },
      "ProjectB": {
        "hours": 189.3,
        "developers": 2,
        "completion": 0.45
      }
    },
    "billing": {
      "totalBillable": 654.8,
      "totalValue": 49110.00,
      "currency": "USD",
      "averageRate": 75.00
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:00:00.000Z",
    "includeBillable": true
  }
}
```

### POST /teams/{teamId}/aggregation/custom

Execute custom aggregation query.

**Request:**
```http
POST /api/v2/team/teams/flowforge-demo-team/aggregation/custom
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": {
    "metrics": ["tasks", "time", "productivity"],
    "dimensions": ["developer", "project", "priority"],
    "filters": {
      "dateRange": {
        "start": "2025-09-01",
        "end": "2025-09-15"
      },
      "status": ["completed", "inProgress"],
      "priority": ["high", "critical"]
    },
    "groupBy": ["developer", "week"],
    "orderBy": {
      "field": "productivity",
      "direction": "desc"
    },
    "limit": 50
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": {
      "executionTime": "234ms",
      "rowsReturned": 23,
      "totalRows": 156
    },
    "results": [
      {
        "developer": "dev2",
        "week": "2025-09-09",
        "tasks": 12,
        "hours": 38.5,
        "productivity": 9.2,
        "projects": ["ProjectA", "ProjectB"]
      },
      {
        "developer": "dev1",
        "week": "2025-09-09",
        "tasks": 9,
        "hours": 32.1,
        "productivity": 8.8,
        "projects": ["ProjectA"]
      }
    ],
    "aggregations": {
      "totalTasks": 147,
      "totalHours": 567.8,
      "averageProductivity": 8.6
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:00:00.000Z",
    "cacheKey": "custom_query_hash_12345"
  }
}
```

## Permission Model

### Role-Based Access Control

FlowForge implements a hierarchical permission model:

```json
{
  "roles": {
    "developer": {
      "permissions": [
        "team:read",
        "team.developers:read:self",
        "team.tasks:read:assigned",
        "team.tasks:write:assigned",
        "team.time:read:self",
        "team.time:write:self",
        "team.aggregation:read:limited"
      ],
      "description": "Standard developer with access to own data and assigned tasks"
    },
    "senior": {
      "inherits": "developer",
      "permissions": [
        "team.developers:read:all",
        "team.tasks:read:team",
        "team.tasks:assign",
        "team.aggregation:read:team",
        "team.mentoring:read"
      ],
      "description": "Senior developer with team visibility and mentoring capabilities"
    },
    "lead": {
      "inherits": "senior",
      "permissions": [
        "team:write",
        "team.developers:write",
        "team.developers:manage",
        "team.tasks:write:all",
        "team.aggregation:read:all",
        "team.aggregation:custom",
        "team.reports:generate",
        "team.billing:read"
      ],
      "description": "Team lead with full management access"
    }
  }
}
```

### Permission Scopes

1. **Self Scope**: Access to own data only
2. **Assigned Scope**: Access to assigned tasks/projects
3. **Team Scope**: Access to team-level data
4. **Limited Scope**: Restricted access to aggregated data
5. **All Scope**: Full access to all data

### API Permission Examples

```http
# Developer can only see their own time data
GET /api/v2/team/teams/team-id/aggregation/time-tracking?developer=self

# Senior can see team time data
GET /api/v2/team/teams/team-id/aggregation/time-tracking

# Lead can run custom queries
POST /api/v2/team/teams/team-id/aggregation/custom
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Insufficient permissions to access team aggregation data",
    "details": {
      "required": "team.aggregation:read:all",
      "current": "team.aggregation:read:limited"
    }
  },
  "meta": {
    "timestamp": "2025-09-16T12:00:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_FAILED`: Invalid or expired token
- `PERMISSION_DENIED`: Insufficient permissions
- `TEAM_NOT_FOUND`: Team does not exist
- `DEVELOPER_NOT_FOUND`: Developer does not exist
- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `INTERNAL_ERROR`: Server error

## Rate Limiting

### Rate Limits by Endpoint Category

- **Team Configuration**: 100 requests/hour
- **Developer Management**: 200 requests/hour
- **Aggregation Queries**: 1000 requests/hour
- **Custom Queries**: 50 requests/hour

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1694865600
X-RateLimit-Window: 3600
```

## Webhooks

### Team Event Webhooks

Configure webhooks to receive real-time team events:

```http
POST /api/v2/team/teams/team-id/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/flowforge",
  "events": [
    "developer.added",
    "developer.removed",
    "task.assigned",
    "session.completed",
    "aggregation.generated"
  ],
  "secret": "webhook_secret_key"
}
```

### Webhook Payload Example

```json
{
  "event": "task.assigned",
  "timestamp": "2025-09-16T12:00:00.000Z",
  "team": {
    "id": "flowforge-demo-team",
    "name": "FlowForge Development Team"
  },
  "data": {
    "task": {
      "id": "TASK-123",
      "title": "Implement new feature",
      "assignedTo": "dev1@company.com",
      "assignedBy": "lead@company.com",
      "priority": "high"
    }
  },
  "signature": "sha256=abc123..."
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
const FlowForgeTeamAPI = require('@flowforge/team-api');

const client = new FlowForgeTeamAPI({
  token: process.env.FLOWFORGE_TEAM_TOKEN,
  teamId: 'flowforge-demo-team'
});

// Get team productivity
const productivity = await client.aggregation.getProductivity({
  period: 'week',
  includeIndividual: false
});

// Add new developer
const newDev = await client.developers.add({
  name: 'New Developer',
  email: 'newdev@company.com',
  role: 'developer'
});

// Execute custom query
const customData = await client.aggregation.custom({
  metrics: ['tasks', 'time'],
  dimensions: ['developer', 'project'],
  filters: { status: ['completed'] }
});
```

### Python

```python
from flowforge_team import FlowForgeTeamAPI

client = FlowForgeTeamAPI(
    token=os.environ['FLOWFORGE_TEAM_TOKEN'],
    team_id='flowforge-demo-team'
)

# Get team productivity
productivity = client.aggregation.get_productivity(
    period='week',
    include_individual=False
)

# Add new developer
new_dev = client.developers.add(
    name='New Developer',
    email='newdev@company.com',
    role='developer'
)

# Execute custom query
custom_data = client.aggregation.custom(
    metrics=['tasks', 'time'],
    dimensions=['developer', 'project'],
    filters={'status': ['completed']}
)
```

### cURL Examples

```bash
# Get team productivity
curl -X GET "https://api.flowforge.dev/v2/team/teams/flowforge-demo-team/aggregation/productivity?period=week" \
  -H "Authorization: Bearer $FLOWFORGE_TOKEN" \
  -H "Content-Type: application/json"

# Add new developer
curl -X POST "https://api.flowforge.dev/v2/team/teams/flowforge-demo-team/developers" \
  -H "Authorization: Bearer $FLOWFORGE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Developer",
    "email": "newdev@company.com",
    "role": "developer"
  }'

# Custom aggregation query
curl -X POST "https://api.flowforge.dev/v2/team/teams/flowforge-demo-team/aggregation/custom" \
  -H "Authorization: Bearer $FLOWFORGE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "metrics": ["tasks", "time"],
      "dimensions": ["developer"],
      "filters": {
        "status": ["completed"]
      }
    }
  }'
```

## Conclusion

The FlowForge Team API provides comprehensive functionality for managing multi-developer environments with fine-grained permission control, powerful aggregation capabilities, and real-time event notifications. The API is designed to scale with team size while maintaining performance and security standards.

For additional information, examples, and SDK documentation, visit the [FlowForge Developer Portal](https://developers.flowforge.dev).