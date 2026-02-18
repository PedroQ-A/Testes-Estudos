# Installation Guide: Enhanced Task Completion Detector

## Overview

This guide walks you through installing and configuring the Enhanced Task Completion Detector in FlowForge v2.0. The detector is a core component that automatically identifies when tasks are completed, enabling accurate billing and project management.

## Prerequisites

### System Requirements

- **Node.js**: v16.0+ (v18.0+ recommended)
- **Git**: v2.20+ with proper configuration
- **FlowForge**: v2.0+ core installation
- **Disk Space**: 100MB for detector files and logs
- **Memory**: 64MB RAM for detector operation

### Required Dependencies

```json
{
  "dependencies": {
    "fs-extra": "^11.0.0",
    "chokidar": "^3.5.3",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Optional Dependencies

```json
{
  "optionalDependencies": {
    "@octokit/rest": "^19.0.0",    // GitHub integration
    "@notionhq/client": "^2.2.0",  // Notion integration
    "slack-web-api": "^6.8.0"      // Slack notifications
  }
}
```

### Permission Requirements

```bash
# Required file system permissions
chmod 755 .flowforge/                    # Read/write FlowForge directory
chmod 644 .flowforge/tasks.json          # Read/write task data
chmod 755 .git/hooks/                    # Execute git hooks
chmod +x .git/hooks/pre-commit           # Execute pre-commit hook
```

## Installation Methods

### Method 1: FlowForge Command (Recommended)

The easiest installation method using FlowForge's built-in installer:

```bash
# Install completion detector with default settings
flowforge:install:completion-detector

# Install with custom configuration
flowforge:install:completion-detector --config-path ./detector-config.json

# Install with specific providers
flowforge:install:completion-detector --providers github,notion
```

**What this command does:**
1. Downloads and installs detector components
2. Configures git hooks for automatic detection
3. Sets up background monitoring service
4. Creates default configuration files
5. Runs validation tests

### Method 2: Manual Installation

For advanced users who want full control over the installation:

```bash
# 1. Navigate to your FlowForge project
cd /path/to/your/flowforge/project

# 2. Create detector directory structure
mkdir -p src/core/detection/detectors
mkdir -p src/core/detection/aggregation
mkdir -p .flowforge/detection/logs
mkdir -p .flowforge/detection/config

