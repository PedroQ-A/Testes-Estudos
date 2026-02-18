# Rule #35 Authentication System Architecture

## Executive Summary

The Rule #35 Authentication System enforces mandatory agent usage for specialized file operations. Version 2.0 introduces a transcript-based authentication mechanism that eliminates circular dependencies and provides reliable agent detection.

## Problem Statement

### Previous Issues (v1.0)
1. **Circular Dependency**: Hooks blocked file writes unless agents were detected, but agents needed to write files to prove they were active
2. **Session File Unreliability**: Manual updates to `.current-session` became stale
3. **Time Window Vulnerability**: 5-minute window allowed unauthorized writes after agent usage
4. **No True Authentication**: Could not distinguish between Claude directly writing vs agent writing

## Solution Architecture

### Core Components

1. **PreToolUse Hook** (`check-agent-requirement.sh`)
   - Multi-layer authentication (tokens, transcript, environment)
   - File-type to agent mapping
   - No circular dependencies

2. **PostToolUse Hook** (`log-agent-usage.sh`)
   - Detects agents from Task tool usage
   - Creates time-limited auth tokens
   - Automatic token cleanup

3. **Authentication Tokens**
   - Location: `.flowforge/.agent-auth/`
   - Format: `{session_id}_{agent_name}.auth`
   - Lifetime: 5 minutes

## Authentication Flow

1. User requests file operation
2. Claude invokes agent via Task tool
3. PostToolUse hook detects agent activation
4. Auth token created for agent+session
5. Agent attempts file operation
6. PreToolUse hook validates token
7. Operation allowed/denied

## File Type Mappings

| File Pattern | Required Agent |
|-------------|---------------|
| `*.test.*`, `*.spec.*` | fft-testing |
| `*.md`, `/docs/` | fft-documentation |
| `*.tsx`, `*.jsx` | fft-frontend |
| `/controllers/`, `/models/` | fft-backend |
| `/api/`, `*.graphql` | fft-api-designer |
| `/database/`, `*.sql` | fft-database |
| `Dockerfile`, `*.yml` | fft-devops-agent |

## Testing

Run comprehensive tests:
```bash
./tests/test-rule35-authentication.sh
```

## Troubleshooting

Check logs:
```bash
tail -f /tmp/claude-pretool.log
tail -f /tmp/claude-posttool.log
```

Emergency bypass:
```bash
FLOWFORGE_FIXING_HOOKS=1 command
```

---
*Version 2.0 - Production Ready*
