# Rule #5 Universal Ticket Migration Guide

<!--
Organization: FlowForge Team
Technical Lead: Alexandre Cruz (30+ years experience, AI/ML UT)
Repository: FlowForge
Version: 2.0.0
Last Updated: 2025-09-16
Status: Active - Rule #5 Universal Ticket Implementation
-->

## Overview

This guide covers the migration of FlowForge Rule #5 from GitHub-specific language to Universal Ticket Architecture, making FlowForge truly provider-agnostic while maintaining the core principle that all development work must be properly tracked.

## What Changed

### Rule #5 Evolution

**Before (GitHub-specific):**
```markdown
### 5. Task Management
- ✅ **Claude MUST NOT work without a task created (GitHub, Notion, or other task provider)**
- ✅ **Set task to "In Progress" or similar status when starting**
- ✅ **Close the task when work is complete**
- ✅ **Reference task number/ID in commits and documentation**
```

**After (Universal):**
```markdown
### 5. Universal Ticket Management
- ✅ **Claude MUST NOT work without a valid ticket from any configured provider**
- ✅ **Supported providers: GitHub Issues, Notion Pages, Linear Issues, Jira Tickets, Local JSON Tasks**
- ✅ **Set ticket to "In Progress" status when starting work**
- ✅ **Reference ticket ID in commits and documentation**
- ✅ **Close ticket when work is complete**

**Provider Examples:**
- **GitHub**: Issue #123 in repository
- **Notion**: Page/Task in database
- **Linear**: Issue LIN-123 in workspace
- **Jira**: Ticket PROJ-123 in project
- **Local**: Task 123 in .flowforge/tasks.json

**Universal Status Mapping:**
- ready → in_progress → review → completed
```

## Terminology Changes

### Universal Language Updates

| Context | OLD (GitHub-specific) | NEW (Universal) | Notes |
|---------|----------------------|-----------------|-------|
| **General Reference** | "GitHub issue" | "ticket" | Universal abstraction |
| **Validation** | "issue exists" | "ticket exists" | Provider-agnostic |
| **Rule Enforcement** | "work without issue" | "work without ticket" | Rule #5 compliance |
| **Time Tracking** | "issue tracking" | "ticket tracking" | Time management |
| **Command Examples** | `/start 123` (GitHub only) | `/start 123` (any provider) | Same syntax, broader support |
| **Error Messages** | "Issue #123 not found" | "Ticket #123 not found" | Provider-neutral |

### Provider-Specific References

When mentioning specific providers, use clear context:

```markdown
❌ AVOID: "Create an issue for this work"
✅ PREFER: "Create a ticket for this work (GitHub Issue, Notion Page, etc.)"

❌ AVOID: "Check if the issue is open on GitHub"
✅ PREFER: "Check if the ticket is open in your configured provider"

❌ AVOID: "GitHub integration for issues"
✅ PREFER: "GitHub provider integration for Issues"
```

## Command Updates

### Session Start Command

**Enhanced Universal Support:**

```bash
# Auto-detection now supports all providers
/flowforge:session:start                    # Detects from any provider

# Manual specification works with any provider
/flowforge:session:start 123               # GitHub Issue #123
/flowforge:session:start LIN-456           # Linear Issue LIN-456
/flowforge:session:start PROJ-789          # Jira Ticket PROJ-789
/flowforge:session:start task-101          # Local Task 101
/flowforge:session:start notion-page-abc   # Notion Page
```

**Updated Help Text:**

```bash
Usage: /flowforge:session:start [ticket-id]

Examples:
  /flowforge:session:start          # Auto-detect task
  /flowforge:session:start 123      # Start work on GitHub Issue #123
  /flowforge:session:start LIN-456  # Start work on Linear Issue LIN-456
  /flowforge:session:start task-789 # Start work on Local Task 789
  /flowforge:session:start ?        # Show this help

Options:
  [ticket-id]     Optional ticket ID (GitHub Issue, Linear, Jira, Local, etc.)
  ?/help          Show this help
  DEBUG=1         Enable debug output
```

### Error Messages

**Universal Error Handling:**

