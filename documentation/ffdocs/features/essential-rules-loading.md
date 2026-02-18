# Essential Rules Loading Integration

## Overview

The Essential Rules Loading system ensures that Claude is refreshed with critical FlowForge development rules at the start of every work session. This guarantees perfect compliance and maintains high development standards throughout the development process.

## Implementation

### Core Components

1. **Essential Rules Loader Script** (`scripts/essential-rules-loader.sh`)
   - Extracts core FlowForge rules from `.flowforge/RULES.md`
   - Provides context-aware rules based on work type
   - Creates JSON context for agent consumption
   - Performance optimized (< 100ms loading time)

2. **Session Start Integration** (Step 2 in `commands/flowforge/session/start.md`)
   - Integrated between task detection and Git setup
   - Automatically detects work type from issue title
   - Creates agent context with rules for future spawning
   - Displays rules prominently to Claude

3. **Agent Context System**
   - Generates `.flowforge/local/essential-rules.json` for rules storage
   - Creates `.flowforge/local/agent-context.json` for agent spawning
   - Passes rules context to all spawned agents

### Core Rules Always Loaded

The system always loads these critical rules:

- **Rule #3**: Test-Driven Development (TDD) - MANDATORY
- **Rule #5**: GitHub Issues Required
- **Rule #18**: Never Work on Main/Develop
- **Rule #35**: Always Use FlowForge Agents
- **Rule #36**: Time Tracking is Money
- **Rule #37**: No Bugs Left Behind

### Context-Aware Rules

Additional rules are loaded based on work type:

- **Database work**: Rule #19 (Database modifications)
- **Documentation work**: Rule #13 (Update docs), Rule #26 (Function docs), Rule #27 (Explainability)
- **Testing work**: Rule #25 (Coverage requirements)
- **Bug fixes**: Emphasis on Rule #37 (No bugs left behind)
- **API work**: Rule #32 (Database standards)

## Usage

### Automatic Integration

The rules loading happens automatically during session start:

```bash
/flowforge:session:start [issue-number]
```

### Direct Usage

The essential rules loader can be used directly:

```bash
./scripts/essential-rules-loader.sh
```

### Programmatic Usage

```bash
source scripts/essential-rules-loader.sh
load_essential_rules
```

## Architecture

### Performance Design

- **Target**: < 100ms loading time
- **Approach**: Efficient AWK-based parsing
- **Fallback**: Minimal rules context if loading fails
- **Caching**: JSON output for agent reuse

### Error Handling

- Graceful degradation if RULES.md is missing
- Fallback rules creation for critical functionality
- Non-blocking errors to prevent session start failure

### Rule Format Parsing

The system parses rules from the format:
```markdown
### [number]. [title]
- ✅ **[requirement]**
```

For example:
```markdown
### 3. Testing Requirements
- ✅ **ALL new implementations/features MUST have proper unit tests**
```

## Files Generated

### Essential Rules Context (`.flowforge/local/essential-rules.json`)

```json
{
  "core_rules": [
    {
      "number": 3,
      "title": "Testing Requirements",
      "summary": "Write tests BEFORE code. 80%+ coverage required. TDD MANDATORY."
    }
  ],
  "context_rules": [25],
  "work_type": "testing",
  "loaded_at": "2025-09-17T03:32:26Z",
  "performance": {
    "target_ms": 100,
    "load_time_ms": 25
  },
  "emphasis": {
    "tdd_mandatory": true,
    "time_tracking_critical": true,
    "agents_required": true
  }
}
```

### Agent Context (`.flowforge/local/agent-context.json`)

```json
{
  "session": {
    "issue": "544",
    "branch": "feature/544-rules-loading",
    "work_type": "testing",
    "started_at": "2025-09-17T03:32:26Z"
  },
  "rules": { /* full rules object */ },
  "emphasis": {
    "tdd_first": "ALWAYS write tests before code - Rule #3",
    "time_tracking": "Timer must be running - Rule #36",
    "use_agents": "Use FlowForge agents when available - Rule #35"
  },
  "context_files": {
    "rules": ".flowforge/local/essential-rules.json",
    "session": ".flowforge/local/session.json",
    "tdd_context": ".flowforge/local/tdd-context.json"
  }
}
```

## Display Format

The rules are displayed to Claude with colored formatting:

```
╔══════════════════════════════════════════════════════════════╗
║                    Essential FlowForge Rules                   ║
╚══════════════════════════════════════════════════════════════╝

🚨 CORE RULES - NEVER FORGET THESE:

• Rule #3: TDD - MANDATORY
  Write tests BEFORE code. 80%+ coverage required.

• Rule #36: Time Tracking is Money
  Timer MUST be running for all work. No timer = No pay!

• Rule #35: Always Use FlowForge Agents
  MANDATORY: Use agents when available. No manual work.

• Rule #5: GitHub Issues Required
  No work without a GitHub issue.

• Rule #18: Never Work on Main/Develop
  Always work on feature branches.

• Rule #37: No Bugs Left Behind
  Every bug must be fixed or documented.

📋 Context Rules for 'testing' work:

💡 Rules context saved to: .flowforge/local/essential-rules.json
⚡ Agents will receive rules context automatically
```

## Testing

### Integration Tests

- `tests/session-start-rules-integration.test.sh`: Full integration testing
- Performance validation (< 100ms target)
- JSON structure validation
- Core rules presence verification
- Agent context creation testing

### Unit Tests

- `tests/essential-rules-loader.test.sh`: Comprehensive unit tests
- Core rules extraction
- Context-aware rules selection
- Performance requirements
- Edge case handling

## Benefits

1. **Perfect Compliance**: Claude is always fresh on FlowForge rules
2. **Context Awareness**: Rules are tailored to the type of work being done
3. **Agent Coordination**: Spawned agents receive rules context automatically
4. **Performance**: Fast loading maintains session start speed
5. **TDD Emphasis**: Test-driven development is prominently featured
6. **Time Tracking**: Critical payment tracking is emphasized

## Future Enhancements

1. **Rule Versioning**: Track which version of rules were loaded
2. **Custom Rule Sets**: Allow project-specific rule additions
3. **Rule Analytics**: Track which rules are most frequently violated
4. **Dynamic Rules**: Rules that adapt based on project state
5. **Rule Validation**: Automated checking of rule compliance

## Issue Resolution

This implementation addresses Issue #544 requirements:

- ✅ Essential rules loading integrated into session start
- ✅ Core rules (#3, #5, #18, #35, #36, #37) always loaded
- ✅ Context-aware additional rules based on work type
- ✅ Performance target met (< 100ms)
- ✅ Agent context enhancement with rules
- ✅ TDD rules emphasized for implementation agents
- ✅ Maintains 3-5 second session start target

The Essential Rules Summary approach has been successfully implemented, ensuring Claude maintains perfect FlowForge compliance throughout every development session.