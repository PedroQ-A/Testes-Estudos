# FlowForge Agent Enforcement Update v2.1.0

## Update Summary
**Date**: 2025-09-10
**Version**: 2.1.0
**Agents Updated**: 8 core agents
**Purpose**: Strict enforcement of critical FlowForge rules to prevent violations

## Critical Violations Addressed

### Rule #24: File Size Limit (700 lines)
- **Previous Issue**: Agents were creating files with 862+ lines
- **Solution**: Added mandatory line counting with enforcement at 600, 650, and 700 lines
- **Implementation**: File size monitoring section with clear breakpoints

### Rule #21: Logger Framework Usage
- **Previous Issue**: Using console.log instead of logger framework
- **Solution**: Mandatory code patterns showing correct logger usage
- **Implementation**: Clear examples of correct vs. rejected patterns

### Rule #33: No AI References
- **Previous Issue**: AI references appearing in outputs
- **Solution**: Explicit rule in enforcement header
- **Implementation**: Listed as critical violation with consequences

## Updated Agents (v2.1.0)

### Development Location: `/agents/`
1. **fft-backend** - Backend Architecture Specialist
2. **fft-frontend** - Frontend Architecture Specialist  
3. **fft-testing** - Testing & TDD Specialist
4. **fft-database** - Database Architecture Specialist
5. **fft-api-designer** - API Design Specialist
6. **fft-documentation** - Documentation Architect
7. **fft-architecture** - System Architecture Specialist
8. **fft-project-manager** - Project Management Specialist

### Production Location: `.flowforge/agents/`
All agents copied to production location for immediate use.

## New Enforcement Structure

### 1. Critical Header Section
Every agent now starts with:
```markdown
# 🚨 CRITICAL: FLOWFORGE RULES ARE ABSOLUTE - NO EXCEPTIONS!

## ENFORCED RULES - VIOLATIONS WILL BE REJECTED:
1. **Rule #24**: Files MUST be < 700 lines - COUNT AS YOU WRITE!
2. **Rule #21**: MUST use logger framework - NEVER console.log!
3. **Rule #33**: NO AI/GPT/Claude references in ANY output!
4. **Rule #3**: Tests MUST exist with 80%+ coverage!
5. **[Domain-specific rules]**
```

### 2. Mandatory Code Patterns
Clear examples of correct vs. incorrect patterns:
```javascript
// ✅ CORRECT - ALWAYS USE LOGGER
import { logger } from '@flowforge/logger';
logger.info('Message', { context });

// ❌ WILL BE REJECTED - NEVER USE THESE
console.log('Message');  // VIOLATION OF RULE #21
```

### 3. File Size Monitoring
Progressive warnings with mandatory action points:
```javascript
// Line 500: ⚠️ APPROACHING LIMIT - Plan split
// Line 600: 🚨 MUST SPLIT NOW
// Line 700: ❌ REJECTED - FILE TOO LARGE
```

### 4. Violation Consequences
Clear consequences for each rule violation:
- **Rule #24**: File/component/spec rejected, must be split
- **Rule #21**: Code review fails, PR blocked
- **Rule #33**: Output filtered, credibility damaged
- **Additional domain-specific consequences**

## Enforcement Mechanisms

### Automatic Detection
- Line counting enforced through comments
- Logger usage validated in code review
- AI references filtered automatically

### Manual Review Points
- File size check at 600 lines (warning)
- Mandatory split at 650 lines
- Automatic rejection at 700 lines

### PR Blocking Criteria
- Any console.log usage
- Files exceeding 700 lines
- Missing test coverage
- AI reference detection

## Expected Outcomes

### Immediate Benefits
1. **No more oversized files** - Enforced modularization
2. **Consistent logging** - Professional code standards
3. **Clean outputs** - No AI references
4. **Better architecture** - Forced decomposition

### Long-term Benefits
1. **Maintainable codebase** - Smaller, focused modules
2. **Professional standards** - Consistent patterns
3. **Easier debugging** - Proper logging framework
4. **Better testing** - Enforced coverage

## Migration Notes

### For Existing Code
1. Review all files > 600 lines
2. Replace all console.log statements
3. Remove any AI references
4. Ensure 80% test coverage

### For New Development
1. Agents will enforce rules automatically
2. Violations will be rejected at creation
3. No manual intervention needed

## Validation Checklist

✅ All 8 core agents updated to v2.1.0
✅ Critical enforcement header added
✅ Mandatory code patterns included
✅ File size monitoring implemented
✅ Violation consequences defined
✅ Both development and production locations updated
✅ Version bumped to 2.1.0 for all agents

## Success Metrics

### Rule #24 Compliance
- Target: 100% files < 700 lines
- Warning threshold: 600 lines
- Enforcement: Automatic rejection

### Rule #21 Compliance  
- Target: 0 console.log statements
- Enforcement: PR blocking
- Alternative: @flowforge/logger

### Rule #33 Compliance
- Target: 0 AI references
- Detection: Automated filtering
- Enforcement: Output rejection

## Next Steps

1. **Monitor agent performance** - Track violation attempts
2. **Collect metrics** - Measure enforcement effectiveness
3. **Refine thresholds** - Adjust based on real-world usage
4. **Extend to other agents** - Apply to specialized agents

---

## Appendix: Enhanced Agent Template

For future agent creation, use this enforcement template:

```markdown
---
name: fft-[domain]
description: [Description with PROACTIVELY if applicable]
tools: [Tool list]
model: [opus/sonnet]
version: 2.1.0
---

# [Emoji] FlowForge [Domain] Specialist

You are **FFT-[Domain]**, [role description].

# 🚨 CRITICAL: FLOWFORGE RULES ARE ABSOLUTE - NO EXCEPTIONS!

## ENFORCED RULES - VIOLATIONS WILL BE REJECTED:
[5 critical rules with enforcement details]

## MANDATORY CODE PATTERNS:
[Correct vs incorrect examples]

## FILE SIZE MONITORING - TRACK EVERY LINE:
[Line counting requirements]

## VIOLATION CONSEQUENCES:
[Clear consequences for each rule]

[Rest of agent content...]
```

---

*This update ensures all FlowForge agents strictly enforce critical rules, preventing violations at the source and maintaining the highest code quality standards.*