```bash
# Before (GitHub-specific)
❌ No issue specified and could not auto-detect one
💡 Options:
1. Specify an issue: /flowforge:session:start 123
2. Check open issues: gh issue list --state open
3. Create new issue: gh issue create --title 'New Task'

# After (Universal)
❌ No ticket specified and could not auto-detect one
💡 Options:
1. Specify a ticket: /flowforge:session:start 123
2. Check open tickets: node $PROVIDER_BRIDGE list-tickets --status=open
3. Create new ticket: node $PROVIDER_BRIDGE create-ticket --title='New Task'
4. GitHub fallback: gh issue list --state open
```

## Documentation Updates

### Files Updated

1. **Primary Rule Document** (`.flowforge/RULES.md`):
   - Rule #5 completely rewritten for universal support
   - Added provider examples and status mapping
   - Maintained core compliance principle

2. **Project Context** (`CLAUDE.md`):
   - Updated Rule #5 references throughout
   - Changed "GitHub issue" to "valid ticket from configured provider"
   - Updated command examples with provider variety

3. **Session Start Command** (`commands/flowforge/session/start.md`):
   - Universal ticket detection and validation
   - Provider-agnostic error messages
   - Enhanced help with multiple provider examples

4. **Rule Enforcement** (`documentation/development/RULE_ENFORCEMENT.md`):
   - Updated Rule #5 enforcement from "GitHub issue" to "valid ticket"
   - Maintained blocking behavior for work without tickets

### New Documentation

1. **Universal Ticket Architecture** (`documentation/2.0/architecture/universal-ticket-architecture.md`):
   - Complete provider mapping and implementation details
   - Migration guide for existing documentation
   - Future provider expansion template

2. **Migration Guide** (this document):
   - Comprehensive change summary
   - Implementation guidance
   - Before/after examples

## Implementation Benefits

### For Developers

1. **Tool Choice Freedom**:
   ```bash
   # Can work with preferred task management system
   export FLOWFORGE_PROVIDER="linear"     # Use Linear Issues
   export FLOWFORGE_PROVIDER="notion"     # Use Notion Pages
   export FLOWFORGE_PROVIDER="github"     # Use GitHub Issues
   ```

2. **Consistent Workflow**:
   ```bash
   # Same FlowForge commands regardless of provider
   /flowforge:session:start               # Works with any provider
   /flowforge:session:end "completed"     # Universal status updates
   ```

3. **No Vendor Lock-in**:
   ```bash
   # Easy migration between providers
   node scripts/provider-bridge.js migrate-from github --to linear
   ```

### For Teams

1. **Mixed Environments**:
   - Developer A: Uses GitHub Issues
   - Developer B: Uses Linear Issues
   - Developer C: Uses Notion Pages
   - All use same FlowForge workflow

2. **Gradual Migration**:
   ```bash
   # Migrate incrementally
   Week 1: Keep GitHub Issues
   Week 2: Test Linear integration
   Week 3: Full Linear migration
   Week 4: Evaluate and optimize
   ```

3. **Enterprise Flexibility**:
   - Support corporate Jira requirements
   - Integrate with existing task management
   - Maintain FlowForge benefits across tools

## Backward Compatibility

### Existing Workflows

All existing GitHub-based workflows continue to work:

```bash
# These still work exactly as before
/flowforge:session:start 123
gh issue view 123
gh issue comment 123 --body "Update"

# But now they're part of universal system
# GitHub is just one supported provider
```

### Migration Path

1. **Phase 1: No Changes Required**
   - Existing GitHub workflows continue unchanged
   - New universal language in documentation
   - Enhanced provider detection

2. **Phase 2: Optional Provider Expansion**
   - Add additional providers as needed
   - Configure provider preferences
   - Test multi-provider workflows

3. **Phase 3: Full Universal Adoption**
   - Use universal ticket terminology
   - Leverage cross-provider features
   - Optimize for team's preferred tools

## Validation Examples

### Rule #5 Compliance Check

