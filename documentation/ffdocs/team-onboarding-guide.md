# FlowForge v2.0 Team Onboarding Guide

## Overview

Welcome to FlowForge v2.0! This guide helps teams get started with the new Hybrid Time Aggregation System that enables accurate billing reports while preserving developer privacy and ensuring 99.99% reliability.

**Core Promise**: FlowForge ensures every minute of your team's work is tracked, aggregated, and billable with zero friction and maximum privacy protection.

## Quick Start (15 Minutes)

### For Team Leads

```bash
# 1. Install FlowForge v2.0 for your team
curl -sSL https://get.flowforge.dev/v2.0/team-install.sh | bash

# 2. Initialize team configuration  
flowforge:team:init
# Team name: [Your Team Name]
# Primary project repository: [github.com/company/project]
# Billing client: [client-name or internal]
# Privacy level: [balanced] (recommended for most teams)

# 3. Invite team members
flowforge:team:invite alice@company.com bob@company.com charlie@company.com
# Sends setup instructions to each team member

# 4. Generate first team report (after members join)
flowforge:team:summary --current-week
```

### For Team Members

```bash
# 1. Install FlowForge v2.0 individually
curl -sSL https://get.flowforge.dev/v2.0/install.sh | bash

# 2. Join your team (using invitation link from team lead)
flowforge:team:join --invitation-code ABC123DEF456

# 3. Configure privacy preferences
flowforge:privacy:configure --guided-setup

# 4. Start tracking time immediately
flowforge:session:start 123 "Getting started with FlowForge v2.0"
```

## Team Architecture Overview

### How FlowForge v2.0 Protects Your Data

```
┌─────────────────────────────────────────────────────────────┐
│                    FlowForge Team Architecture              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 Developer Machine (Private Data)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ .flowforge/user/alice/                              │   │
│  │ ├── 🔒 Detailed time logs (PRIVATE)               │   │
│  │ ├── 🔒 Break timing (PRIVATE)                      │   │
│  │ ├── 🔒 Work patterns (PRIVATE)                     │   │
│  │ └── 🔒 Productivity data (PRIVATE)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼ Privacy-Preserving Aggregation │
│  📊 Team Repository (Shared Billing Data)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ .flowforge/team/summaries/                          │   │
│  │ ├── ✅ Billable hours per issue                    │   │
│  │ ├── ✅ Daily/weekly totals                         │   │
│  │ ├── ✅ Project time allocation                     │   │
│  │ └── ✅ Team productivity metrics                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Benefits for Teams

- **Privacy Protection**: Personal work patterns stay on each developer's machine
- **Billing Transparency**: Team leads get accurate billing reports instantly  
- **Zero Friction**: Time tracking works exactly like before for developers
- **99.99% Reliability**: Multi-layer backup system prevents data loss
- **Git Integration**: Works seamlessly with existing git workflows

## Team Setup Process

### Step 1: Team Lead Initial Setup

```bash
# Install as team administrator
curl -sSL https://get.flowforge.dev/v2.0/team-install.sh | bash --team-admin

# Configure team settings
flowforge:team:configure --interactive

# Team Configuration Wizard:
# =========================
# Team name: Development Team
# Repository: github.com/company/main-project
# Additional repositories? [y/n]: y
#   - github.com/company/frontend
#   - github.com/company/backend
# 
# Privacy Settings:
# Default privacy level: [conservative|balanced|transparent]: balanced
# Allow individual privacy overrides: [y/n]: y
# 
# Billing Settings:
# Primary client: ClientCorp
# Hourly rate: $150 (optional, for budget tracking)
# Currency: USD
# 
# Aggregation Settings:
# Aggregation frequency: [1|5|15 minutes]: 5
# Backup retention: [30|60|90 days]: 90
# 
# Provider Integrations:
# GitHub: [y/n]: y
# Slack notifications: [y/n]: y
# Notion sync: [y/n]: n
# 
# Configuration saved to .flowforge/team/config.json
```

### Step 2: Invite Team Members

```bash
# Generate invitation codes for team members
flowforge:team:invite --generate-codes 5

# Output:
# Team Invitation Codes Generated
# ===============================
# Alice Johnson: ABC123DEF456
# Bob Smith: GHI789JKL012  
# Charlie Brown: MNO345PQR678
# Diana Lee: STU901VWX234
# Eve Wilson: YZA567BCD890
# 
# Send these codes to team members with setup instructions:
# 
# Setup Instructions for Team Members:
# 1. Install FlowForge: curl -sSL https://get.flowforge.dev/v2.0/install.sh | bash
# 2. Join team: flowforge:team:join --code [YOUR_CODE]
# 3. Start tracking: flowforge:session:start [ISSUE_NUMBER] "[DESCRIPTION]"
```

### Step 3: Team Member Onboarding

Each team member follows this process:

```bash
# 1. Install FlowForge v2.0
curl -sSL https://get.flowforge.dev/v2.0/install.sh | bash

