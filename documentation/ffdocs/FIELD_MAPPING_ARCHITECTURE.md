# FlowForge v2.0 Field Mapping Architecture

## Overview
The Field Mapping System enables FlowForge to work with any task management provider by translating between FlowForge's internal field structure and provider-specific schemas.

## Core Components

### 1. Configuration Structure (`flowforge.config.json`)

```json
{
  "version": "2.0.0",
  "providers": [
    {
      "name": "team-notion",
      "type": "notion",
      "enabled": true,
      "priority": 1,
      "settings": {
        "apiKey": "${NOTION_API_KEY}",
        "databaseId": "abc123",
        "fieldMappings": {
          "title": "Name",
          "status": {
            "field": "Status",
            "valueMap": {
              "ready": "Ready to Start",
              "in-progress": "In Progress",
              "completed": "Done",
              "blocked": "Blocked"
            }
          },
          "priority": {
            "field": "Priority",
            "transform": "lowercase"
          },
          "assignee": {
            "field": "Assigned To",
            "type": "person"
          },
          "estimatedHours": {
            "field": "Time Estimate",
            "transform": "hoursToMinutes"
          }
        }
      }
    },
    {
      "name": "github-backup",
      "type": "github",
      "enabled": true,
      "priority": 2,
      "settings": {
        "token": "${GITHUB_TOKEN}",
        "owner": "JustCode-CruzAlex",
        "repo": "FlowForge",
        "fieldMappings": {
          "status": {
            "useLabels": true,
            "labelPrefix": "status:"
          },
          "priority": {
            "useLabels": true,
            "labelPrefix": "priority:"
          }
        }
      }
    }
  ],
  "sync": {
    "autoSync": true,
    "interval": 300,
    "conflictResolution": "provider-wins",
    "direction": "bidirectional"
  },
  "features": {
    "useVersionSystem": true,
    "autoTimeTracking": true,
    "enforceRules": true,
    "agentIntegration": true
  }
}
```

### 2. TypeScript Interfaces

```typescript
// src/types/field-mapping.ts

export interface FieldMapping {
  field: string;                    // Provider field name
  type?: FieldType;                  // Field type
  transform?: TransformationType;   // Transformation to apply
  valueMap?: Record<string, string>; // Value mapping
  condition?: MappingCondition;     // Conditional mapping
  bidirectional?: boolean;          // Two-way sync
  required?: boolean;                // Required field
  default?: any;                     // Default value
}

export type FieldType = 
  | 'text'
  | 'select'
  | 'multi-select'
  | 'number'
  | 'date'
  | 'person'
  | 'url'
  | 'checkbox'
  | 'relation';

export type TransformationType =
  | 'lowercase'
  | 'uppercase'
  | 'camelCase'
  | 'snake_case'
  | 'hoursToMinutes'
  | 'minutesToHours'
  | 'dateFormat'
  | 'custom';

export interface MappingCondition {
  if: {
    field: string;
    operator: 'equals' | 'contains' | 'exists' | 'notExists';
    value?: any;
  };
  then: FieldMapping;
  else?: FieldMapping;
}

export interface ProviderFieldMappings {
  [flowforgeField: string]: string | FieldMapping;
}

export interface MappingConfig {
  provider: string;
  version: string;
  mappings: ProviderFieldMappings;
  customTransforms?: Record<string, (value: any) => any>;
  validation?: ValidationRules;
}
```

### 3. Field Mapping Engine

```typescript
// src/mapping/FieldMappingEngine.ts

export class FieldMappingEngine {
  private mappings: Map<string, MappingConfig>;
  private transformers: Map<string, Transformer>;

  constructor(config: FlowForgeConfig) {
    this.loadMappings(config);
    this.registerBuiltInTransformers();
  }

  // Map FlowForge task to provider format
  mapToProvider(
    task: Task,
    providerName: string
  ): Record<string, any> {
    const config = this.mappings.get(providerName);
    if (!config) throw new Error(`No mappings for ${providerName}`);

    const result: Record<string, any> = {};
    
    for (const [ffField, mapping] of Object.entries(config.mappings)) {
      const value = this.getFieldValue(task, ffField);
      const mappedValue = this.applyMapping(value, mapping);
      
      if (mappedValue !== undefined) {
        const providerField = typeof mapping === 'string' 
          ? mapping 
          : mapping.field;
        result[providerField] = mappedValue;
      }
    }

    return result;
  }

  // Map provider data to FlowForge format
  mapFromProvider(
    data: Record<string, any>,
    providerName: string
  ): Partial<Task> {
    const config = this.mappings.get(providerName);
    if (!config) throw new Error(`No mappings for ${providerName}`);

    const result: Partial<Task> = {};
    
    for (const [ffField, mapping] of Object.entries(config.mappings)) {
      const providerField = typeof mapping === 'string' 
        ? mapping 
        : mapping.field;
      
      const value = data[providerField];
      const mappedValue = this.reverseMapping(value, mapping);
      
      if (mappedValue !== undefined) {
        this.setFieldValue(result, ffField, mappedValue);
      }
    }

    return result;
  }

  private applyMapping(value: any, mapping: string | FieldMapping): any {
    if (typeof mapping === 'string') return value;

    // Apply condition
    if (mapping.condition) {
      return this.evaluateCondition(value, mapping.condition);
    }

    // Apply value mapping
    if (mapping.valueMap && value in mapping.valueMap) {
      value = mapping.valueMap[value];
    }

    // Apply transformation
    if (mapping.transform) {
      value = this.transform(value, mapping.transform);
    }

    return value;
  }

  private transform(value: any, type: TransformationType): any {
    const transformer = this.transformers.get(type);
    return transformer ? transformer.transform(value) : value;
  }
}
```