**GitHub Provider:**
```bash
# Validate GitHub Issue exists and is open
TICKET_ID="123"
gh issue view $TICKET_ID --json state,title
if [ $? -eq 0 ]; then
    echo "✅ Ticket $TICKET_ID validated via GitHub"
    # Proceed with work
else
    echo "❌ Ticket $TICKET_ID not found in GitHub"
    exit 1
fi
```

**Linear Provider:**
```bash
# Validate Linear Issue exists and is open
TICKET_ID="LIN-456"
node scripts/provider-bridge.js verify-ticket --id=$TICKET_ID
if [ $? -eq 0 ]; then
    echo "✅ Ticket $TICKET_ID validated via Linear"
    # Proceed with work
else
    echo "❌ Ticket $TICKET_ID not found in Linear"
    exit 1
fi
```

**Universal Validation:**
```bash
# Works with any configured provider
TICKET_ID="$1"  # Could be 123, LIN-456, PROJ-789, etc.
node scripts/provider-bridge.js verify-ticket --id=$TICKET_ID
if [ $? -eq 0 ]; then
    echo "✅ Ticket $TICKET_ID validated via configured provider"
    # Proceed with work
else
    echo "❌ Ticket $TICKET_ID not found in configured provider"
    echo "💡 Check provider configuration and ticket ID format"
    exit 1
fi
```

## Future Provider Support

### Planned Providers

The universal architecture supports easy addition of:

- **Azure DevOps**: Work items
- **Asana**: Tasks and projects
- **Trello**: Cards and boards
- **Monday.com**: Items and workflows
- **Custom REST API**: Any system with REST endpoints

### Provider Addition Template

```javascript
// Adding new provider to universal system
class NewProvider extends BaseProvider {
    constructor(config) {
        super(config);
        this.providerName = 'newprovider';
        this.ticketPrefix = 'NEW-';
    }

    async verifyTicket(id) {
        // Implement provider-specific verification
        const ticket = await this.api.getTicket(id);
        return {
            exists: !!ticket,
            status: this.mapToUniversalStatus(ticket.status),
            title: ticket.title,
            provider: this.providerName
        };
    }

    mapToUniversalStatus(providerStatus) {
        const mapping = {
            'Open': 'ready',
            'In Progress': 'in_progress',
            'In Review': 'review',
            'Closed': 'completed'
        };
        return mapping[providerStatus] || 'unknown';
    }
}
```

## Testing the Migration

### Validation Checklist

- [ ] **Rule #5 enforcement works with GitHub Issues**
- [ ] **Rule #5 enforcement works with other providers**
- [ ] **Session start auto-detection works universally**
- [ ] **Error messages are provider-agnostic**
- [ ] **Documentation uses universal terminology**
- [ ] **Backward compatibility maintained**
- [ ] **New provider integration possible**

### Test Commands

```bash
# Test GitHub (should continue working)
/flowforge:session:start 123

# Test provider-agnostic validation
node scripts/provider-bridge.js verify-ticket --id=123

# Test universal status updates
node scripts/provider-bridge.js update-ticket --id=123 --status=in_progress

# Test auto-detection
/flowforge:session:start  # Should detect from any provider
```

## Conclusion

The Rule #5 Universal Ticket Migration successfully transforms FlowForge from a GitHub-specific tool to a truly provider-agnostic productivity framework. The migration:

1. **Preserves Core Principle**: All work must still be tracked through tickets
2. **Expands Provider Support**: Works with GitHub, Linear, Notion, Jira, Local, and future providers
3. **Maintains Compatibility**: Existing GitHub workflows continue unchanged
4. **Improves Flexibility**: Teams can choose their preferred task management tools
5. **Future-Proofs Architecture**: Easy to add new providers as needed

The universal ticket terminology makes FlowForge documentation clearer and more inclusive while ensuring Rule #5 compliance across all supported providers.

---

**Related Documentation:**
- [Universal Ticket Architecture](../architecture/universal-ticket-architecture.md)
- [Provider Configuration Guide](../providers/PROVIDER_SETUP_GUIDE.md)
- [FlowForge Rules](.flowforge/RULES.md) - Updated Rule #5
- [Session Management](../guides/session-management.md)
- [Provider Bridge Usage](../providers/provider-bridge-usage.md)