# 2. Join the team
flowforge:team:join --code ABC123DEF456

# Output:
# Joining Development Team...
# ✅ Team configuration downloaded
# ✅ User directory created (.flowforge/user/alice/)  
# ✅ Privacy settings initialized
# ✅ Git hooks installed
# ✅ Background daemon started
# 
# Welcome to Development Team!
# Your privacy level: Balanced
# Team repositories: 3 configured
# Ready to track time: YES

# 3. Configure personal privacy preferences (optional)
flowforge:privacy:configure

# Privacy Configuration:
# =====================
# Current level: Balanced (inherited from team)
# 
# What data do you want to share with team?
# Daily total hours: [y/n]: y
# Number of work sessions: [y/n]: n  
# Break duration details: [y/n]: n
# Exact start/stop times: [y/n]: n
# 
# Time rounding preference:
# Round times to: [5|15|30 minutes]: 15
# 
# Productivity metrics:
# Share productivity scores: [y/n]: n
# Share focus time analysis: [y/n]: n
# 
# Privacy settings saved. Team will see:
# ✅ Your daily billable hours
# ✅ Issues you worked on  
# ✅ Project time allocation
# ❌ Personal work patterns (PRIVATE)

# 4. Test time tracking
flowforge:session:start 123 "Team onboarding complete"
# Work for a few minutes...
flowforge:session:end "Ready to contribute!"

# 5. Verify team integration
flowforge:team:status
# Expected:
# Team: Development Team
# Your status: Active member ✅
# Privacy level: Balanced
# Data sharing: Enabled ✅
# Last aggregation: 30 seconds ago ✅
# Team members: 5 total, 3 active today
```

## Team Workflows

### Daily Development Workflow

**Individual Developer Experience (Unchanged)**:
```bash
# Morning: Start work session
flowforge:session:start 456 "Implement user authentication"

# During work: Sessions tracked automatically
git add . && git commit -m "Add login form validation"
# ✅ Time aggregated automatically via git hook

# End of day: End session  
flowforge:session:end "Authentication feature complete"

# Check personal status anytime
flowforge:time:status
```

**Team Lead Experience (Enhanced)**:
```bash
# Morning: Check team status
flowforge:team:summary --today

# Output:
# Development Team - Daily Summary
# ===============================
# Date: 2025-09-05
# 
# Team Status:
# ✅ 4/5 developers active today
# ✅ 28.5 total hours tracked
# ✅ 26.2 billable hours
# ✅ All aggregations successful
# 
# Top Issues Today:
# #456 User authentication (12.5 hours, 3 developers)
# #789 Database migration (8.2 hours, 2 developers)  
# #101 Bug fixes (5.8 hours, 2 developers)
# 
# Productivity Insights:
# 📈 15% above weekly average
# 🎯 On track for sprint goals
# 🔄 3 active pull requests

# Generate client billing report
flowforge:billing:generate --client ClientCorp --week current

# Weekly team retrospective data
flowforge:team:analytics --week current --privacy-safe
```

### Weekly Team Rituals

**Monday: Sprint Planning Integration**
```bash
# Team lead: Generate sprint capacity report
flowforge:capacity:analyze --next-sprint --team-size 5

# Output:
# Sprint Capacity Analysis
# =======================
# Team: Development Team (5 developers)
# Sprint duration: 2 weeks
# 
# Available Capacity:
# Total person-hours: 400 hours
# Planned vacation: -16 hours (Alice: 2 days)
# Historical productivity: 85% (based on last 4 sprints)
# Effective capacity: ~326 hours
# 
# Recommendation: Plan for 320-330 story points based on team velocity
```

**Friday: Sprint Review & Billing**
```bash
# Generate sprint completion report
flowforge:sprint:report --sprint current --detailed

# Generate client billing for the week
flowforge:billing:generate --week current --format pdf --send-to accounting@company.com
```

### Monthly Team Analytics

```bash
# Team productivity trends
flowforge:team:trends --month current

# Output:
# Development Team - Monthly Trends
# =================================
# Month: September 2025
# 
# Productivity Metrics:
# 📊 Average team velocity: 85% (up 5% from last month)
# ⏱️  Average daily hours: 7.8 per developer
# 🎯 Sprint goal completion: 92% (4/4 sprints completed)
# 
# Time Distribution:
# 🚀 Feature development: 68% (target: 70%)
# 🐛 Bug fixes: 18% (target: 15%)
# 🔧 Technical debt: 10% (target: 10%)
# 📚 Learning/research: 4% (target: 5%)
# 
# Client Billing:
# 💰 Total billable: 1,456 hours
# 💵 Revenue: $218,400 (at $150/hour)
# 📈 5% increase from last month

