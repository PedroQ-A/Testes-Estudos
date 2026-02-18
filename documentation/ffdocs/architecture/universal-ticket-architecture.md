# Universal Ticket Architecture

<!--
Organization: FlowForge Team
Technical Lead: Alexandre Cruz (30+ years experience, AI/ML UT)
Repository: FlowForge
Version: 2.0.0
Last Updated: 2025-09-16
Status: Active - Universal Ticket Implementation
-->

## Overview

FlowForge's Universal Ticket Architecture provides provider-agnostic work tracking using "ticket" as the universal abstraction. This enables seamless operation across GitHub Issues, Notion Pages, Linear Issues, Jira Tickets, Local JSON Tasks, and any future providers.

## Core Principle

**Rule #5: Universal Ticket Management**
- ALL development work must be tracked through a valid ticket
- NO work can proceed without proper ticket validation
- Universal terminology maintains consistency across all providers

## Provider Mapping

### Supported Providers

| Provider | Ticket Type | ID Format | Status Examples |
|----------|-------------|-----------|-----------------|
| **GitHub** | Issue | `#123` | open, closed |
| **Notion** | Page/Task | `page-id` or `task-123` | To Do, In Progress, Done |
| **Linear** | Issue | `LIN-123` | Backlog, In Progress, Done |
| **Jira** | Ticket | `PROJ-123` | To Do, In Progress, Done |
| **Local** | JSON Task | `task-123` | ready, in_progress, completed |

### Universal Status Mapping

All providers map to these universal statuses:

```
ready → in_progress → review → completed
  ↓         ↓          ↓         ↓
┌─────────────────────────────────────┐
│ GitHub:  open → open → open → closed │
│ Notion:  To Do → In Progress → Review → Done │
│ Linear:  Backlog → In Progress → In Review → Done │
│ Jira:    To Do → In Progress → Review → Done │
│ Local:   ready → in_progress → review → completed │
└─────────────────────────────────────┘
```

## Implementation Architecture

### Provider Bridge System

```
┌─────────────────────────────────────────┐
│           FlowForge Core                │
│         (Ticket Abstraction)           │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Provider Bridge                 │
│     (scripts/provider-bridge.js)       │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────┐    ┌────────▼─────────┐
│ GitHub │    │ Notion/Linear/    │
│ API    │    │ Jira/Local APIs  │
└────────┘    └──────────────────┘
```

### Core Operations

All providers support these universal operations:

```bash
# Ticket Operations
node scripts/provider-bridge.js verify-ticket --id=123
node scripts/provider-bridge.js get-ticket --id=123 --format=json
node scripts/provider-bridge.js update-ticket --id=123 --status=in_progress
node scripts/provider-bridge.js list-tickets --status=ready --format=text

# Session Operations
node scripts/provider-bridge.js start-tracking --id=123
node scripts/provider-bridge.js save-session --sessionId=abc --taskId=123
node scripts/provider-bridge.js get-next-task --format=simple
```

## Rule #5 Implementation

### Validation Flow

```
User starts work → FlowForge validates ticket → Provider verifies existence → Work begins
       ↓                      ↓                        ↓                    ↓
   Ticket ID          Universal format         Provider-specific        Session starts
   provided           validation               API call                 with tracking
```

### Provider Examples

#### GitHub Integration
```bash
# Rule #5 compliance for GitHub
TICKET_ID="123"
PROVIDER="github"

# Validate ticket exists and is open
gh issue view $TICKET_ID --json state,title
# Set to in-progress (via comments or labels)
gh issue comment $TICKET_ID --body "Starting work - Status: In Progress"
```

#### Notion Integration
```bash
# Rule #5 compliance for Notion
TICKET_ID="page-abc123"
PROVIDER="notion"

# Validate page exists and update status
node scripts/provider-bridge.js verify-ticket --id=$TICKET_ID
node scripts/provider-bridge.js update-ticket --id=$TICKET_ID --status=in_progress
```

#### Local JSON Integration
```bash
# Rule #5 compliance for Local Tasks
TICKET_ID="task-123"
PROVIDER="local"

# Validate in tasks.json and update status
node scripts/provider-bridge.js verify-ticket --id=$TICKET_ID
node scripts/provider-bridge.js update-ticket --id=$TICKET_ID --status=in_progress
```

## FlowForge Command Updates

### Session Start Command

The `flowforge:session:start` command now supports universal ticket detection:

```bash
# Auto-detection priority order:
1. Current session data (.flowforge/local/session.json)
2. Provider-specific assigned tickets (GitHub assigned issues)
3. Next task from tasks.json (any provider)
4. In-progress tickets (any provider)
5. Ready tickets (any provider)

# Manual specification works with any provider:
/flowforge:session:start 123        # GitHub Issue #123
/flowforge:session:start LIN-456    # Linear Issue LIN-456
/flowforge:session:start PROJ-789   # Jira Ticket PROJ-789
/flowforge:session:start task-101   # Local Task 101
```

### Universal Ticket Validation

