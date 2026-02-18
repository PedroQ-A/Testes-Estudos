# Dual ETA Feature Examples

## Overview

This document provides comprehensive examples of the dual ETA feature in action, showing different scenarios, display formats, and use cases that developers and project managers will encounter in real-world usage.

## Basic Examples

### Standard Issue with Estimate

**GitHub Issue #142:**
```markdown
# Implement User Authentication

## Description
Add OAuth 2.0 authentication to the application with session management.

## Acceptance Criteria
- [ ] OAuth provider integration
- [ ] User session management
- [ ] Logout functionality
- [ ] Security middleware

**Estimate: 8h**

## Technical Notes
Consider using existing OAuth library for faster implementation.
```

**Time Tracking State:**
- Estimated: 8.0 hours
- Time spent: 3.5 hours
- Remaining: 4.5 hours
- Team velocity: 0.9 (slightly slower than estimates)

**Statusline Output (Wide Terminal):**
```
[FlowForge] | 🎯 v2.0 Launch (8/12) [██████░░░░] 67% | ⏰ 4h 30m on #142 | 3d 4h milestone | 🌿 feature/142-oauth | Session: 2h 15m | Opus 4.1 | ● Active
```

**Statusline Output (Narrow Terminal):**
```
[FlowForge] | 🎯 v2.0 (8/12) [██████░░░░] 67% | ⏰ #142: 4h 30m/3d 4h | 🌿 feature/142-oauth | Session: 2h 15m | Opus 4.1
```

### Bug Fix with Complex Context

**GitHub Issue #156:**
```markdown
# Fix Memory Leak in Session Handler

## Bug Description
Application memory usage increases over time due to session cleanup not working properly.

## Steps to Reproduce
1. Start application
2. Create multiple user sessions
3. Monitor memory usage over 24 hours

## Expected vs Actual
- Expected: Memory stable around 100MB
- Actual: Memory grows to 500MB+ over time

**Estimate: 6h**
**Priority:** High
**Complexity:** High
```

**Time Tracking State:**
- Estimated: 6.0 hours
- Time spent: 8.5 hours (overrun)
- Bug context adjustment: +50% (complex bug)
- Team velocity: 0.8
- Calculated remaining: 0 hours (overrun by 2.5h)

**Statusline Output:**
```
[FlowForge] | 🎯 Sprint 42 (9/10) [█████████░] 90% | ⏰ Overrun by 2h 30m on #156 | 1d 4h milestone | 🌿 fix/156-memory-leak | Session: 4h 45m | Opus 4.1 | ● Active
```

## Milestone Examples

### Active Sprint with Multiple Issues

**Milestone: "v2.0 Launch"**
- Total issues: 12
- Completed: 8
- Open issues: 4

**Open Issues Breakdown:**
| Issue | Title | Estimate | Spent | Remaining |
|-------|-------|----------|-------|-----------|
| #142 | OAuth Implementation | 8h | 3.5h | 4.5h |
| #143 | Database Migration | 4h | 1h | 3h |
| #144 | UI Polish | 2h | 0h | 2h |
| #145 | Documentation | 6h | 2h | 4h |

**Milestone Calculation:**
- Total remaining: 13.5h
- With velocity (0.9): 15h
- Parallel work (3 developers): ~6h timeline

**Statusline Output:**
```
[FlowForge] | 🎯 v2.0 Launch (8/12) [██████░░░░] 67% | ⏰ 4h 30m on #142 | 6h concurrent | 🌿 feature/142-oauth | Session: 2h 15m | Opus 4.1 | ● Active
```

### Near Completion Sprint

**Milestone: "Bug Fix Sprint"**
- Total issues: 5
- Completed: 4
- Open issues: 1 (critical bug)

**Remaining Issue:**
- #189: Critical Security Fix
- Estimated: 3h
- Spent: 4.5h (overrun)
- Remaining: 0h (overrun by 1.5h)

**Statusline Output:**
```
[FlowForge] | 🎯 Bug Fix Sprint (4/5) [████████░░] 80% | ⏰ Overrun by 1h 30m on #189 | 0h milestone | 🌿 hotfix/189-security | Session: 3h | Opus 4.1 | ● Active
```

## Edge Cases

### Issue Without Estimate