# 3. Copy detector files
cp -r /path/to/flowforge/src/core/detection/* src/core/detection/

# 4. Install dependencies
npm install fs-extra chokidar axios

# 5. Run installation script
node scripts/install-detection-hooks.sh
```

### Method 3: Git Clone and Build

For developers who want to build from source:

```bash
# 1. Clone FlowForge repository
git clone https://github.com/JustCode-CruzAlex/FlowForge.git
cd FlowForge

# 2. Install all dependencies
npm install

# 3. Build detection components
npm run build:detection

# 4. Install to target project
npm run install:detector -- --target /path/to/target/project

# 5. Verify installation
npm run test:detector
```

## Git Hooks Setup

The completion detector integrates with git hooks for automatic detection on commits.

### Automatic Hook Installation

```bash
# Install enhanced git hooks (recommended)
./scripts/install-detection-hooks.sh --enhanced

# Install basic git hooks
./scripts/install-detection-hooks.sh --basic

# Install with custom configuration
./scripts/install-detection-hooks.sh --config ./custom-hook-config.json
```

### Manual Hook Installation

If you need to install hooks manually:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# FlowForge Enhanced Task Completion Detection
# This hook runs completion detection after successful aggregation

set -euo pipefail

readonly FLOWFORGE_DIR=".flowforge"
readonly DETECTOR_SCRIPT="scripts/detect-completion.js"

# Source FlowForge environment
if [ -f "$FLOWFORGE_DIR/environment.sh" ]; then
    source "$FLOWFORGE_DIR/environment.sh"
fi

# Function to get current task ID
get_current_task_id() {
    if [ -f "$FLOWFORGE_DIR/current-task.txt" ]; then
        cat "$FLOWFORGE_DIR/current-task.txt"
    else
        # Extract from branch name (e.g., feature/123-work -> 123)
        git rev-parse --abbrev-ref HEAD | grep -o '[0-9]\+' | head -1
    fi
}

# Function to run completion detection
run_completion_detection() {
    local task_id="$1"
    
    if [ -n "$task_id" ] && [ -f "$DETECTOR_SCRIPT" ]; then
        echo "🔍 Running task completion detection for #$task_id..."
        
        if node "$DETECTOR_SCRIPT" "$task_id" --aggregate --quiet; then
            echo "✅ Completion detection completed successfully"
        else
            echo "⚠️  Completion detection failed, continuing commit..."
        fi
    fi
}

# Main execution
main() {
    # Run standard FlowForge aggregation first
    if command -v flowforge_aggregate >/dev/null 2>&1; then
        if flowforge_aggregate; then
            echo "✅ FlowForge aggregation successful"
        else
            echo "⚠️  FlowForge aggregation failed"
            exit 0  # Don't block commits
        fi
    fi
    
    # Run completion detection
    local current_task=$(get_current_task_id)
    if [ -n "$current_task" ]; then
        run_completion_detection "$current_task"
    fi
    
    echo "✅ Pre-commit hook completed"
}

# Execute main function
main "$@"
```

**Make the hook executable:**
```bash
chmod +x .git/hooks/pre-commit
```

## Configuration

### Basic Configuration

Create a basic configuration file at `.flowforge/detection/config.json`:

```json
{
  "detector": {
    "enabled": true,
    "confidenceThreshold": 0.7,
    "checkInterval": 30000,
    "maxRetries": 3,
    "enableAggregation": true
  },
  "detectors": {
    "GitCommitDetector": {
      "enabled": true,
      "weight": 0.4,
      "lookbackHours": 24,
      "customPatterns": []
    },
    "ProviderStatusDetector": {
      "enabled": true,
      "weight": 0.3,
      "timeout": 5000
    },
    "FileChangeDetector": {
      "enabled": true,
      "weight": 0.2,
      "watchPaths": ["src/", "test/", "docs/"],
      "ignorePatterns": ["node_modules/", "*.log"]
    },
    "TimeThresholdDetector": {
      "enabled": true,
      "weight": 0.1,
      "inactivityThreshold": 7200000,
      "workdayStart": "09:00",
      "workdayEnd": "18:00"
    }
  },
  "privacy": {
    "enableFiltering": true,
    "allowedFields": ["taskId", "timestamp", "confidence", "methods"],
    "excludePatterns": ["password", "token", "secret", "key"]
  },
  "logging": {
    "level": "info",
    "file": ".flowforge/detection/logs/detector.log",
    "maxSize": "10MB",
    "maxFiles": 5
  }
}
```

### Provider Configuration

Configure external provider integrations in `.flowforge/detection/providers.json`:

```json
{
  "providers": {
    "github": {
      "enabled": true,
      "token": "${GITHUB_TOKEN}",
      "owner": "${GITHUB_OWNER}",
      "repo": "${GITHUB_REPO}",
      "confidence": 0.9,
      "timeout": 10000,
      "rateLimit": {
        "requests": 5000,
        "period": 3600000
      }
    },
    "notion": {
      "enabled": false,
      "token": "${NOTION_TOKEN}",
      "database": "${NOTION_DATABASE_ID}",
      "confidence": 0.8,
      "timeout": 15000,
      "taskIdProperty": "Task ID",
      "statusProperty": "Status",
      "completionValues": ["Done", "Completed", "Closed"]
    },
    "linear": {
      "enabled": false,
      "apiKey": "${LINEAR_API_KEY}",
      "teamId": "${LINEAR_TEAM_ID}",
      "confidence": 0.9,
      "timeout": 10000
    },
    "jira": {
      "enabled": false,
      "host": "${JIRA_HOST}",
      "username": "${JIRA_USERNAME}",
      "password": "${JIRA_PASSWORD}",
      "project": "${JIRA_PROJECT}",
      "confidence": 0.8,
      "completionStatuses": ["Done", "Closed", "Resolved"]
    }
  }
}
```

### Environment Variables

Set up required environment variables:

```bash
# .env or ~/.bashrc
export GITHUB_TOKEN="ghp_your_github_token_here"
export GITHUB_OWNER="your-github-username"
export GITHUB_REPO="your-repository-name"

# Optional provider tokens
export NOTION_TOKEN="secret_notion_integration_token"
export NOTION_DATABASE_ID="your_notion_database_id"
export LINEAR_API_KEY="lin_api_your_linear_key"
export LINEAR_TEAM_ID="your_team_id"
```

### Team Configuration

Configure team-level settings in `.flowforge/team/completion-detection.json`:

```json
{
  "team": {
    "enabled": true,
    "requireConsensus": false,
    "confidenceThreshold": 0.8,
    "autoCloseThreshold": 0.9,
    "notificationChannels": {
      "slack": {
        "enabled": false,
        "webhook": "${SLACK_WEBHOOK_URL}",
        "channel": "#dev-updates",
        "mentionTeam": false
      },
      "email": {
        "enabled": false,
        "smtp": {
          "host": "smtp.company.com",
          "port": 587,
          "secure": false,
          "auth": {
            "user": "${SMTP_USER}",
            "pass": "${SMTP_PASS}"
          }
        },
        "recipients": ["team-lead@company.com"]
      },
      "webhook": {
        "enabled": false,
        "url": "${COMPLETION_WEBHOOK_URL}",
        "method": "POST",
        "headers": {
          "Authorization": "Bearer ${WEBHOOK_TOKEN}",
          "Content-Type": "application/json"
        }
      }
    }
  },
  "reporting": {
    "enabled": true,
    "frequency": "weekly",
    "recipients": ["manager@company.com"],
    "includeMetrics": true,
    "includeTrends": true
  }
}
```

## Testing and Verification

### Installation Verification

Run the verification script to ensure everything is properly installed:

```bash
# Run comprehensive verification
./scripts/verify-completion-detector.sh --comprehensive

# Quick verification
./scripts/verify-completion-detector.sh --quick

# Specific component verification
./scripts/verify-completion-detector.sh --component git-hooks
./scripts/verify-completion-detector.sh --component providers
./scripts/verify-completion-detector.sh --component aggregation
```

**Expected Output:**
```
✅ FlowForge Completion Detector Verification

🔍 Checking core components...
  ✅ EnhancedTaskCompletionDetector class loaded
  ✅ All detector classes available (4/4)
  ✅ Privacy filter initialized
  ✅ Audit logger configured

🔧 Checking configuration...
  ✅ Configuration files present
  ✅ Environment variables set
  ✅ Provider credentials valid

⚙️  Checking git integration...
  ✅ Git hooks installed
  ✅ Hook permissions correct
  ✅ FlowForge aggregation working

🌐 Checking provider connectivity...
  ✅ GitHub API accessible
  ✅ Rate limits OK
  ⚠️  Notion integration disabled (configured)

📊 Checking aggregation system...
  ✅ CompletionAggregator available
  ✅ Team directory writable
  ✅ Audit logs writable

🧪 Running test detection...
  ✅ Mock detection successful
  ✅ Confidence scoring working
  ✅ Privacy filtering active

✅ Installation verified successfully!
```

### Manual Testing

Test the detector manually with a known task:

```bash
# Test with existing task
node scripts/detect-completion.js 123 --verbose

# Test with monitoring
node scripts/detect-completion.js 123 --monitor --timeout 60000

# Test aggregation
node scripts/detect-completion.js 123 --aggregate --team-summary

# Test JSON output
node scripts/detect-completion.js 123 --json | jq '.'
```

### Integration Testing

Test integration with your development workflow:

```bash
# 1. Start a new task
flowforge:session:start 456

# 2. Make some commits
git add . && git commit -m "feat: implement feature (#456)"

# 3. Check detection
node scripts/detect-completion.js 456

# 4. Close task in provider (GitHub, Notion, etc.)

# 5. Verify detection
node scripts/detect-completion.js 456 --verbose
```

## Background Service Setup

### Systemd Service (Linux)

Create a systemd service for continuous monitoring:

```bash
# Create service file
sudo tee /etc/systemd/system/flowforge-detector.service > /dev/null <<EOF
[Unit]
Description=FlowForge Task Completion Detector
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/path/to/your/project
ExecStart=/usr/bin/node scripts/completion-detector-daemon.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=FLOWFORGE_LOG_LEVEL=info

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable flowforge-detector
sudo systemctl start flowforge-detector

# Check status
sudo systemctl status flowforge-detector
```

### PM2 Process Manager (Cross-platform)

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'flowforge-detector',
    script: 'scripts/completion-detector-daemon.js',
    cwd: '/path/to/your/project',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      FLOWFORGE_LOG_LEVEL: 'info'
    },
    error_file: '.flowforge/logs/detector-error.log',
    out_file: '.flowforge/logs/detector-out.log',
    log_file: '.flowforge/logs/detector-combined.log'
  }]
};
EOF

# Start daemon with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

### Docker Container

```dockerfile
# Dockerfile for completion detector daemon
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY .flowforge/ ./.flowforge/

# Create non-root user
RUN addgroup -g 1001 -S flowforge && \
    adduser -S flowforge -u 1001

# Set permissions
RUN chown -R flowforge:flowforge /app
USER flowforge

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node scripts/health-check.js || exit 1

# Start daemon
CMD ["node", "scripts/completion-detector-daemon.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  flowforge-detector:
    build: .
    container_name: flowforge-detector
    restart: unless-stopped
    volumes:
      - ./.flowforge:/app/.flowforge
      - ./.git:/app/.git:ro
    environment:
      - NODE_ENV=production
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - NOTION_TOKEN=${NOTION_TOKEN}
    healthcheck:
      test: ["CMD", "node", "scripts/health-check.js"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Troubleshooting

### Common Installation Issues

#### Issue: Permission Denied Errors

```bash
# Symptoms
Error: EACCES: permission denied, mkdir '.flowforge/detection'
Error: EPERM: operation not permitted, symlink

# Solution
sudo chown -R $USER:$USER .flowforge/
chmod -R 755 .flowforge/
chmod +x .git/hooks/pre-commit
```

#### Issue: Missing Dependencies

```bash
# Symptoms
Cannot resolve module 'fs-extra'
Cannot resolve module 'chokidar'

# Solution
cd /path/to/project
npm install fs-extra chokidar axios
# or
npm install --save-dev
```

#### Issue: Git Hook Not Executing

```bash
# Symptoms
Pre-commit hook doesn't run completion detection
No completion detection logs

# Diagnosis
ls -la .git/hooks/pre-commit
cat .git/hooks/pre-commit | head -10

# Solution
chmod +x .git/hooks/pre-commit
# Verify hook syntax
bash -n .git/hooks/pre-commit
```

#### Issue: Provider Authentication Failures

```bash
# Symptoms
Error: GitHub API authentication failed
Error: Notion integration unauthorized

# Diagnosis
echo $GITHUB_TOKEN
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Solution
# Generate new tokens with proper permissions
export GITHUB_TOKEN="ghp_new_token_here"
# Test authentication
node scripts/test-provider-auth.js
```

### Advanced Troubleshooting

#### Enable Debug Logging

```bash
# Enable comprehensive debug logging
export DEBUG=flowforge:completion*
node scripts/detect-completion.js 123 --verbose

# Enable specific component debugging
export DEBUG=flowforge:completion:detector
export DEBUG=flowforge:completion:aggregator
export DEBUG=flowforge:completion:providers
```

#### Check System Resources

```bash
# Check disk space
df -h .flowforge/

# Check memory usage
ps aux | grep -E "(node|flowforge)"

# Check file permissions
find .flowforge/ -type f -not -perm -644 -ls
find .flowforge/ -type d -not -perm -755 -ls
```

#### Validate Configuration

```bash
# Validate JSON configuration files
cat .flowforge/detection/config.json | jq '.'
cat .flowforge/detection/providers.json | jq '.'

# Test configuration loading
node -e "console.log(require('./.flowforge/detection/config.json'))"
```

### Performance Issues

#### Optimize Detection Frequency

```json
{
  "detector": {
    "checkInterval": 60000,
    "maxRetries": 1
  },
  "detectors": {
    "FileChangeDetector": {
      "enabled": false
    },
    "TimeThresholdDetector": {
      "weight": 0.05
    }
  }
}
```

#### Monitor Resource Usage

```bash
# Monitor detector process
top -p $(pgrep -f completion-detector)

# Check log file sizes
du -h .flowforge/detection/logs/

# Monitor network requests
netstat -an | grep -E "(80|443|22)"
```

## Next Steps

After successful installation:

1. **[Read the Integration Guide](../integration/completion-detector-integration.md)** - Learn how to integrate with your existing workflows
2. **[Review the API Documentation](../api/completion-detector-api.md)** - Understand the programmatic interface
3. **[Configure Team Settings](../guides/team-completion-detector-setup.md)** - Set up team-wide completion detection
4. **[Set Up Monitoring](../guides/completion-detector-monitoring.md)** - Monitor detector health and performance

## Support

If you encounter issues not covered in this guide:

1. **Check the [FAQ](../faq/completion-detector-faq.md)** for common questions
2. **Enable debug logging** and review log files
3. **Run the verification script** to identify configuration issues  
4. **Create a GitHub issue** with detailed error information
5. **Join the FlowForge community** for peer support

---

*This installation guide is part of the FlowForge v2.0 documentation suite. For the latest updates, visit the [FlowForge documentation portal](https://docs.flowforge.dev).*