```bash
# Validation logic in session start:
if ! verify_ticket_exists "$TICKET_ID"; then
    echo "❌ Ticket $TICKET_ID not found in configured provider!"
    echo "💡 Options:"
    echo "1. Create ticket: node scripts/provider-bridge.js create-ticket --title='New Task'"
    echo "2. List available: node scripts/provider-bridge.js list-tickets --status=open"
    exit 1
fi
```

## Documentation Standards

### Universal Terminology

| OLD (GitHub-specific) | NEW (Universal) | Context |
|----------------------|-----------------|---------|
| "GitHub issue" | "ticket" | General references |
| "Issue #123" | "Ticket #123" or "Issue #123" | When ID is clear |
| "issue exists" | "ticket exists" | Validation |
| "work without issue" | "work without ticket" | Rule enforcement |
| "issue tracking" | "ticket tracking" | Time management |

### Provider-Specific References

When referring to specific providers, use clear naming:

```markdown
❌ AVOID: "Create an issue for this work"
✅ PREFER: "Create a ticket for this work (GitHub Issue, Notion Page, etc.)"

❌ AVOID: "Check if the issue is open"
✅ PREFER: "Check if the ticket is open in your configured provider"

❌ AVOID: "GitHub integration for issues"
✅ PREFER: "GitHub provider integration for Issues"
```

## Migration Guide

### Updating Existing Documentation

1. **Replace GitHub-specific language**:
   - "GitHub issue" → "ticket"
   - "issue exists" → "ticket exists"
   - "work without issue" → "work without ticket"

2. **Add provider examples** where helpful:
   ```markdown
   **Examples:**
   - GitHub: Issue #123
   - Notion: Page in Tasks database
   - Linear: Issue LIN-123
   - Local: Task in .flowforge/tasks.json
   ```

3. **Update command examples**:
   ```bash
   # Before (GitHub-only)
   /flowforge:session:start 123  # GitHub Issue #123

   # After (Universal)
   /flowforge:session:start 123        # GitHub Issue #123
   /flowforge:session:start LIN-456    # Linear Issue LIN-456
   /flowforge:session:start task-101   # Local Task 101
   ```

### Code Updates

1. **Variable naming**:
   ```bash
   # Before
   ISSUE_NUMBER="123"
   GITHUB_ISSUE="$ISSUE_NUMBER"

   # After
   TICKET_ID="123"
   PROVIDER_TICKET="$TICKET_ID"
   ```

2. **Function naming**:
   ```bash
   # Before
   verify_github_issue() { ... }

   # After
   verify_ticket() { ... }
   verify_github_ticket() { ... }  # Provider-specific when needed
   ```

3. **Error messages**:
   ```bash
   # Before
   echo "❌ GitHub issue #$ID not found!"

   # After
   echo "❌ Ticket $ID not found in configured provider!"
   ```

## Benefits

### For Developers
- **Choice of tools**: Use preferred task management system
- **Consistent workflow**: Same FlowForge commands regardless of provider
- **No vendor lock-in**: Switch providers without changing workflow

### For Teams
- **Mixed environments**: Different team members can use different providers
- **Gradual migration**: Migrate between providers incrementally
- **Enterprise flexibility**: Support corporate task management requirements

### For FlowForge
- **Broader adoption**: Support more development environments
- **Future-proof**: Easy to add new providers
- **Maintainable**: Single codebase with provider abstractions

## Future Providers

The architecture supports easy addition of new providers:

### Planned Providers
- **Azure DevOps**: Work items
- **Asana**: Tasks
- **Trello**: Cards
- **Monday.com**: Items
- **Custom REST API**: Any system with REST endpoints

### Provider Implementation Template

```javascript
// New provider template
class NewProvider {
    async verifyTicket(id) {
        // Check if ticket exists
        return { exists: true, status: 'open', title: 'Task title' };
    }

    async updateTicketStatus(id, status) {
        // Update ticket status using universal mapping
        const providerStatus = this.mapUniversalStatus(status);
        return await this.api.updateStatus(id, providerStatus);
    }

    mapUniversalStatus(status) {
        const mapping = {
            'ready': 'To Do',
            'in_progress': 'In Progress',
            'review': 'In Review',
            'completed': 'Done'
        };
        return mapping[status] || status;
    }
}
```

## Conclusion

Universal Ticket Architecture makes FlowForge truly provider-agnostic while maintaining the core principle that all development work must be properly tracked. Rule #5 now supports any ticket management system, ensuring FlowForge can integrate into any development environment.

The transition from GitHub-specific language to universal ticket terminology makes FlowForge documentation clearer and more inclusive while preserving backward compatibility for teams already using GitHub Issues.

---

**Related Documentation:**
- [Provider Configuration](../providers/PROVIDER_SETUP_GUIDE.md)
- [FlowForge Rules](.flowforge/RULES.md) - Rule #5 details
- [Session Management](../guides/session-management.md)
- [Provider Bridge Usage](../providers/provider-bridge-usage.md)