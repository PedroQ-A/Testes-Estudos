# Claude.md Installation Feature

## Overview

The Claude.md Installation feature automatically creates or updates a `Claude.md` file in user projects during FlowForge initialization. This file provides essential context to Claude Code about the project's FlowForge workflow, rules, and available commands.

## Purpose

- **Context Preservation**: Ensures Claude Code always has access to current FlowForge configuration
- **Workflow Compliance**: Embeds all 35 FlowForge rules directly in the project context
- **Zero-Friction Setup**: Automatically configures Claude.md without manual intervention
- **Version Consistency**: Keeps context synchronized with FlowForge version updates

## Architecture

### Components

1. **ClaudeMdInstaller** (`lib/claude-md-installer.js`)
   - Core installation logic
   - Handles detection, creation, and updates
   - Provides validation and error recovery

2. **Installation Integration** (`scripts/install-flowforge.sh`)
   - Integrates with main FlowForge installation
   - Provides fallback bash implementation
   - Handles Node.js availability detection

3. **Command Interface** (`commands/flowforge/setup/claude-md.md`)
   - Manual installation/update command
   - Advanced configuration options
   - Troubleshooting capabilities

4. **Template System** (`templates/claude/claude-context.md`)
   - Template reference for context structure
   - Documentation for content sections

### Flow Diagram

```
FlowForge Init
      ↓
Detect Claude.md
      ↓
  ┌─ Exists? ────┐
  │              │
  NO            YES
  │              │
  ↓              ↓
Create        Has FF Context?
Mode            │        │
  │            NO       YES
  ↓             │        │
Write         Append   Update
New File      Mode     Mode
  │             │        │
  └─────────────┼────────┘
                ↓
           Validate Content
                ↓
            Success/Error
```

## Installation Modes

### Auto Mode (Default)
- **New Project**: Creates `Claude.md` with full FlowForge context
- **Existing Claude.md**: Appends FlowForge context to preserve user content
- **Existing FlowForge Context**: Updates context while preserving other content

### Manual Modes
- **Create**: Always creates new file (overwrites existing)
- **Append**: Always appends context to existing file
- **Update**: Updates existing FlowForge context only

## Content Structure

The generated Claude.md includes:

### 1. Project Information
```markdown
**Project**: ProjectName
**FlowForge Version**: 2.0.0
**Context Updated**: 2024-01-15T10:30:00Z
```

### 2. Mandatory Workflow
- Session management requirements
- Time tracking obligations
- Branch workflow rules
- Ticket/issue requirements

### 3. Core Rules (35 Total)
- Rule #3: Test-Driven Development
- Rule #5: No work without tickets
- Rule #18: Never work on main/develop
- Rule #35: Mandatory agent usage
- Rule #33: No AI references in output

### 4. Maestro Orchestration
```markdown
🚨⚡ SUPREME RULE: CLAUDE THE MAESTRO ⚡🚨

⚡ MAESTRO NEVER DOES WORK DIRECTLY
⚡ MAESTRO ALWAYS ORCHESTRATES THROUGH AGENTS
⚡ MAESTRO COORDINATES BUT DOESN'T CODE
⚡ MAESTRO PRESENTS OPTIONS BUT DOESN'T CHOOSE
```

### 5. Agent Directory
- Complete list of available FlowForge agents
- Usage guidelines for each agent
- Rule #35 enforcement details

### 6. Command Reference
- Essential FlowForge commands
- Session management commands
- Development workflow commands
- System administration commands

## Context Markers

FlowForge content is wrapped in HTML comments for easy identification and updates:

```html
<!-- FLOWFORGE_CONTEXT_START -->
[FlowForge context content]
<!-- FLOWFORGE_CONTEXT_END -->
```

This allows:
- Safe updates without affecting user content
- Clear separation of concerns
- Automated context management
- Version control friendly diffs

## Integration Points

### 1. Main Installation (`install-flowforge.sh`)
```bash
# Called during create_initial_docs()
install_claude_md

# Tries Node.js installer first, falls back to bash
```

### 2. Manual Command
```bash
/flowforge:setup:claude-md [options]
```