**GitHub Issue #200:**
```markdown
# Research New Framework Options

## Description
Investigate potential replacement for current frontend framework.

## Tasks
- [ ] Framework comparison matrix
- [ ] Performance benchmarks
- [ ] Migration effort assessment

## Notes
This is exploratory work without a fixed timeline.
```

**Statusline Output:**
```
[FlowForge] | 🎯 Research Sprint (2/8) [██░░░░░░░░] 25% | ⏰ No estimate | 2d 4h milestone | 🌿 research/200-framework | Session: 1h 30m | Opus 4.1 | ● Active
```

### New Issue (No Time Spent)

**GitHub Issue #201:**
```markdown
# Add Loading Spinners to Forms

## Description
Improve UX by adding loading indicators to all form submissions.

**Estimate: 3h**
```

**Time Tracking State:**
- Estimated: 3.0 hours
- Time spent: 0 hours
- Remaining: 3.0 hours (full estimate)

**Statusline Output:**
```
[FlowForge] | 🎯 UX Improvements (1/6) [█░░░░░░░░░] 17% | ⏰ 3h on #201 | 1d 2h milestone | 🌿 feature/201-spinners | Session: 0m | Opus 4.1 | ● Active
```

### Completed Issue (Legacy Display)

When working on a completed issue (rare but possible):

**Statusline Output:**
```
[FlowForge] | 🎯 v2.0 Launch (9/12) [███████░░░] 75% | ⏰ Issue completed | 2d 6h milestone | 🌿 main | Session: 0m | Opus 4.1 | ● Active
```

## Different Estimate Formats

### Various Estimate Parsing Examples

#### Standard Formats
```markdown
**Estimate: 4h**                → 4.0 hours
**Estimate: 2.5 hours**         → 2.5 hours
**Time: 8h**                    → 8.0 hours
**Time needed: 6 hours**        → 6.0 hours
```

#### Natural Language Formats
```markdown
This should take 4 hours        → 4.0 hours
Approximately 2.5h needed       → 2.5 hours
8h estimated                    → 8.0 hours
Estimated time: 6 hours         → 6.0 hours
```

#### Complex Description Examples

**Issue with Multiple Time References:**
```markdown
# Database Performance Optimization

Initial analysis suggests this will take **6 hours** to complete.
This includes 2 hours for query optimization and 4 hours for indexing.

Previous similar work took 8 hours, but we have better tools now.

**Estimate: 6h**  ← This is what gets parsed
```

**Parsed Result:** 6.0 hours (takes the explicit estimate, not the text references)

## Terminal Width Adaptations

### Wide Terminal (>120 columns)
```
[FlowForge] | 🎯 Feature Development Sprint (15/20) [███████░░░] 75% | ⏰ 2h 30m remaining on #423 | 1w 2d milestone remaining | 🌿 feature/423-advanced-search | Session: 1h 45m | Claude Opus 4.1 | ● Active Session
```

### Medium Terminal (80-120 columns)
```
[FlowForge] | 🎯 Sprint (15/20) [███████░░░] 75% | ⏰ #423: 2h 30m/1w 2d | 🌿 feature/423-search | Session: 1h 45m | Opus 4.1 | ● Active
```

### Narrow Terminal (<80 columns)
```
[FF] | 🎯 (15/20) 75% | ⏰ #423: 2h 30m/1w 2d | Session: 1h 45m | ● Active
```

## Velocity Impact Examples

### Team Learning Curve

**New Team (Low Velocity = 0.6):**
- Issue #100: Estimated 4h → Adjusted to 6h 40m
- Issue #101: Estimated 2h → Adjusted to 3h 20m
- Milestone with 20h estimated → Adjusted to 33h 20m

**Statusline Output:**
```
[FlowForge] | 🎯 Onboarding Sprint (3/10) [███░░░░░░░] 30% | ⏰ 6h 40m on #100 | 2w 1d milestone | 🌿 feature/100-setup | Session: 2h | Opus 4.1 | ● Active
```

**Experienced Team (High Velocity = 1.3):**
- Issue #200: Estimated 6h → Adjusted to 4h 36m
- Issue #201: Estimated 4h → Adjusted to 3h 4m
- Milestone with 30h estimated → Adjusted to 23h 4m

