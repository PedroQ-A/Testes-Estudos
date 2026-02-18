# FlowForge v2.0 Field Mapping Migration Guide

## Overview

This guide covers the migration from hardcoded field mappings to the new configurable field mapping system in FlowForge v2.0.

## Migration Strategy

### Phase 1: Preparation (Day 1)
1. **Backup Current Data**
   ```bash
   # Backup existing task data
   cp data/tasks.json data/tasks.v1.backup.json
   
   # Export current GitHub issues (if using)
   ./scripts/export-github-issues.sh > github-backup.json
   ```

2. **Install New Dependencies**
   ```bash
   cd src/
   npm install
   npm run build
   ```

### Phase 2: Configuration Generation (Day 1-2)
1. **Run Configuration Wizard**
   ```bash
   # Interactive setup for new field mappings
   npm run config:wizard
   
   # Or use the CLI with prompts
   ./scripts/configure-mappings.sh
   ```

2. **Manual Configuration (Alternative)**
   ```bash
   # Copy example configuration
   cp examples/flowforge.config.json ./flowforge.config.json
   
   # Edit configuration manually
   nano flowforge.config.json
   ```

### Phase 3: Provider Migration (Day 2-3)
1. **Update Existing Providers**
   ```typescript
   // Old approach (v1.x)
   const provider = new GitHubProvider(config, logger);
   
   // New approach (v2.0)
   const mappingEngine = new FieldMappingEngine(logger);
   const flowforgeConfig = await configLoader.loadFromFile('./flowforge.config.json');
   const providerConfig = flowforgeConfig.providers.find(p => p.name === 'github-primary');
   const provider = new GitHubProvider(providerConfig, logger, mappingEngine, providerConfig.fieldMappings, flowforgeConfig);
   ```

2. **Test Migrations**
   ```bash
   # Test field mappings
   npm run test:mappings
   
   # Dry run migration
   npm run migrate:dry-run --provider=github
   
   # Validate all configurations
   npm run config:validate
   ```

### Phase 4: Data Migration (Day 3-4)
1. **Migrate Existing Data**
   ```bash
   # Migrate JSON data to new format
   npm run migrate:json-data
   
   # Sync with external providers using new mappings
   npm run sync:initial --provider=notion
   npm run sync:initial --provider=github
   ```

2. **Verify Data Integrity**
   ```bash
   # Compare before/after data
   npm run verify:migration
   
   # Check field mapping accuracy
   npm run test:field-accuracy
   ```

## Breaking Changes

### Provider Configuration
**Old Format (v1.x):**
```typescript
interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  labels?: {
    priority?: Record<TaskPriority, string>;
    status?: Record<TaskStatus, string>;
  };
}
```

**New Format (v2.0):**
```typescript
interface ProviderConfiguration {
  name: string;
  type: 'github';
  enabled: boolean;
  priority: number;
  settings: {
    token: string;
    owner: string;
    repo: string;
  };
  fieldMappings: {
    task: Record<string, FieldMapping>;
    microtask?: MicrotaskMapping;
    timeTracking?: TimeTrackingMapping;
  };
}
```

### Field Mappings
**Old (Hardcoded):**
```typescript
// Inside GitHubProvider
private issueToTask(issue: GitHubIssue): Task {
  return {
    id: `#${issue.number}`,
    title: issue.title,
    status: issue.state === 'open' ? 'ready' : 'completed',
    // ... hardcoded mapping logic
  };
}
```

**New (Configurable):**
```json
{
  "fieldMappings": {
    "task": {
      "id": {
        "source": "github.number",
        "target": "flowforge.id",
        "type": "number",
        "readonly": true,
        "transform": "github_issue_number_to_ff"
      },
      "title": {
        "source": "github.title",
        "target": "flowforge.title",
        "type": "string",
        "required": true,
        "bidirectional": true
      },
      "status": {
        "source": "github.state",
        "target": "flowforge.status",
        "type": "string",
        "bidirectional": true,
        "valueMapping": {
          "open": "ready",
          "closed": "completed"
        }
      }
    }
  }
}
```

## Migration Commands

### 1. Generate Configuration from Existing Setup
```bash
# Analyze current provider usage and generate config
npm run migration:analyze-current

