# FlowForge Developer Setup Guide - Team Environment

## Overview

This guide provides step-by-step instructions for individual developers joining a FlowForge team environment. The setup process is designed to be completed in under 30 minutes and ensures seamless integration with team workflows while maintaining individual productivity tracking.

## Prerequisites

### System Requirements

- **Operating System**: Linux, macOS, or Windows with WSL2
- **Node.js**: Version 18.0 or higher
- **Git**: Version 2.30 or higher
- **Terminal**: Bash-compatible terminal
- **Memory**: Minimum 4GB RAM, 8GB recommended
- **Storage**: 2GB free space for FlowForge and dependencies

### Access Requirements

- **Notion Account**: Active Notion account with team workspace access
- **GitHub Account**: GitHub account with repository access
- **Team Credentials**: API keys and configuration provided by team lead
- **Network Access**: Unrestricted access to Notion and GitHub APIs

### Pre-Setup Information from Team Lead

Before starting, ensure you have received from your team lead:

1. **Team Configuration Package**:
   ```
   - team-config.json (team configuration file)
   - developer-template.env (environment template)
   - notion-api-key (your individual API key)
   - shared-database-id (team Notion database ID)
   - setup-validation-checklist.md
   ```

2. **Team Information**:
   - Team name and ID
   - Your assigned developer namespace
   - Role and permissions level
   - Shared resource locations

## Step-by-Step Developer Onboarding

### Phase 1: Environment Preparation (5 minutes)

#### 1.1 Create Workspace Directory

```bash
# Create dedicated workspace for FlowForge team development
mkdir -p ~/flowforge-team
cd ~/flowforge-team

# Create environment structure
mkdir -p {config,backups,logs,cache}
```

#### 1.2 Set Up Environment Variables

```bash
# Create environment file from team template
cp team-template.env .env

# Edit environment file with your specific values
cat > .env << EOF
# Individual Developer Configuration
DEVELOPER_NAME="Your Full Name"
DEVELOPER_EMAIL="your.email@company.com"
DEVELOPER_GITHUB="your-github-username"
DEVELOPER_NAMESPACE="your-assigned-namespace"

# Notion Configuration
NOTION_API_KEY="your-individual-api-key-here"
NOTION_DATABASE_ID="shared-team-database-id-here"
NOTION_USER_FILTER="auto"

# GitHub Configuration (if using GitHub provider)
GITHUB_TOKEN="your-github-token"
GITHUB_REPO_OWNER="team-github-org"
GITHUB_REPO_NAME="project-repository"

# Team Configuration
TEAM_ID="team-identifier"
TEAM_NAME="Your Team Name"
TEAM_CONFIG_PATH="./config/team-config.json"

# FlowForge Settings
FLOWFORGE_LOG_LEVEL="info"
FLOWFORGE_CACHE_TTL="300000"
FLOWFORGE_SYNC_INTERVAL="30000"
EOF

# Secure environment file
chmod 600 .env
```

#### 1.3 Validate Prerequisites

```bash
# Check Node.js version
node --version  # Should be 18.0+

# Check Git configuration
git config --global user.name
git config --global user.email

# Test Notion API access (simple curl test)
curl -H "Authorization: Bearer $NOTION_API_KEY" \
     -H "Notion-Version: 2022-06-28" \
     https://api.notion.com/v1/users/me
```

### Phase 2: FlowForge Installation (10 minutes)

#### 2.1 Download and Install FlowForge v2.0

```bash
# Clone FlowForge repository
git clone https://github.com/JustCode-CruzAlex/FlowForge.git
cd FlowForge

# Checkout v2.0 release branch
git checkout release/v2.0

# Install dependencies
npm install

# Build FlowForge
npm run build

# Create command links
npm run link-commands

# Verify installation
./run_ff_command.sh flowforge:version:check
```

#### 2.2 Initialize FlowForge Configuration