### 4. Provider-Specific Configurations

#### Notion Field Mapping Template
```json
{
  "fieldMappings": {
    "title": "Task Name",
    "description": "Description",
    "status": {
      "field": "Status",
      "type": "select",
      "valueMap": {
        "ready": "To Do",
        "in-progress": "In Progress",
        "completed": "Done",
        "blocked": "On Hold"
      }
    },
    "priority": {
      "field": "Priority",
      "type": "select",
      "valueMap": {
        "critical": "🔴 Critical",
        "high": "🟠 High",
        "medium": "🟡 Medium",
        "low": "🟢 Low"
      }
    },
    "assignee": {
      "field": "Assigned To",
      "type": "person"
    },
    "estimatedHours": {
      "field": "Time Estimate (hours)",
      "type": "number"
    },
    "labels": {
      "field": "Tags",
      "type": "multi-select"
    },
    "milestone": {
      "field": "Sprint",
      "type": "relation"
    }
  }
}
```

#### GitHub Field Mapping Template
```json
{
  "fieldMappings": {
    "title": "title",
    "description": "body",
    "status": {
      "useIssueState": true,
      "closedStates": ["completed", "cancelled"]
    },
    "priority": {
      "useLabels": true,
      "labelPrefix": "priority:",
      "valueMap": {
        "critical": "priority:critical",
        "high": "priority:high",
        "medium": "priority:medium",
        "low": "priority:low"
      }
    },
    "assignee": {
      "field": "assignees",
      "transform": "firstElement"
    },
    "labels": {
      "field": "labels",
      "excludePrefix": ["priority:", "status:"]
    },
    "milestone": "milestone.title"
  }
}
```

## Implementation Strategy

### Phase 1: Core Engine (Sunday Morning)
1. Implement FieldMappingEngine class
2. Create transformation system
3. Add bidirectional mapping support
4. Implement validation

### Phase 2: Provider Integration (Sunday Afternoon)
1. Update GitHubProvider to use mappings
2. Create NotionProvider with mapping support
3. Test with multiple schemas
4. Add error handling

### Phase 3: Configuration (Sunday Evening)
1. Create 6 template configurations
2. Implement configuration loader
3. Add environment variable support
4. Create validation system

### Phase 4: TUI Wizard (Post-Launch)
1. Interactive configuration builder
2. Field detection and auto-mapping
3. Testing and validation interface
4. Export/import configurations

## Benefits

### For Developers
- **Flexibility**: Use any Notion database schema
- **No Lock-in**: Easy to switch providers
- **Customization**: Define own field mappings
- **Multi-Provider**: Use multiple providers simultaneously

### For FlowForge
- **Extensibility**: Easy to add new providers
- **Maintainability**: Clean separation of concerns
- **Type Safety**: Full TypeScript support
- **Future-Proof**: Ready for any provider

## Migration Path

### From Hardcoded to Configurable
1. **Backward Compatible**: Keep hardcoded as defaults
2. **Gradual Migration**: Override specific fields
3. **Full Configuration**: Complete field mapping control
4. **Validation**: Ensure data integrity

### Monday Deployment
1. Pre-configured templates for each developer
2. Manual configuration guide
3. Test scripts for validation
4. Rollback plan if needed

## Configuration Examples

### Developer 1: Simple Notion Setup
```json
{
  "fieldMappings": {
    "title": "Name",
    "status": "Status",
    "assignee": "Owner"
  }
}
```

### Developer 2: Complex Notion with Custom Fields
```json
{
  "fieldMappings": {
    "title": "Task Title",
    "status": {
      "field": "Current Status",
      "valueMap": {
        "ready": "Backlog",
        "in-progress": "Working",
        "completed": "Shipped"
      }
    },
    "priority": {
      "field": "Urgency Level",
      "transform": "customPriorityTransform"
    },
    "estimatedHours": {
      "field": "Story Points",
      "transform": "storyPointsToHours"
    }
  },
  "customTransforms": {
    "storyPointsToHours": "(sp) => sp * 2",
    "customPriorityTransform": "(p) => p.toUpperCase()"
  }
}
```

### Developer 3: Multi-Provider Setup
```json
{
  "providers": [
    {
      "name": "notion-main",
      "type": "notion",
      "priority": 1,
      "fieldMappings": { /* ... */ }
    },
    {
      "name": "github-backup",
      "type": "github", 
      "priority": 2,
      "fieldMappings": { /* ... */ }
    },
    {
      "name": "json-local",
      "type": "json",
      "priority": 3,
      "fieldMappings": { /* ... */ }
    }
  ]
}
```

## Testing Strategy

### Unit Tests
- Field mapping transformations
- Value mapping conversions
- Conditional logic evaluation
- Bidirectional consistency

### Integration Tests
- Provider-specific mappings
- Multi-provider synchronization
- Configuration loading
- Error handling

### End-to-End Tests
- Complete task lifecycle
- Cross-provider sync
- Configuration changes
- Data integrity

## Success Metrics

### Monday Deployment
- All 6 developers configured
- Zero data loss during migration
- < 5 minute setup per developer
- 100% task creation success rate

### Long-term
- Support 10+ providers
- < 100ms mapping operations
- 99.9% sync reliability
- Zero-config for common schemas