### 3. Update Mechanism
- Triggered during FlowForge version updates
- Maintains context freshness
- Preserves user customizations

## Error Handling

### Backup Strategy
- Automatic backup before modifications
- Timestamp-based backup naming
- Recovery on installation failure

### Validation System
- Content structure validation
- Required section detection
- Missing element reporting

### Graceful Degradation
- Node.js unavailable → Bash fallback
- Write permission errors → Clear error messages
- Partial failures → Attempt restoration

## Testing Strategy

### Unit Tests (`tests/installation/claude-md-installer.test.js`)
- Core functionality validation
- Edge case handling
- Error recovery testing

### Integration Tests (`tests/integration/claude-md-installation.test.js`)
- End-to-end installation flow
- Cross-platform compatibility
- Real filesystem operations

### Test Coverage Requirements
- 80%+ code coverage (Rule #3 compliance)
- All error paths tested
- Backup/recovery scenarios validated

## Usage Examples

### Automatic Installation
```bash
# During flowforge init
./scripts/install-flowforge.sh
# → Claude.md created automatically
```

### Manual Installation
```bash
# Create new Claude.md
/flowforge:setup:claude-md --mode=create

# Append to existing file
/flowforge:setup:claude-md --mode=append --backup

# Update existing context
/flowforge:setup:claude-md --mode=update --force
```

### Programmatic Usage
```javascript
const { ClaudeMdInstaller } = require('./lib/claude-md-installer');

const installer = new ClaudeMdInstaller();
const result = await installer.installClaudeMd('./project', {
  projectName: 'MyProject',
  mode: 'auto',
  backup: true
});
```

## Configuration Options

### Project-Level Settings
```json
{
  "claudeMd": {
    "enabled": true,
    "autoUpdate": true,
    "backupEnabled": true,
    "customSections": []
  }
}
```

### Command-Line Options
- `--mode=MODE` - Installation mode
- `--backup` / `--no-backup` - Backup control
- `--project-name=NAME` - Override project name
- `--dry-run` - Preview changes
- `--force` - Skip confirmations

## Maintenance

### Version Updates
- Context automatically updated during FlowForge upgrades
- New rules added to existing installations
- Deprecated content removed safely

### Content Synchronization
- Template updates propagated to installations
- Agent list kept current
- Command references maintained

### User Customization
- User content outside markers preserved
- Custom sections respected
- Merge conflict resolution

## Security Considerations

### File Permissions
- Respects existing file permissions
- No privilege escalation required
- Safe default permissions applied

### Content Validation
- Input sanitization for project names
- Path traversal prevention
- Symlink attack mitigation

### Backup Security
- Backup files use secure permissions
- Temporary files cleaned up
- No sensitive data exposure

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Solution: Check directory permissions
   ls -la Claude.md
   chmod 644 Claude.md
   ```

2. **Node.js Not Available**
   ```bash
   # Automatic fallback to bash implementation
   # No user action required
   ```

3. **Backup Restoration**
   ```bash
   # Manual restoration if needed
   cp Claude.md.backup.1234567890 Claude.md
   ```

4. **Context Corruption**
   ```bash
   # Regenerate context
   /flowforge:setup:claude-md --mode=update --force
   ```

### Debug Mode
```bash
export FLOWFORGE_DEBUG=true
/flowforge:setup:claude-md --dry-run
```

## Future Enhancements

### Planned Features
- Interactive context customization
- Multiple template support
- Team-specific context sharing
- IDE integration beyond Claude Code

### Extension Points
- Plugin system for custom sections
- Template marketplace
- Context validation API
- Integration with external documentation systems

## Performance Metrics

### Benchmarks
- Installation time: < 100ms for new files
- Update time: < 50ms for existing files
- Memory usage: < 10MB peak during operation
- File size: ~5KB typical context size

### Monitoring
- Installation success rate tracking
- Error pattern analysis
- Performance regression detection
- User adoption metrics

---

*This feature ensures every FlowForge project has consistent, up-to-date context for Claude Code, enabling seamless workflow compliance and maximum productivity.*