```bash
# Initialize FlowForge for team usage
./run_ff_command.sh flowforge:team:init-developer \
  --team-config "../config/team-config.json" \
  --developer-name "$DEVELOPER_NAME" \
  --namespace "$DEVELOPER_NAMESPACE"

# Expected output:
# ✅ Developer namespace created: your-namespace
# ✅ Team configuration loaded
# ✅ Individual configuration initialized
# ✅ Cache directories created
# ✅ Session management configured
```

#### 2.3 Configure Team Provider Integration

```bash
# Configure Notion provider for team usage
./run_ff_command.sh flowforge:provider:setup \
  --name "team-notion" \
  --type "notion" \
  --team-mode true \
  --api-key "$NOTION_API_KEY" \
  --database-id "$NOTION_DATABASE_ID" \
  --user-filter "$NOTION_USER_FILTER" \
  --namespace "$DEVELOPER_NAMESPACE"

# Configure GitHub provider (if enabled)
if [[ -n "$GITHUB_TOKEN" ]]; then
  ./run_ff_command.sh flowforge:provider:setup \
    --name "team-github" \
    --type "github" \
    --team-mode true \
    --token "$GITHUB_TOKEN" \
    --owner "$GITHUB_REPO_OWNER" \
    --repo "$GITHUB_REPO_NAME" \
    --namespace "$DEVELOPER_NAMESPACE"
fi

# Configure JSON fallback provider
./run_ff_command.sh flowforge:provider:setup \
  --name "local-json" \
  --type "json" \
  --file-path ".flowforge/tasks.json" \
  --auto-save true \
  --namespace "$DEVELOPER_NAMESPACE"
```

### Phase 3: Team Integration Setup (10 minutes)

#### 3.1 Register with Team System

```bash
# Register as team member
./run_ff_command.sh flowforge:team:register \
  --team-id "$TEAM_ID" \
  --developer-name "$DEVELOPER_NAME" \
  --email "$DEVELOPER_EMAIL" \
  --github "$DEVELOPER_GITHUB" \
  --namespace "$DEVELOPER_NAMESPACE"

# Expected output:
# ✅ Successfully registered with team: Your Team Name
# ✅ Namespace assigned: your-namespace
# ✅ Permissions configured: developer
# ✅ Team provider access granted
# ✅ Individual tracking initialized
```

#### 3.2 Configure Namespace Isolation

```bash
# Set up namespace isolation
./run_ff_command.sh flowforge:namespace:configure \
  --namespace "$DEVELOPER_NAMESPACE" \
  --isolation-level "strict" \
  --cache-strategy "individual" \
  --sync-mode "team-aware"

# Create namespace-specific directories
mkdir -p .flowforge/namespaces/$DEVELOPER_NAMESPACE/{cache,sessions,reports}

# Initialize namespace tracking
./run_ff_command.sh flowforge:namespace:init \
  --namespace "$DEVELOPER_NAMESPACE"
```

#### 3.3 Set Up GitHub Integration

```bash
# Configure GitHub integration for team workflow
./run_ff_command.sh flowforge:github:setup \
  --mode "team" \
  --repo "$GITHUB_REPO_OWNER/$GITHUB_REPO_NAME" \
  --branch-prefix "$DEVELOPER_NAMESPACE/" \
  --issue-labels "developer:$DEVELOPER_NAMESPACE"

# Set up Git hooks for team workflow
./run_ff_command.sh flowforge:hooks:install \
  --mode "team" \
  --namespace "$DEVELOPER_NAMESPACE"

# Configure branch naming convention
git config flowforge.branch.prefix "$DEVELOPER_NAMESPACE/"
git config flowforge.team.namespace "$DEVELOPER_NAMESPACE"
```

### Phase 4: Validation and Testing (5 minutes)

#### 4.1 Connection Validation

```bash
# Test all provider connections
./run_ff_command.sh flowforge:team:validate-connections

# Expected output:
# ✅ Notion provider: Connected successfully
# ✅ GitHub provider: Connected successfully
# ✅ JSON provider: Available and operational
# ✅ Team database: Accessible with correct permissions
# ✅ Namespace isolation: Working correctly
```