# Generate base configuration
npm run migration:generate-config --providers=github,json

# Interactive configuration wizard
npm run config:wizard --migration-mode
```

### 2. Migrate Provider Instances
```bash
# Update provider factory calls
npm run migration:update-providers

# Replace hardcoded mappings with configurable ones
npm run migration:extract-mappings --provider=github
npm run migration:extract-mappings --provider=json
```

### 3. Data Migration
```bash
# Migrate existing JSON tasks
npm run migration:migrate-json --input=data/tasks.json --output=data/tasks.v2.json

# Sync and validate external providers
npm run migration:sync-providers --dry-run
npm run migration:sync-providers --execute
```

### 4. Validation and Testing
```bash
# Validate configuration
npm run config:validate

# Test field mappings
npm run test:field-mappings

# Integration tests
npm run test:integration --providers=all
```

## Configuration Examples

### Basic Multi-Provider Setup
```json
{
  "version": "2.0.0",
  "project": {
    "name": "Team Project",
    "id": "team-project-2025",
    "created": "2025-01-15T10:00:00Z"
  },
  "settings": {
    "useFlowForgeVersionSystem": true,
    "autoSyncInterval": 300,
    "conflictResolution": "prompt",
    "primaryProvider": "notion-main",
    "backupProvider": "json-backup",
    "syncDirection": "bidirectional"
  },
  "providers": [
    {
      "name": "notion-main",
      "type": "notion",
      "enabled": true,
      "priority": 1,
      "settings": {
        "apiKey": "${NOTION_API_KEY}",
        "databaseId": "your-database-id"
      },
      "fieldMappings": {
        "task": {
          "title": {
            "source": "notion.Name",
            "target": "flowforge.title",
            "type": "string",
            "required": true,
            "bidirectional": true
          },
          "status": {
            "source": "notion.Status",
            "target": "flowforge.status",
            "type": "select",
            "required": true,
            "bidirectional": true,
            "valueMapping": {
              "Not started": "ready",
              "In progress": "in-progress",
              "Done": "completed"
            }
          }
        }
      }
    },
    {
      "name": "json-backup",
      "type": "json",
      "enabled": true,
      "priority": 2,
      "settings": {
        "filePath": "./data/tasks.json",
        "autoSave": true
      },
      "fieldMappings": {
        "task": { "native": true }
      }
    }
  ]
}
```

### Advanced GitHub Configuration
```json
{
  "name": "github-issues",
  "type": "github",
  "enabled": true,
  "priority": 1,
  "settings": {
    "token": "${GITHUB_TOKEN}",
    "owner": "myorg",
    "repo": "project-tasks"
  },
  "fieldMappings": {
    "task": {
      "status": {
        "source": "github.state",
        "target": "flowforge.status",
        "type": "string",
        "bidirectional": true,
        "valueMapping": {
          "open": "ready",
          "closed": "completed"
        },
        "labelOverrides": {
          "status:in-progress": "in-progress",
          "status:blocked": "blocked"
        }
      },
      "priority": {
        "source": "github.labels",
        "target": "flowforge.priority",
        "type": "labels",
        "bidirectional": true,
        "valueMapping": {
          "priority:critical": "critical",
          "priority:high": "high",
          "priority:medium": "medium",
          "priority:low": "low"
        }
      }
    },
    "microtask": {
      "enabled": true,
      "storage": "body_checkboxes",
      "format": "markdown_checklist"
    }
  }
}
```

## Common Migration Issues

### 1. Field Type Mismatches
**Problem:** Old hardcoded mappings assume specific field types
**Solution:** Configure proper type conversions in field mappings

```json
{
  "estimatedHours": {
    "source": "notion.Estimate",
    "target": "flowforge.estimatedHours",
    "type": "number",
    "transform": "string_to_number",
    "defaultValue": 0
  }
}
```

### 2. Missing Required Fields
**Problem:** New validation requires fields that weren't mapped before
**Solution:** Add default values or make fields optional

```json
{
  "priority": {
    "source": "notion.Priority",
    "target": "flowforge.priority",
    "type": "select",
    "defaultValue": "medium",
    "valueMapping": {
      "": "medium"
    }
  }
}
```

### 3. Complex Nested Data
**Problem:** Providers store complex data that needs parsing
**Solution:** Use custom transformations

```json
{
  "transformations": {
    "parse_github_assignees": {
      "type": "function",
      "code": "value => Array.isArray(value) ? value.map(a => a.login).join(', ') : ''"
    }
  }
}
```

## Testing Migration

### 1. Unit Tests for Field Mappings
```typescript
// tests/field-mappings.test.ts
describe('Field Mapping Migration', () => {
  it('should map GitHub issue to FlowForge task correctly', async () => {
    const engine = new FieldMappingEngine(logger);
    const context: MappingContext = {
      provider: 'github',
      direction: 'inbound',
      sourceData: githubIssue,
      targetData: {},
      config: providerConfig,
      transformations: {}
    };
    
    const result = await engine.mapEntity(fieldMappings.task, context);
    expect(result.title.success).toBe(true);
    expect(result.title.value).toBe(githubIssue.title);
  });
});
```

### 2. Integration Tests
```typescript
// tests/provider-migration.test.ts
describe('Provider Migration', () => {
  it('should maintain data consistency after migration', async () => {
    const oldProvider = new LegacyGitHubProvider(oldConfig);
    const newProvider = new GitHubProvider(newConfig, logger, mappingEngine, fieldMappings, flowforgeConfig);
    
    const oldTasks = await oldProvider.listTasks();
    const newTasks = await newProvider.listTasks();
    
    expect(newTasks.length).toBe(oldTasks.length);
    // Compare essential fields
    for (let i = 0; i < oldTasks.length; i++) {
      expect(newTasks[i].title).toBe(oldTasks[i].title);
      expect(newTasks[i].status).toBe(oldTasks[i].status);
    }
  });
});
```

## Rollback Plan

If migration fails, rollback using these steps:

1. **Restore Original Data**
   ```bash
   cp data/tasks.v1.backup.json data/tasks.json
   git checkout v1.3.71  # Last stable v1 version
   ```

2. **Restore Provider Configurations**
   ```bash
   git restore src/providers/github/GitHubProvider.ts
   git restore src/providers/json/JsonProvider.ts
   ```

3. **Restart Services**
   ```bash
   npm install  # Install v1 dependencies
   npm run build
   npm test
   ```

## Support and Troubleshooting

### Common Commands
```bash
# Check configuration validity
npm run config:validate

# Debug field mappings
npm run debug:mappings --provider=notion --field=status

# Test specific transformations
npm run test:transform --name=notion_person_to_email

# Generate migration report
npm run migration:report
```

### Log Analysis
```bash
# Enable debug logging
export DEBUG=flowforge:mapping:*

# Check mapping engine logs
tail -f logs/field-mapping.log

# Analyze sync conflicts
npm run analyze:conflicts --since=yesterday
```

### Getting Help
- Check logs in `logs/field-mapping.log`
- Run `npm run config:doctor` for diagnostics
- Use `npm run config:wizard` to regenerate configuration
- Contact team for complex migration issues

## Timeline

**Monday Deployment Checklist:**
- [ ] All 6 developers have completed configuration wizard
- [ ] Each developer's Notion database is mapped correctly
- [ ] GitHub integration is tested and working
- [ ] JSON backup is configured for all users
- [ ] Migration validation tests pass
- [ ] Rollback plan is documented and tested