**Statusline Output:**
```
[FlowForge] | 🎯 Performance Sprint (7/8) [███████░░░] 88% | ⏰ 4h 36m on #200 | 1d 2h milestone | 🌿 perf/200-optimization | Session: 3h 15m | Opus 4.1 | ● Active
```

## Real-World Scenarios

### Monday Morning Sprint Planning

**Scenario:** Team lead reviewing sprint progress at start of week

**Statusline Output:**
```
[FlowForge] | 🎯 Sprint 43 (12/15) [████████░░] 80% | ⏰ 6h on #301 | 1d 4h sprint left | 🌿 feature/301-analytics | Session: 0m | Opus 4.1 | ● Active
```

**Interpretation:**
- Sprint is 80% complete (12/15 issues done)
- Current issue (#301) has 6 hours remaining
- Entire sprint has 1 day 4 hours of work left
- Fresh start (0m session time)
- Good progress, on track for Friday completion

### Friday Afternoon Crunch

**Scenario:** Developer pushing to complete milestone before weekend

**Statusline Output:**
```
[FlowForge] | 🎯 v2.1 Release (19/20) [█████████░] 95% | ⏰ Overrun by 2h on #450 | 2h milestone left | 🌿 fix/450-critical | Session: 6h 30m | Opus 4.1 | ● Active
```

**Interpretation:**
- Release is 95% complete (19/20 issues done)
- Current issue is over estimate by 2 hours
- Only 2 hours total work left in milestone
- Long session (6h 30m) - developer pushing hard
- Need to finish #450 to complete milestone

### Post-Deployment Bug Fix

**Scenario:** Urgent production issue discovered after release

**Statusline Output:**
```
[FlowForge] | 🎯 Hotfix 2.1.1 (0/3) [░░░░░░░░░░] 0% | ⏰ 4h on #501 | 8h hotfix total | 🌿 hotfix/501-login-issue | Session: 45m | Opus 4.1 | ● Active
```

**Interpretation:**
- New hotfix milestone (0/3 complete)
- Critical login issue with 4h estimate
- Total hotfix work estimated at 8h
- 45 minutes into the investigation
- All hands on deck for quick resolution

## Team Collaboration Examples

### Parallel Development

**Team of 3 developers working on same milestone:**

**Developer 1:**
```
[FlowForge] | 🎯 API v3 (5/12) [████░░░░░░] 42% | ⏰ 3h on #600 | 2d 4h milestone | 🌿 api/600-endpoints | Session: 1h 30m | Opus 4.1 | ● Active
```

**Developer 2:**
```
[FlowForge] | 🎯 API v3 (5/12) [████░░░░░░] 42% | ⏰ 5h 30m on #601 | 2d 4h milestone | 🌿 api/601-validation | Session: 2h 45m | Opus 4.1 | ● Active
```

**Developer 3:**
```
[FlowForge] | 🎯 API v3 (5/12) [████░░░░░░] 42% | ⏰ 2h on #602 | 2d 4h milestone | 🌿 api/602-testing | Session: 30m | Opus 4.1 | ● Active
```

**Milestone shows concurrent timeline:** 2d 4h instead of 6d sequential

### Code Review and Handoffs

**Developer finishing issue:**
```
[FlowForge] | 🎯 UI Updates (8/10) [████████░░] 80% | ⏰ 15m on #350 | 4h milestone left | 🌿 ui/350-responsive | Session: 3h 45m | Opus 4.1 | ● Active
```

**After handoff to QA:**
```
[FlowForge] | 🎯 UI Updates (9/10) [█████████░] 90% | ⏰ 4h on #351 | 4h milestone left | 🌿 ui/351-animations | Session: 0m | Opus 4.1 | ● Active
```

## Error and Fallback Examples

### ETA Calculator Unavailable

**When eta_calculator.py is not available:**
```
[FlowForge] | 🎯 Sprint 45 (8/12) [██████░░░░] 67% | ⏱️ Due Oct 15 | 🌿 feature/455-search | Session: 1h 30m | Opus 4.1 | ● Active
```

**Falls back to milestone due date instead of calculated ETA**

### Corrupted Time Tracking Data

**When time tracking file is corrupted:**
```
[FlowForge] | 🎯 Bug Fixes (4/7) [█████░░░░░] 57% | ⏰ 6h on #500 | Unknown milestone | 🌿 fix/500-validation | Session: Unknown | Opus 4.1 | ● Active
```

**Shows estimate without time spent calculation**

### GitHub API Failures

**When GitHub API is unavailable:**
```
[FlowForge] | 🎯 Local Work | ⏰ Working locally | 🌿 feature/branch-name | Session: 2h 15m | Opus 4.1 | ● Active
```

**Graceful degradation to basic information**

## Integration with Other FlowForge Features

### With Time Tracking

**Starting new session:**
```bash
$ /flowforge:session:start 423
✅ Started session for issue #423
📊 Estimate: 6h | Spent: 2h | Remaining: 4h
🎯 Milestone: Feature Sprint (12/15) - 1d 6h remaining
```

**Statusline after session start:**
```
[FlowForge] | 🎯 Feature Sprint (12/15) [████████░░] 80% | ⏰ 4h on #423 | 1d 6h milestone | 🌿 feature/423-search | Session: 0m | Opus 4.1 | ● Active
```

### With Milestone Detection

**When milestone is detected from branch name:**
```bash
# Branch: feature/v2.0/423-advanced-search
```

**Statusline automatically shows v2.0 milestone:**
```
[FlowForge] | 🎯 v2.0 Release (18/25) [███████░░░] 72% | ⏰ 4h on #423 | 2w 3d milestone | 🌿 feature/v2.0/423-search | Session: 1h | Opus 4.1 | ● Active
```

### With Agent Integration

**When fft-project-manager estimates milestone:**
```bash
$ fft-project-manager estimate-milestone "v2.0 Release"
📊 Milestone Analysis:
- Total estimated: 120h
- Completed: 86h (72%)
- Remaining: 34h
- With current velocity (0.9): 38h
- With team size (3): 13h timeline
```

**Statusline reflects agent calculation:**
```
[FlowForge] | 🎯 v2.0 Release (18/25) [███████░░░] 72% | ⏰ 4h on #423 | 13h concurrent | 🌿 feature/423-search | Session: 1h | Opus 4.1 | ● Active
```

## Best Practices Examples

### Good Estimate Practices

**Well-Structured Issue:**
```markdown
# Feature: Advanced Search Filters

## User Story
As a user, I want advanced search filters so I can find content more efficiently.

## Acceptance Criteria
- [ ] Date range filter (2h)
- [ ] Category filter (1h)
- [ ] Tag-based filtering (2h)
- [ ] Save filter presets (1h)

## Technical Tasks
- [ ] Backend API endpoints (4h)
- [ ] Frontend components (3h)
- [ ] Testing (2h)

**Total Estimate: 15h**

## Dependencies
- Requires #420 (search index) to be completed first
```

**Results in accurate tracking:**
```
[FlowForge] | 🎯 Search Features (3/8) [███░░░░░░░] 38% | ⏰ 12h 30m on #423 | 3d 2h milestone | 🌿 feature/423-search | Session: 2h 30m | Opus 4.1 | ● Active
```

### Poor Estimate Practices

**Vague Issue:**
```markdown
# Make the app better

Improve performance and add some new features.

Estimate: 8h
```

**Results in poor tracking:**
```
[FlowForge] | 🎯 Improvements (1/5) [██░░░░░░░░] 20% | ⏰ Overrun by 12h on #450 | Unknown milestone | 🌿 misc/450-improvements | Session: 20h | Opus 4.1 | ● Active
```

## Summary

The dual ETA feature provides comprehensive time awareness through:

1. **Individual Progress**: See exactly how much time remains on current task
2. **Project Context**: Understand milestone timeline and overall progress
3. **Velocity Awareness**: Historical performance automatically adjusts estimates
4. **Team Coordination**: Concurrent work calculations for realistic timelines
5. **Professional Display**: Clean, informative statusline integration

The examples above demonstrate how the dual ETA feature adapts to various real-world scenarios while maintaining accuracy and usefulness across different team sizes, project types, and development workflows.

---

**Version:** FlowForge 2.0
**Document Type:** Examples and Use Cases
**Author:** FlowForge Documentation Team
**Last Updated:** 2024-09-15