#### 4.2 Create Test Task

```bash
# Create your first team task
./run_ff_command.sh flowforge:task:create \
  --provider "team-notion" \
  --title "Setup Validation - $DEVELOPER_NAME" \
  --description "Testing FlowForge team integration setup" \
  --status "ready" \
  --priority "medium" \
  --assignee "$DEVELOPER_EMAIL" \
  --labels "setup,validation,team" \
  --namespace "$DEVELOPER_NAMESPACE"

# Expected output:
# ✅ Task created successfully
# 📝 Task ID: TASK-001
# 🎯 Assigned to: your.email@company.com
# 📊 Provider: team-notion
# 🏷️ Namespace: your-namespace
```

#### 4.3 Time Tracking Test

```bash
# Start time tracking session
./run_ff_command.sh flowforge:session:start TASK-001

# Expected output:
# ⏱️ Session started for: Setup Validation - Your Name
# 🎯 Task ID: TASK-001
# 📊 Provider: team-notion
# 🏷️ Namespace: your-namespace
# ⏰ Started at: 2025-09-16 10:30:00

# Check session status
./run_ff_command.sh flowforge:session:status

# Pause session
./run_ff_command.sh flowforge:session:pause

# Resume session
./run_ff_command.sh flowforge:session:resume

# End session
./run_ff_command.sh flowforge:session:end "Setup validation completed successfully"
```

#### 4.4 Team Interaction Test

```bash
# List your assigned tasks (should show only your tasks)
./run_ff_command.sh flowforge:task:list \
  --provider "team-notion" \
  --assigned-to "$DEVELOPER_EMAIL"

# Test team visibility (if you have permission)
./run_ff_command.sh flowforge:task:list \
  --provider "team-notion" \
  --team-view true

# Check team status
./run_ff_command.sh flowforge:team:status
```

## Individual Namespace Configuration

### Namespace Structure

Your individual namespace is isolated and contains:

```
.flowforge/namespaces/your-namespace/
├── config/
│   ├── developer.json          # Your personal configuration
│   ├── providers.json          # Provider-specific settings
│   └── preferences.json        # UI and behavior preferences
├── cache/
│   ├── tasks/                  # Cached task data
│   ├── sessions/               # Session cache
│   └── providers/              # Provider response cache
├── sessions/
│   ├── active/                 # Active session data
│   ├── completed/              # Completed session history
│   └── reports/                # Session reports
├── reports/
│   ├── daily/                  # Daily productivity reports
│   ├── weekly/                 # Weekly summaries
│   └── monthly/                # Monthly analytics
└── logs/
    ├── activity.log            # Activity log
    ├── errors.log              # Error log
    └── performance.log         # Performance metrics
```

### Personal Configuration Options

```json
{
  "developer": {
    "name": "Your Full Name",
    "email": "your.email@company.com",
    "namespace": "your-namespace",
    "role": "developer",
    "preferences": {
      "defaultProvider": "team-notion",
      "autoSync": true,
      "syncInterval": 30000,
      "notifications": {
        "enabled": true,
        "taskUpdates": true,
        "sessionReminders": true,
        "teamMentions": true
      },
      "ui": {
        "theme": "default",
        "dateFormat": "YYYY-MM-DD",
        "timeFormat": "24h",
        "timezone": "America/New_York"
      },
      "productivity": {
        "dailyGoal": 8,
        "reminderInterval": 30,
        "breakReminders": true,
        "focusMode": false
      }
    }
  },
  "providers": {
    "team-notion": {
      "priority": 1,
      "fallback": "local-json",
      "cache": {
        "enabled": true,
        "ttl": 300000
      },
      "sync": {
        "enabled": true,
        "interval": 30000,
        "batchSize": 20
      }
    },
    "local-json": {
      "priority": 2,
      "autoBackup": true,
      "backupInterval": 3600000
    }
  },
  "security": {
    "encryptLocalData": true,
    "sessionTimeout": 28800000,
    "auditLogging": true
  }
}
```