# Privacy-safe team insights
flowforge:team:insights --privacy-level safe

# Output shows team-level patterns without individual details:
# - Most productive days of week (Tuesday-Thursday)  
# - Optimal meeting schedules (avoid 2-4pm)
# - Project context switching frequency
# - Team collaboration patterns
```

## Privacy and Security

### What Team Leads Can See

**✅ Shared Data (Team Summaries)**:
- Daily billable hours per developer
- Issues worked on and time allocation
- Project-level productivity metrics
- Weekly and monthly team totals
- Client billing summaries
- Sprint velocity and capacity

**❌ Private Data (Stays on Individual Machines)**:
- Exact start/stop times for work sessions
- Break timing and frequency  
- Personal productivity fluctuations
- Detailed work interruption patterns
- Individual context switching behavior

### Privacy Level Comparison

| Data Element | Conservative | Balanced | Transparent |
|--------------|-------------|----------|-------------|
| Daily hours | Rounded to 1 hour | Rounded to 15 min | Exact |  
| Session count | Hidden | Hidden | Visible |
| Break patterns | Hidden | Hidden | Aggregated only |
| Start times | Not shared | ±1 hour random | Rounded to 15 min |
| Productivity scores | Hidden | Team average only | Individual visible |
| Issue details | Title only | Full details | Full details + time breakdown |

### Security Features

```bash
# Data encryption at rest
find .flowforge -name "*.json" -exec echo "Encrypted: {}" \;

# Access control verification
flowforge:security:audit --comprehensive

# Output:
# FlowForge Security Audit
# ========================
# 
# File Permissions:
# ✅ User data: 700 (owner only)
# ✅ Team data: 644 (team readable)
# ✅ Private keys: 600 (owner only)
# 
# Network Security:
# ✅ HTTPS only for all API calls
# ✅ Token-based authentication
# ✅ No sensitive data in git commits
# 
# Data Protection:
# ✅ SHA256 checksums on all data
# ✅ Automatic backup encryption
# ✅ GDPR compliance verified
```

## Troubleshooting Team Issues

### Issue 1: Team Member Not Showing Up

**Symptoms**: Team summary shows 0 hours for developer who is working

```bash
# Team lead: Check team member status
flowforge:team:diagnose --member alice

# Output:
# Diagnosing team member: alice
# ============================
# FlowForge installation: ✅ v2.0.0 installed
# Team membership: ❌ Not joined (invitation pending)
# Git hooks: ❌ Not installed
# Background daemon: ❌ Not running
# 
# Recommended action: Resend invitation and installation instructions
```

**Solution**:
```bash
# Team lead: Resend invitation
flowforge:team:invite --resend alice@company.com

# Team member: Complete setup
flowforge:team:join --code NEW_CODE_HERE
flowforge:daemon:start
```

### Issue 2: Privacy Too Restrictive

**Symptoms**: Team billing reports showing zero hours despite active development

```bash
# Team lead: Check privacy settings impact
flowforge:team:privacy-audit

# Output:
# Team Privacy Audit
# ==================
# 
# Members with restrictive settings:
# - Bob: Conservative mode (shares daily totals only)
# - Charlie: Custom settings (no time sharing)
# 
# Impact on team reports:
# - Missing ~40% of actual billable hours
# - Client billing underreported
# 
# Recommendations:
# 1. Talk to Bob about using Balanced mode
# 2. Charlie needs to enable time sharing for billing
```

**Solution**:
```bash
# Team discussion and voluntary privacy adjustment
# Bob adjusts settings:
flowforge:privacy:configure --level balanced

# Charlie enables billing data sharing:
flowforge:privacy:configure --enable-billing-share
```

### Issue 3: Aggregation Delays

**Symptoms**: Team summaries are hours behind current work

```bash
# Team lead: Check aggregation health
flowforge:aggregation:diagnose --detailed

# Output:
# Aggregation System Diagnosis
# ============================
# 
# Layer 1 (Git hooks): ⚠️ 15% failure rate (network issues)
# Layer 2 (Background daemon): ✅ Processing backlog successfully
# Layer 3 (CI/CD): ✅ Running every 4 hours
# Layer 4 (Manual): ✅ Available
# 
# Current backlog: 23 pending aggregations
# Estimated processing time: 5 minutes
# 
# Root cause: Intermittent network connectivity to GitHub
```

**Solution**:
```bash
# Force immediate aggregation
flowforge:aggregation:force --all-pending

