# SHIP-001: Command Structure

## Overview
Establish the foundational command structure for `/ff:ship` with proper FlowForge v2.0 command architecture integration.

## Time Estimate
**30 minutes**

## Priority
**Critical** - Foundation for all other tickets

## Phase
**Phase 1: Foundation**

## Dependencies
- FlowForge v2.0 command architecture
- Command namespace structure

## Acceptance Criteria
- [ ] Command file created at `/commands/flowforge/ship.md`
- [ ] Basic command structure follows v2.0 patterns
- [ ] Command registration in FlowForge system
- [ ] Help text and usage documentation
- [ ] Command discovery and listing integration
- [ ] Basic error handling structure

## Technical Requirements

### Command File Structure
```markdown
# /ff:ship - Ship Pull Request

## Description
Automate the complete PR lifecycle from commit to merge with intelligent review orchestration.

## Usage
```bash
/ff:ship [mode] [options]
```

## Parameters
- `mode`: interactive (default), auto
- `--resume`: Resume from checkpoint

## Examples
- `/ff:ship` - Interactive mode
- `/ff:ship auto` - Automatic mode  
- `/ff:ship --resume` - Resume previous session
```

### Integration Points
- **Command Parser**: FlowForge command execution framework
- **Help System**: Integrated help and documentation
- **Error Handling**: Consistent error reporting
- **Logging**: Command execution tracking

### File Locations
- `/commands/flowforge/ship.md` - Main command definition
- `/scripts/ship/` - Implementation scripts (to be created)
- `/documentation/2.0/commands/ship.md` - Detailed documentation

## Implementation Notes
- Follow FlowForge v2.0 command patterns
- Ensure consistent naming conventions
- Implement basic argument validation
- Set up logging and error reporting hooks

## Testing Requirements
- [ ] Command registration test
- [ ] Help text validation
- [ ] Basic argument parsing test
- [ ] Error handling verification

## Definition of Done
- [ ] Command structure implemented
- [ ] Basic tests passing
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Integration with FlowForge verified

---

**Assignee**: Foundation Specialist  
**Reviewer**: Lead Developer  
**Labels**: foundation, critical, command-structure  
**Milestone**: Ship Command Implementation