## Time Tracking Per Developer

### Individual Time Tracking

Each developer has isolated time tracking with:

1. **Personal Session Management**:
   - Independent session state
   - Individual productivity metrics
   - Personal time goals and reminders

2. **Data Isolation**:
   - Time data stored in developer namespace
   - No cross-contamination between developers
   - Individual reporting and analytics

3. **Team Integration**:
   - Time contributes to team aggregations
   - Optional sharing of productivity metrics
   - Team-level reporting includes individual data

### Time Tracking Commands

```bash
# Start session with detailed tracking
./run_ff_command.sh flowforge:session:start TASK-ID \
  --category "development" \
  --project "ProjectName" \
  --billable true \
  --rate 75.00

# Track time with automatic categorization
./run_ff_command.sh flowforge:time:track \
  --task TASK-ID \
  --duration "2h 30m" \
  --category "development" \
  --auto-categorize true

# Generate individual time report
./run_ff_command.sh flowforge:time:report \
  --period "today" \
  --format "detailed" \
  --include-breaks true

# Submit time for team aggregation
./run_ff_command.sh flowforge:time:submit \
  --period "today" \
  --approve true
```

### Productivity Analytics

```bash
# View personal productivity dashboard
./run_ff_command.sh flowforge:analytics:personal \
  --period "week" \
  --metrics "all"

# Compare with team averages (if permitted)
./run_ff_command.sh flowforge:analytics:compare \
  --scope "team" \
  --anonymous true

# Set productivity goals
./run_ff_command.sh flowforge:goals:set \
  --daily-hours 8 \
  --weekly-tasks 25 \
  --focus-time 6
```

## GitHub Integration Setup

### Repository Configuration

```bash
# Configure repository-specific settings
./run_ff_command.sh flowforge:github:repo-setup \
  --repo "$GITHUB_REPO_OWNER/$GITHUB_REPO_NAME" \
  --team-mode true \
  --namespace "$DEVELOPER_NAMESPACE"

# Set up branch naming conventions
git config flowforge.branch.feature "$DEVELOPER_NAMESPACE/feature/"
git config flowforge.branch.bugfix "$DEVELOPER_NAMESPACE/bugfix/"
git config flowforge.branch.hotfix "$DEVELOPER_NAMESPACE/hotfix/"

# Configure issue linking
./run_ff_command.sh flowforge:github:issue-linking \
  --enable true \
  --auto-link true \
  --close-on-merge true
```

### Workflow Integration

```bash
# Set up Git hooks for team workflow
./run_ff_command.sh flowforge:hooks:setup \
  --pre-commit "time-tracking-check" \
  --post-commit "session-update" \
  --pre-push "team-sync-check"

# Configure PR automation
./run_ff_command.sh flowforge:github:pr-automation \
  --auto-create false \
  --template "team-pr-template" \
  --reviewers "team-leads"

# Set up issue automation
./run_ff_command.sh flowforge:github:issue-automation \
  --auto-assign true \
  --labels "developer:$DEVELOPER_NAMESPACE" \
  --milestone-sync true
```

## Testing Procedures

### Comprehensive Setup Validation

```bash
# Run complete setup validation
./run_ff_command.sh flowforge:setup:validate \
  --comprehensive true \
  --fix-issues true

# Test all major workflows
./run_ff_command.sh flowforge:test:workflows \
  --include "task-management,time-tracking,team-sync,github-integration"

# Performance benchmarking
./run_ff_command.sh flowforge:test:performance \
  --duration "5m" \
  --operations "create-task,update-task,start-session,sync"
```

### Individual Component Testing

```bash
# Test Notion provider
./run_ff_command.sh flowforge:test:provider team-notion \
  --operations "create,read,update,delete" \
  --verify-filtering true

# Test namespace isolation
./run_ff_command.sh flowforge:test:namespace $DEVELOPER_NAMESPACE \
  --isolation-level "strict" \
  --cross-contamination-check true

# Test time tracking accuracy
./run_ff_command.sh flowforge:test:time-tracking \
  --duration "1m" \
  --precision-check true

# Test team integration
./run_ff_command.sh flowforge:test:team-integration \
  --sync-test true \
  --aggregation-test true
```