# Configure for better offline resilience  
flowforge:config:set aggregation.offline_mode true
```

## Advanced Team Features

### Custom Billing Reports

```bash
# Create custom billing report template
flowforge:billing:template --create executive-summary

# Template configuration:
# Report name: Executive Summary
# Frequency: Weekly
# Recipients: ceo@company.com, pm@company.com
# Content:
#   - Team productivity overview
#   - Budget vs actual
#   - Project milestone progress
#   - Risk indicators
# Privacy level: Executive (no individual details)

# Generate custom report
flowforge:billing:generate --template executive-summary --week current
```

### Team Performance Analytics

```bash
# Team velocity analysis  
flowforge:analytics:velocity --trend 6-months

# Capacity planning
flowforge:analytics:capacity --project "Q4 Platform Rewrite" --confidence 85%

# Team health monitoring
flowforge:analytics:health --include-burnout-indicators --privacy-safe
```

### Integration with Project Management

```bash
# Jira integration for enterprise teams
flowforge:providers:configure jira
# Project key: DEV
# Board ID: 123
# Sync time tracking: yes

# Linear integration for startups
flowforge:providers:configure linear  
# Team ID: abc123
# Sync labels: yes
# Auto-create time entries: yes

# Slack integration for notifications
flowforge:providers:configure slack
# Workspace: company.slack.com
# Channel: #development
# Notify on: milestones, overtime, issues
```

## Success Metrics

### Team Onboarding Success Criteria

- [ ] ✅ 100% of team members successfully installed FlowForge v2.0
- [ ] ✅ All team members joined team aggregation  
- [ ] ✅ Privacy settings configured to enable billing reports
- [ ] ✅ First team billing report generated successfully
- [ ] ✅ All developers using FlowForge in daily workflow
- [ ] ✅ Team lead can generate reports independently
- [ ] ✅ Zero friction added to development workflow
- [ ] ✅ All historical time data preserved

### Ongoing Team Health Metrics

**Weekly Checks**:
```bash
flowforge:team:health --weekly-report

# Target metrics:
# - Aggregation success rate: >99%
# - Team participation: 100%
# - Billing data completeness: >95%
# - Developer satisfaction: >8/10
```

**Monthly Reviews**:
```bash
flowforge:team:review --monthly

# Review focus areas:
# - Privacy settings still appropriate
# - Team productivity trends
# - Client billing accuracy
# - System reliability metrics
```

## Getting Help

### Team Support Resources

**Documentation**:
- [Privacy Configuration Guide](privacy-configuration-guide.md)
- [Billing Reports Manual](billing-reports-manual.md)
- [Troubleshooting Runbook](troubleshooting-runbook.md)
- [Advanced Features Guide](advanced-features-guide.md)

**Support Channels**:
- **Team Setup**: `support+teams@flowforge.dev`
- **Privacy Questions**: `privacy@flowforge.dev`
- **Billing Issues**: `billing@flowforge.dev`
- **Technical Support**: [GitHub Issues](https://github.com/JustCode-CruzAlex/FlowForge/issues)
- **Community**: [Discord Server](https://discord.gg/flowforge)

**Emergency Support**:
- **Data Loss**: `emergency+data@flowforge.dev`
- **Billing Crisis**: `emergency+billing@flowforge.dev`
- **Security Incident**: `security@flowforge.dev`

### Team Training Resources

```bash
# Generate team-specific training materials
flowforge:training:generate --team "Development Team"

# Outputs:
# - team-quickstart.pdf
# - privacy-best-practices.md
# - billing-workflow-guide.pdf
# - troubleshooting-checklist.pdf
```

## Conclusion

FlowForge v2.0 transforms team time tracking from a necessary overhead into a competitive advantage. Teams get accurate billing data, comprehensive project insights, and productivity analytics while developers maintain privacy and zero workflow friction.

**Key Takeaways**:
- **Setup Time**: 15 minutes for entire team to get started
- **Learning Curve**: Minimal - familiar commands with enhanced capabilities
- **Privacy Protection**: Granular control over what data is shared
- **Reliability**: 99.99% uptime ensures no billable hours are lost
- **Team Benefits**: Instant billing reports, capacity planning, productivity insights

**Remember**: TIME = MONEY. FlowForge v2.0 ensures your team gets paid for every minute of valuable work while providing the insights needed to optimize team performance and project delivery.

---
*FlowForge v2.0 Team Onboarding Guide*  
*Version 1.0 - Complete team setup process*  
*Generated: 2025-09-05*