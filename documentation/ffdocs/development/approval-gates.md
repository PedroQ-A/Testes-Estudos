# FlowForge Approval Gates System

<!--
Organization: FlowForge Team
Technical Lead: Alexandre Cruz (30+ years experience, AI/ML UT)
Repository: FlowForge
Version: 2.0.0
Last Updated: 2025-08-21
Status: Active - v2.0 Release
-->

## 📋 Table of Contents

- [Overview](#overview)
- [Approval Gate Types](#approval-gate-types)
- [Critical Gates (Block Execution)](#critical-gates-block-execution)
- [Advisory Gates (Warn but Continue)](#advisory-gates-warn-but-continue)
- [Emergency Gates (Act First, Report After)](#emergency-gates-act-first-report-after)
- [Implementation in Claude](#implementation-in-claude-maestro)
- [All 37 Rules Interaction Protocols](#all-37-rules-interaction-protocols)
- [Hook Integration](#hook-integration)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

FlowForge uses a sophisticated approval gate system to ensure users maintain complete control while leveraging AI agents effectively. These gates enforce all 37 FlowForge rules through a combination of pre-execution validation, intelligent decision points, and post-execution verification.

**Core Philosophy**: 
- **User remains in control** - All critical decisions require explicit approval
- **AI provides intelligence** - Agents offer expert guidance and automation
- **Rules ensure quality** - Every action follows established best practices
- **Time tracking is sacred** - No work happens without proper time tracking

## Approval Gate Types

### 1. Critical Gates (Block Execution)

These gates **MUST** stop execution and wait for explicit user approval before proceeding:

#### Gate 1.1: Time Tracking Enforcement
- **Rule #36**: No work without active timer
- **Implementation**: `user-prompt-submit.sh` hook
- **Behavior**: Blocks ALL actions if timer not running
- **Override**: None - MANDATORY for billing integrity

#### Gate 1.2: Option Selection
- **Rule #2**: Present 3 options and wait for selection
- **Implementation**: Claude prompt pattern
- **Behavior**: Present options, wait for user choice
- **Format**:
```
I can implement this feature in 3 ways:

Option A: [Description] - Recommended for [reason]
Option B: [Description] - Alternative approach
Option C: [Description] - Conservative approach

Which option would you prefer?
```

#### Gate 1.3: Task Completion
- **Rule #12**: Cannot close tasks without approval
- **Implementation**: Session end confirmation
- **Behavior**: Request explicit approval before marking complete
- **Format**:
```
Task completion summary:
- [Work completed]
- [Tests added]
- [Documentation updated]

Do you approve marking this task as complete?
```

#### Gate 1.4: Protected Branch Prevention
- **Rule #18**: Cannot work on main/develop/master
- **Implementation**: `user-prompt-submit.sh` hook
- **Behavior**: Blocks all file modifications on protected branches
- **Override**: None - Critical for code integrity

#### Gate 1.5: GitHub Issue Verification
- **Rule #5**: Must verify GitHub issue exists
- **Implementation**: Session start validation
- **Behavior**: Verify issue exists before starting work
- **Override**: Create new issue if needed

#### Gate 1.6: Database Schema Changes
- **Rule #28**: Database schema changes need approval
- **Implementation**: Pre-execution validation
- **Behavior**: Present schema changes for approval
- **Format**:
```
Database Schema Changes Required:
- Table: [name]
- Changes: [description]
- Impact: [analysis]
- Migration: [strategy]

Do you approve these schema changes?
```

### 2. Advisory Gates (Warn but Continue)

These gates provide warnings and reminders but allow work to continue:

#### Gate 2.1: Test-Driven Development
- **Rule #3**: TDD reminder when creating code
- **Implementation**: File analysis + reminder
- **Behavior**: Remind about tests, suggest creating them first
- **Example**: "Creating implementation files. Remember Rule #3: Tests first!"

#### Gate 2.2: Agent Usage Notifications
- **Rule #35**: Agent usage enforcement
- **Implementation**: `check-agent-requirement.sh` hook
- **Behavior**: Block file modifications that require specific agents
- **Override**: Use appropriate agent or acknowledge manual work

#### Gate 2.3: Documentation Update Reminders
- **Rule #13**: Documentation update reminders
- **Implementation**: Post-action analysis
- **Behavior**: Remind to update docs when making changes
- **Example**: "Modified API endpoints. Update API documentation?"

#### Gate 2.4: Code Organization
- **Rule #24**: File size and organization
- **Implementation**: File size analysis
- **Behavior**: Warn when files exceed 700 lines
- **Suggestion**: Offer refactoring strategies

#### Gate 2.5: Professional Output Standards
- **Rule #33**: No AI references in output
- **Implementation**: Content filtering
- **Behavior**: Remove AI references from deliverables
- **Action**: Automatic cleanup of client-facing content

### 3. Emergency Gates (Act First, Report After)

These gates handle urgent situations where immediate action is required:

#### Gate 3.1: No Bugs Left Behind
- **Rule #37**: Fix bugs immediately but report
- **Implementation**: Bug detection + immediate action
- **Behavior**: Fix critical bugs, then report what was done
- **Report Format**:
```
Emergency Bug Fix Applied:
- Bug: [description]
- Impact: [severity]
- Fix: [solution implemented]
- Testing: [verification performed]
```

#### Gate 3.2: Security Vulnerabilities
- **Implementation**: Immediate patching
- **Behavior**: Apply security fixes, then document
- **Reporting**: Full security incident report

## Implementation in Claude (Maestro)

### Before Agent Execution Pattern

```markdown
🤖 Agent Request for Approval

I need to use **[agent-name]** to [action description].

**What this agent will do:**
- [Specific action 1]
- [Specific action 2]
- [Expected output]

**Files that will be affected:**
- [file1] - [change type]
- [file2] - [change type]

**Estimated time:** [duration]

**May I proceed with this agent execution?**
```

### After Agent Execution Pattern

```markdown
🤖 Agent Execution Complete

The **[agent-name]** has completed successfully:

**Actions taken:**
- ✅ [Action 1 with result]
- ✅ [Action 2 with result]
- ✅ [Action 3 with result]

**Files changed:**
- `[file1]` - [description of changes]
- `[file2]` - [description of changes]

**Next recommended steps:**
1. [Step 1]
2. [Step 2]

**Do you approve these changes and want to proceed?**
```

### Error Handling Pattern

```markdown
🚨 Gate Violation Detected

**Rule violated:** [Rule number and description]
**Action blocked:** [What was attempted]
**Required approval:** [What needs to happen]

**Options to proceed:**
1. [Compliant option 1]
2. [Compliant option 2]
3. [Alternative approach]

**How would you like to proceed?**
```

## All 37 Rules Interaction Protocols

### Rules 1-10: Foundation & Quality

| Rule | Gate Type | Protocol | Implementation |
|------|-----------|----------|----------------|
| **#1** | Advisory | Documentation organization reminder | File structure validation |
| **#2** | Critical | Present 3 options, wait for selection | Manual Claude pattern |
| **#3** | Advisory | TDD reminder when creating code | File analysis + prompt |
| **#4** | Advisory | Documentation update reminder | Post-change analysis |
| **#5** | Critical | Verify GitHub issue before work | Session start validation |
| **#6** | Advisory | Task tracking system compliance | JSON validation |
| **#7** | Advisory | Project template update reminder | Template drift detection |
| **#8** | Advisory | Code quality standards check | Linting integration |
| **#9** | Advisory | Communication clarity reminder | Output review |
| **#10** | Advisory | Database consistency check | Schema validation |

### Rules 11-20: Workflow & Standards

| Rule | Gate Type | Protocol | Implementation |
|------|-----------|----------|----------------|
| **#11** | Advisory | Session continuity update | Auto-update tasks.json |
| **#12** | Critical | Task completion approval required | Explicit confirmation |
| **#13** | Advisory | Living documentation enforcement | Change detection |
| **#14** | Advisory | Decision documentation required | ADR creation prompt |
| **#15** | Advisory | Documentation organization standards | Structure validation |
| **#16** | Advisory | Infrastructure documentation check | Config change detection |
| **#17** | Advisory | Task context documentation | Progress comment prompts |
| **#18** | Critical | Git flow compliance - no main branch work | Branch validation hook |
| **#19** | Critical | Database change protocol | Schema approval gate |
| **#20** | Advisory | Documentation first principle | Read-before-implement |

### Rules 21-30: Architecture & Maintenance

| Rule | Gate Type | Protocol | Implementation |
|------|-----------|----------|----------------|
| **#21** | Advisory | No shortcuts without discussion | Problem explanation prompt |
| **#22** | Advisory | Check task tracking before starting | Pre-start validation |
| **#23** | Advisory | Consistent architecture patterns | Pattern compliance check |
| **#24** | Advisory | Code organization and file size limits | File size monitoring |
| **#25** | Advisory | Testing & reliability requirements | Test coverage analysis |
| **#26** | Advisory | Function documentation standards | Documentation completeness |
| **#27** | Advisory | Documentation & explainability | Code clarity assessment |
| **#28** | Critical | AI behavior rules compliance | Validation patterns |
| **#29** | Advisory | Issue size management | Scope validation |
| **#30** | Advisory | Maintainable code architecture | Design review prompts |

### Rules 31-37: Professional Standards

| Rule | Gate Type | Protocol | Implementation |
|------|-----------|----------|----------------|
| **#31** | Advisory | Documentation organization | Directory structure validation |
| **#32** | Advisory | Database standards compliance | BaseEntity pattern check |
| **#33** | Advisory | Professional output - no AI references | Content filtering |
| **#34** | Advisory | Document learned knowledge | Wisdom documentation |
| **#35** | Critical | Always use FlowForge agents | Agent requirement enforcement |
| **#36** | Critical | Time tracking mandatory | Timer validation hook |
| **#37** | Emergency | No bugs left behind | Immediate fix + report |

## Hook Integration

### Pre-Execution Hooks

#### `user-prompt-submit.sh`
- **Purpose**: Validates critical rules before any Claude action
- **Rules enforced**: #18 (branch protection), #36 (time tracking)
- **Behavior**: Blocks execution if violations detected

```bash
# Example output when timer not running
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit", 
    "permissionDecision": "deny",
    "permissionDecisionReason": "TIME = MONEY: No active timer! Run: ./run_ff_command.sh flowforge:session:start [task-id]"
  }
}
```

#### `check-agent-requirement.sh` 
- **Purpose**: Enforces Rule #35 - agent usage requirements
- **Rules enforced**: #35 (agent enforcement)
- **Behavior**: Blocks file modifications that require specific agents

```bash
# Example output when agent required
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny", 
    "permissionDecisionReason": "Rule #35: File /path/to/file requires fft-testing agent. Use Task tool with subagent_type: 'fft-testing'"
  }
}
```

### Post-Execution Hooks

#### `validate-session-agents.sh`
- **Purpose**: Validates that appropriate agents were used
- **Rules enforced**: #35 (agent usage validation)
- **Behavior**: Warning report of missed agent opportunities

```bash
# Example warning output
⚠️  FlowForge Rule #35 Warning
════════════════════════════════════════
The following agents should have been used:
❌ fft-testing
Files that needed this agent:
  - src/api/users.test.ts
  - src/services/auth.test.ts
```

### Git Hooks Integration

#### Pre-commit Hooks
- **`check-ai-references.sh`**: Remove AI references (Rule #33)
- **`pre-commit-docs.sh`**: Validate documentation updates (Rule #4)
- **`enforce-doc-updates.sh`**: Ensure docs match code changes (Rule #13)

#### Post-commit Hooks  
- **`log-agent-usage.sh`**: Track agent usage for compliance
- **`pr-review-enforcer.sh`**: Ensure proper review process

## Examples

### Example 1: Critical Gate - Database Schema Change

**Scenario**: Claude needs to modify database schema

```markdown
🚨 Critical Approval Required

I need to modify the database schema to add user preferences:

**Proposed Changes:**
```sql
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
CREATE INDEX idx_users_preferences ON users USING GIN (preferences);
```

**Impact Analysis:**
- Affects: `users` table (currently 10,000+ records)
- Migration time: ~30 seconds  
- Rollback plan: DROP COLUMN preferences
- API compatibility: Maintained (optional field)

**Options:**
A. **Add JSONB column (Recommended)** - Flexible, performant
B. **Create separate preferences table** - Normalized, complex joins  
C. **Use existing metadata field** - No migration, limited structure

**Which option do you approve?**
```

### Example 2: Advisory Gate - TDD Reminder

**Scenario**: Claude is about to create implementation without tests

```markdown
🟡 Rule #3 Reminder: Test-Driven Development

I notice you want to implement the user authentication service. 

**TDD Recommendation:**
Let me create the tests first to define the expected behavior:

1. **Create test file**: `src/auth/auth.service.test.ts`
2. **Define test cases**: Login, logout, token validation
3. **Run failing tests**: Verify they fail as expected
4. **Implement service**: Make tests pass
5. **Refactor**: Clean up implementation

**Would you like me to start with tests (recommended) or proceed with implementation?**
```

### Example 3: Emergency Gate - Bug Fix

**Scenario**: Critical bug discovered during development

```markdown
🚨 Emergency Bug Fix Applied - Rule #37

**Bug discovered:** SQL injection vulnerability in user search
**Severity:** Critical - Production security risk
**Action taken:** Immediately parameterized query

**Fix applied:**
```typescript
// Before (vulnerable)
query = `SELECT * FROM users WHERE name LIKE '%${searchTerm}%'`;

// After (secure)  
query = 'SELECT * FROM users WHERE name LIKE $1';
params = [`%${searchTerm}%`];
```

**Testing performed:**
- ✅ SQL injection attempt blocked
- ✅ Normal search functionality preserved
- ✅ Unit tests updated and passing

**Issue created:** #1234 for security audit review
**Next steps:** Full security scan recommended

**This fix was applied immediately per Rule #37 - No Bugs Left Behind**
```

### Example 4: Agent Approval Pattern

**Scenario**: Documentation needs updating

```markdown
🤖 Agent Request for Approval

I need to use **fft-documentation** to update the API documentation.

**What this agent will do:**
- Analyze current API endpoints in `src/api/`
- Generate OpenAPI 3.0 specifications
- Update user guides with new features
- Create interactive examples

**Files that will be affected:**
- `documentation/api/openapi.yaml` - Full API spec regeneration
- `documentation/api/user-guide.md` - Add new endpoint docs
- `documentation/api/examples/` - New example files

**Estimated time:** 10-15 minutes

**The fft-documentation agent specializes in:**
- Technical writing excellence
- API documentation standards
- Living documentation principles
- Professional formatting

**May I proceed with this agent execution?**
```

## Troubleshooting

### Common Gate Issues

#### Issue: Timer Not Running
**Symptom**: All actions blocked with timer message
**Solution**: 
```bash
./run_ff_command.sh flowforge:session:start [issue-number]
```

#### Issue: Agent Required But Not Available
**Symptom**: File modifications blocked by agent requirement
**Solutions**:
1. **Use the required agent** (recommended):
```
Use Task tool with subagent_type: 'fft-testing'
```
2. **Override for emergency** (document reason):
```
Set FLOWFORGE_AGENT_OVERRIDE=true environment variable
```

#### Issue: Protected Branch Violation  
**Symptom**: Cannot modify files on main branch
**Solution**:
```bash
git checkout -b feature/issue-123-description
```

#### Issue: Missing GitHub Issue
**Symptom**: Session start fails with no issue found
**Solutions**:
1. **Create new issue** (recommended)
2. **Use existing issue number**  
3. **Emergency override** (requires justification)

### Gate Override Procedures

#### Emergency Override
**Use only in critical situations:**
```bash
export FLOWFORGE_EMERGENCY_OVERRIDE=true
export FLOWFORGE_OVERRIDE_REASON="[Detailed justification]"
```

#### Agent Override
**When agent temporarily unavailable:**
```bash
export FLOWFORGE_AGENT_OVERRIDE=true
export FLOWFORGE_MANUAL_WORK_REASON="[Why manual work needed]"
```

**Required documentation after override:**
- Update tasks.json with override reason
- Create follow-up issue for proper implementation
- Document decision in session notes

### Gate Configuration

#### Customizing Gate Sensitivity
Edit `.flowforge/config.json`:
```json
{
  "gates": {
    "agent_enforcement": "strict",
    "time_tracking": "mandatory", 
    "documentation_reminders": "advisory",
    "test_coverage_minimum": 80
  }
}
```

#### Hook Debug Mode
Enable detailed logging:
```bash
export FLOWFORGE_HOOK_DEBUG=true
tail -f /tmp/claude-prompt.log
tail -f /tmp/claude-pretool.log
```

---

**Remember**: Approval gates exist to maintain quality, ensure proper time tracking, and keep you in control while leveraging AI capabilities. They are your safety net, not an obstacle.

**Last Updated**: 2025-08-21  
**Version**: 2.0.0  
**Repository**: FlowForge  
**Maintainer**: FlowForge Team