### Ongoing Health Checks

```bash
# Daily health check (add to cron)
./run_ff_command.sh flowforge:health:daily \
  --namespace "$DEVELOPER_NAMESPACE" \
  --report-to-team true

# Weekly comprehensive check
./run_ff_command.sh flowforge:health:weekly \
  --deep-scan true \
  --performance-analysis true

# Monthly optimization
./run_ff_command.sh flowforge:optimize:monthly \
  --cache-cleanup true \
  --config-optimization true
```

## Troubleshooting Common Issues

### Issue 1: Namespace Access Problems

**Symptoms**: Cannot access tasks, session errors, permission denied

**Diagnosis**:
```bash
# Check namespace configuration
./run_ff_command.sh flowforge:namespace:diagnose $DEVELOPER_NAMESPACE

# Verify permissions
./run_ff_command.sh flowforge:permissions:check \
  --namespace "$DEVELOPER_NAMESPACE" \
  --detailed true
```

**Solutions**:
```bash
# Reset namespace permissions
./run_ff_command.sh flowforge:namespace:reset-permissions $DEVELOPER_NAMESPACE

# Recreate namespace if corrupted
./run_ff_command.sh flowforge:namespace:recreate $DEVELOPER_NAMESPACE \
  --backup-data true \
  --preserve-sessions true
```

### Issue 2: Provider Connection Problems

**Symptoms**: API errors, sync failures, timeout issues

**Diagnosis**:
```bash
# Test all provider connections
./run_ff_command.sh flowforge:provider:test-all \
  --detailed true \
  --namespace "$DEVELOPER_NAMESPACE"

# Check API rate limits
./run_ff_command.sh flowforge:provider:rate-status team-notion
```

**Solutions**:
```bash
# Refresh provider connections
./run_ff_command.sh flowforge:provider:refresh team-notion

# Clear provider cache
./run_ff_command.sh flowforge:provider:cache-clear team-notion

# Switch to fallback provider temporarily
./run_ff_command.sh flowforge:provider:fallback enable local-json
```

### Issue 3: Time Tracking Inconsistencies

**Symptoms**: Missing time entries, incorrect durations, sync conflicts

**Diagnosis**:
```bash
# Audit time tracking data
./run_ff_command.sh flowforge:time:audit \
  --namespace "$DEVELOPER_NAMESPACE" \
  --period "week"

# Check for sync conflicts
./run_ff_command.sh flowforge:sync:conflicts \
  --type "time-tracking" \
  --show-resolution true
```

**Solutions**:
```bash
# Reconcile time tracking data
./run_ff_command.sh flowforge:time:reconcile \
  --source "local" \
  --target "team-notion" \
  --strategy "merge"

# Reset time tracking if needed
./run_ff_command.sh flowforge:time:reset \
  --backup true \
  --preserve-today true
```

### Issue 4: Team Sync Problems

**Symptoms**: Not seeing team updates, aggregation delays, isolation failures

**Diagnosis**:
```bash
# Check team connectivity
./run_ff_command.sh flowforge:team:connectivity-test

# Verify aggregation status
./run_ff_command.sh flowforge:aggregation:status \
  --detailed true
```

**Solutions**:
```bash
# Force team sync
./run_ff_command.sh flowforge:team:sync force

# Reset team configuration
./run_ff_command.sh flowforge:team:config-reset \
  --preserve-individual true

# Rejoin team if necessary
./run_ff_command.sh flowforge:team:rejoin \
  --team-id "$TEAM_ID" \
  --namespace "$DEVELOPER_NAMESPACE"
```

## Best Practices for Team Development

### Daily Workflow

1. **Morning Setup**:
   ```bash
   # Start your day with a health check
   ./run_ff_command.sh flowforge:health:daily

   # Sync with team updates
   ./run_ff_command.sh flowforge:team:sync

   # Review assigned tasks
   ./run_ff_command.sh flowforge:task:list --assigned-to me --status ready
   ```

2. **Work Session Management**:
   ```bash
   # Start focused work session
   ./run_ff_command.sh flowforge:session:start TASK-ID --focus-mode true

   # Take scheduled breaks
   ./run_ff_command.sh flowforge:session:break 15m

   # End session with notes
   ./run_ff_command.sh flowforge:session:end "Completed feature implementation"
   ```

3. **End of Day**:
   ```bash
   # Submit time for team aggregation
   ./run_ff_command.sh flowforge:time:submit today

   # Update task statuses
   ./run_ff_command.sh flowforge:task:batch-update --status completed

   # Generate daily report
   ./run_ff_command.sh flowforge:report:daily
   ```

### Team Collaboration

1. **Task Assignment**:
   ```bash
   # Assign task to team member
   ./run_ff_command.sh flowforge:task:assign TASK-ID \
     --assignee "teammate@company.com" \
     --notify true

   # Request review from senior developer
   ./run_ff_command.sh flowforge:task:review-request TASK-ID \
     --reviewer "senior@company.com"
   ```

2. **Knowledge Sharing**:
   ```bash
   # Share session notes with team
   ./run_ff_command.sh flowforge:session:share SESSION-ID \
     --recipients "team" \
     --include-metrics false

   # Create team learning resource
   ./run_ff_command.sh flowforge:knowledge:share \
     --title "Best Practices for X" \
     --content "path/to/notes.md"
   ```

### Performance Optimization

1. **Cache Management**:
   ```bash
   # Optimize cache weekly
   ./run_ff_command.sh flowforge:cache:optimize \
     --namespace "$DEVELOPER_NAMESPACE"

   # Clean old data monthly
   ./run_ff_command.sh flowforge:cleanup:monthly \
     --keep-sessions 90d \
     --archive-reports true
   ```

2. **Sync Optimization**:
   ```bash
   # Adjust sync frequency based on workload
   ./run_ff_command.sh flowforge:sync:configure \
     --interval auto \
     --batch-size 50

   # Enable smart sync during focus time
   ./run_ff_command.sh flowforge:sync:smart-mode enable
   ```

## Maintenance and Updates

### Regular Maintenance Tasks

1. **Weekly Maintenance**:
   ```bash
   # Update FlowForge
   ./run_ff_command.sh flowforge:update check

   # Backup configuration
   ./run_ff_command.sh flowforge:backup create weekly

   # Optimize performance
   ./run_ff_command.sh flowforge:optimize weekly
   ```

2. **Monthly Maintenance**:
   ```bash
   # Full system health check
   ./run_ff_command.sh flowforge:health:comprehensive

   # Archive old data
   ./run_ff_command.sh flowforge:archive monthly

   # Update team configuration
   ./run_ff_command.sh flowforge:team:config-update
   ```

### Update Procedures

```bash
# Check for updates
./run_ff_command.sh flowforge:update:check

# Backup before update
./run_ff_command.sh flowforge:backup:create pre-update

# Perform update
./run_ff_command.sh flowforge:update:apply \
  --backup true \
  --test-after true

# Validate after update
./run_ff_command.sh flowforge:setup:validate \
  --post-update true
```

## Conclusion

This setup guide ensures that you can quickly and reliably join a FlowForge team environment while maintaining your individual productivity tracking and namespace isolation. The configuration is designed to be robust, scalable, and maintainable.

Key benefits of this setup:

- **Individual Productivity**: Your work is tracked separately and privately
- **Team Integration**: Seamless collaboration with team members
- **Data Security**: Namespace isolation protects your individual data
- **Performance**: Optimized caching and sync strategies
- **Reliability**: Multiple fallback options and error recovery

For ongoing support and advanced configuration options, refer to the team-specific documentation and reach out to your team lead for assistance.