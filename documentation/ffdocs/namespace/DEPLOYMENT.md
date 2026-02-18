# FlowForge Namespace Deployment Guide

## 🚀 Production Deployment Overview

This guide covers the complete deployment process for FlowForge v2.0 namespace separation features in production environments. Follow these steps to enable multi-developer support for your team.

## 📋 Pre-Deployment Checklist

### System Requirements

- **Operating System**: Linux, macOS, or Windows with WSL2
- **Git Version**: 2.25.0 or higher
- **Bash Version**: 4.0 or higher
- **Node.js**: 16.0 or higher (if using npm features)
- **jq**: 1.6 or higher (for JSON processing)
- **Disk Space**: Minimum 100MB per developer
- **Memory**: 2GB RAM recommended for team of 6 developers

### Network Requirements

- **Git Repository Access**: Read/write access to project repository
- **Provider APIs**: Access to GitHub, Notion, Linear (as configured)
- **Internet Access**: For updates and provider synchronization

### Security Prerequisites

```bash
# Verify security tools
command -v realpath >/dev/null || echo "WARNING: realpath not found"
command -v mktemp >/dev/null || echo "WARNING: mktemp not found"

# Check file permissions support
umask 077
touch /tmp/test_permissions
ls -la /tmp/test_permissions | grep "^-rw-------" || echo "WARNING: Permissions not supported"
rm -f /tmp/test_permissions
```

## 📦 Installation Methods

### Method 1: NPM Installation (Recommended)

```bash
# Install FlowForge globally
npm install -g @justcode-cruzalex/flowforge

# Verify installation
flowforge --version
# Expected: v2.0.5 or higher

# Initialize project
cd /path/to/your/project
flowforge init

# Install namespace support
./scripts/namespace/integrate.sh install
```

### Method 2: Direct Download

```bash
# Download latest release
curl -L https://github.com/JustCode-CruzAlex/FlowForge/releases/latest/download/flowforge-portable.tar.gz -o flowforge.tar.gz

# Extract and install
tar -xzf flowforge.tar.gz
cd flowforge/
./scripts/install-flowforge.sh

# Install namespace features
./scripts/namespace/integrate.sh install
```

### Method 3: Git Clone (Development)

```bash
# Clone repository
git clone https://github.com/JustCode-CruzAlex/FlowForge.git
cd FlowForge/

# Install dependencies
npm install

# Build project
npm run build

# Install namespace features
./scripts/namespace/integrate.sh install
```

## 🏗️ Initial Setup

### 1. Project Configuration

```bash
# Navigate to your project root
cd /path/to/your/project

# Initialize FlowForge (if not done already)
./run_ff_namespace.sh project:setup

# This creates:
# - .flowforge/ directory
# - Basic configuration files
# - Git hooks
# - Team configuration template
```

### 2. Team Configuration

Create team configuration file:

```bash
# Edit team configuration
cat > .flowforge/team/config.json << 'EOF'
{
  "team": {
    "name": "Your Development Team",
    "max_developers": 10,
    "default_namespace_quota": "500MB",
    "session_timeout": "8h",
    "developers": {
      "dev1": {
        "name": "Developer One",
        "email": "dev1@yourcompany.com",
        "role": "fullstack",
        "timezone": "UTC-8"
      },
      "dev2": {
        "name": "Developer Two",
        "email": "dev2@yourcompany.com",
        "role": "frontend",
        "timezone": "UTC-5"
      }
    }
  },
  "security": {
    "require_team_membership": true,
    "max_concurrent_sessions": 1,
    "audit_logging": true
  },
  "performance": {
    "cache_ttl": 3600,
    "cleanup_interval": "1h",
    "log_rotation_size": "10MB"
  }
}
EOF
```

### 3. Provider Configuration

Configure your task providers:

```bash
# GitHub provider (example)
cat > .flowforge/providers/github.json << 'EOF'
{
  "provider": "github",
  "config": {
    "owner": "your-org",
    "repo": "your-project",
    "token_env": "GITHUB_TOKEN",
    "api_url": "https://api.github.com"
  },
  "field_mapping": {
    "id": "number",
    "title": "title",
    "description": "body",
    "status": "state",
    "assignee": "assignee.login",
    "labels": "labels[].name"
  }
}
EOF

# Set environment variable
export GITHUB_TOKEN="your-github-token"
echo 'export GITHUB_TOKEN="your-github-token"' >> ~/.bashrc
```

## 👥 Developer Onboarding

### Quick Onboarding Script

Create a script for new developers:

```bash
#!/bin/bash
# onboard-developer.sh
set -euo pipefail

DEV_ID="$1"
DEV_NAME="$2"
DEV_EMAIL="$3"

echo "🚀 Onboarding developer: $DEV_NAME ($DEV_ID)"

# Add to team configuration
jq --arg dev "$DEV_ID" \
   --arg name "$DEV_NAME" \
   --arg email "$DEV_EMAIL" \
   '.team.developers[$dev] = {
       "name": $name,
       "email": $email,
       "role": "developer",
       "added": now | todate
   }' .flowforge/team/config.json > /tmp/team_config.json

mv /tmp/team_config.json .flowforge/team/config.json

# Initialize namespace
export FLOWFORGE_DEVELOPER="$DEV_ID"
./run_ff_namespace.sh dev:namespace-init "$DEV_ID" --auto

echo "✅ Developer $DEV_NAME onboarded successfully!"
echo ""
echo "Next steps for $DEV_NAME:"
echo "1. Run: export FLOWFORGE_DEVELOPER=$DEV_ID"
echo "2. Run: ./run_ff_namespace.sh session:start [task-id]"
echo "3. Start coding! 🎉"
```

### Usage:
```bash
# Add new developer
./onboard-developer.sh alice "Alice Johnson" "alice@company.com"
```

## 🔧 Environment Configuration

### Development Environment

```bash
# .env.development
export FLOWFORGE_ENV="development"
export FLOWFORGE_LOG_LEVEL="DEBUG"
export FLOWFORGE_CACHE_TTL="300"
export FLOWFORGE_SESSION_TIMEOUT="4h"
export FLOWFORGE_AUTO_CLEANUP="true"
```

### Staging Environment

```bash
# .env.staging
export FLOWFORGE_ENV="staging"
export FLOWFORGE_LOG_LEVEL="INFO"
export FLOWFORGE_CACHE_TTL="1800"
export FLOWFORGE_SESSION_TIMEOUT="6h"
export FLOWFORGE_AUTO_CLEANUP="true"
```

### Production Environment

```bash
# .env.production
export FLOWFORGE_ENV="production"
export FLOWFORGE_LOG_LEVEL="WARN"
export FLOWFORGE_CACHE_TTL="3600"
export FLOWFORGE_SESSION_TIMEOUT="8h"
export FLOWFORGE_AUTO_CLEANUP="false"
export FLOWFORGE_AUDIT_LOGGING="true"
```

## 🛡️ Security Configuration

### File Permissions Setup

```bash
#!/bin/bash
# secure-deployment.sh

echo "🔒 Applying security configuration..."

# Set restrictive permissions on FlowForge directory
chmod 750 .flowforge/
chmod 640 .flowforge/team/config.json
chmod 700 .flowforge/dev-*/ 2>/dev/null || true

# Secure log files
chmod 640 .flowforge/logs/*.log 2>/dev/null || true

# Secure namespace directories
find .flowforge/dev-*/ -type d -exec chmod 700 {} + 2>/dev/null || true
find .flowforge/dev-*/ -type f -exec chmod 600 {} + 2>/dev/null || true

# Set umask for secure file creation
echo "umask 077" >> ~/.bashrc

echo "✅ Security configuration applied"
```

### Input Validation

The system includes built-in input validation:

```bash
# Verify security features are working
./run_ff_namespace.sh dev:namespace-init "../../../etc/passwd"
# Should fail with: "ERROR: Invalid developer ID"

./run_ff_namespace.sh dev:namespace-init "normal-dev-id"
# Should succeed
```

## 📊 Monitoring Setup

### Health Check Script

```bash
#!/bin/bash
# health-check.sh

echo "🏥 FlowForge Health Check"
echo "========================="

# Check core dependencies
deps=("git" "jq" "bash" "realpath" "mktemp")
for dep in "${deps[@]}"; do
    if command -v "$dep" >/dev/null; then
        echo "✅ $dep: Available"
    else
        echo "❌ $dep: Missing"
    fi
done

# Check FlowForge installation
if [[ -f "./run_ff_namespace.sh" ]]; then
    echo "✅ FlowForge: Installed"
else
    echo "❌ FlowForge: Not found"
fi

# Check namespace features
if [[ -f "./scripts/namespace/manager.sh" ]]; then
    echo "✅ Namespace Support: Available"
else
    echo "❌ Namespace Support: Missing"
fi

# Check team configuration
if [[ -f ".flowforge/team/config.json" ]]; then
    dev_count=$(jq '.team.developers | length' .flowforge/team/config.json 2>/dev/null || echo "0")
    echo "✅ Team Config: $dev_count developers configured"
else
    echo "❌ Team Config: Not found"
fi

# Check active namespaces
active_namespaces=$(ls -1d .flowforge/dev-*/ 2>/dev/null | wc -l)
echo "📊 Active Namespaces: $active_namespaces"

# Check disk usage
total_size=$(du -sh .flowforge/ 2>/dev/null | cut -f1 || echo "Unknown")
echo "💾 Total Size: $total_size"
```

### Performance Monitoring

```bash
#!/bin/bash
# performance-monitor.sh

while true; do
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # Collect metrics
    active_sessions=$(find .flowforge/dev-*/sessions/ -name "current.json" -exec jq -r '.active' {} + 2>/dev/null | grep -c "true" || echo "0")
    total_size=$(du -s .flowforge/ 2>/dev/null | cut -f1 || echo "0")
    git_operations=$(grep -c "git " .flowforge/logs/*.log 2>/dev/null || echo "0")

    # Log metrics
    echo "$timestamp,active_sessions:$active_sessions,disk_usage:$total_size,git_ops:$git_operations" >> .flowforge/logs/performance.csv

    sleep 300  # Check every 5 minutes
done
```

## 🔄 Backup & Recovery

### Backup Script

```bash
#!/bin/bash
# backup-namespaces.sh

BACKUP_DIR="/backup/flowforge/$(date +%Y%m%d_%H%M%S)"
PROJECT_ROOT="$(pwd)"

echo "📦 Creating namespace backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup FlowForge directory (excluding temporary files)
tar -czf "$BACKUP_DIR/flowforge_backup.tar.gz" \
    --exclude="*.tmp" \
    --exclude="*.log" \
    --exclude="*/cache/*" \
    --exclude="*/temp/*" \
    .flowforge/

# Backup team configuration separately
cp .flowforge/team/config.json "$BACKUP_DIR/team_config.json"

# Create backup manifest
cat > "$BACKUP_DIR/manifest.json" << EOF
{
    "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "project_path": "$PROJECT_ROOT",
    "flowforge_version": "$(cat .flowforge/.version 2>/dev/null || echo 'unknown')",
    "developer_count": $(jq '.team.developers | length' .flowforge/team/config.json 2>/dev/null || echo "0"),
    "backup_size": "$(du -sh "$BACKUP_DIR" | cut -f1)"
}
EOF

echo "✅ Backup created: $BACKUP_DIR"
```

### Recovery Script

```bash
#!/bin/bash
# restore-namespaces.sh

BACKUP_PATH="$1"

if [[ -z "$BACKUP_PATH" ]] || [[ ! -d "$BACKUP_PATH" ]]; then
    echo "❌ Invalid backup path"
    echo "Usage: $0 /path/to/backup"
    exit 1
fi

echo "🔄 Restoring from backup: $BACKUP_PATH"

# Verify backup
if [[ ! -f "$BACKUP_PATH/flowforge_backup.tar.gz" ]]; then
    echo "❌ Backup file not found"
    exit 1
fi

# Create backup of current state
if [[ -d ".flowforge" ]]; then
    mv .flowforge .flowforge.backup.$(date +%Y%m%d_%H%M%S)
fi

# Restore FlowForge directory
tar -xzf "$BACKUP_PATH/flowforge_backup.tar.gz"

# Restore team configuration
if [[ -f "$BACKUP_PATH/team_config.json" ]]; then
    cp "$BACKUP_PATH/team_config.json" .flowforge/team/config.json
fi

# Reinitialize namespaces
./scripts/namespace/integrate.sh verify

echo "✅ Namespace restoration completed"
```

## 🧪 Testing Deployment

### Deployment Verification Script

```bash
#!/bin/bash
# verify-deployment.sh

echo "🧪 Verifying FlowForge Namespace Deployment"
echo "============================================="

# Test 1: Basic installation
echo "Test 1: Basic Installation..."
if ./run_ff_namespace.sh --help >/dev/null 2>&1; then
    echo "✅ Basic installation working"
else
    echo "❌ Basic installation failed"
    exit 1
fi

# Test 2: Namespace initialization
echo "Test 2: Namespace Initialization..."
if ./run_ff_namespace.sh dev:namespace-init test-dev --auto >/dev/null 2>&1; then
    echo "✅ Namespace initialization working"
else
    echo "❌ Namespace initialization failed"
    exit 1
fi

# Test 3: Developer switching
echo "Test 3: Developer Switching..."
if ./run_ff_namespace.sh dev:switch test-dev >/dev/null 2>&1; then
    echo "✅ Developer switching working"
else
    echo "❌ Developer switching failed"
    exit 1
fi

# Test 4: Session management
echo "Test 4: Session Management..."
if ./run_ff_namespace.sh session:start TEST-123 >/dev/null 2>&1; then
    if ./run_ff_namespace.sh session:end "Test session" >/dev/null 2>&1; then
        echo "✅ Session management working"
    else
        echo "❌ Session end failed"
        exit 1
    fi
else
    echo "❌ Session start failed"
    exit 1
fi

# Test 5: Cleanup
echo "Test 5: Cleanup..."
if ./run_ff_namespace.sh dev:namespace-clean test-dev >/dev/null 2>&1; then
    echo "✅ Cleanup working"
else
    echo "❌ Cleanup failed"
    exit 1
fi

echo ""
echo "🎉 All deployment tests passed!"
echo ""
echo "Next steps:"
echo "1. Configure your team in .flowforge/team/config.json"
echo "2. Onboard your developers"
echo "3. Start development sessions"
```

## 🚨 Troubleshooting Deployment

### Common Issues

1. **Permission Denied Errors**
   ```bash
   # Fix: Set correct permissions
   chmod +x run_ff_namespace.sh
   chmod +x scripts/namespace/*.sh
   ```

2. **jq Command Not Found**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install jq

   # macOS
   brew install jq

   # CentOS/RHEL
   sudo yum install jq
   ```

3. **Git Hooks Not Working**
   ```bash
   # Reinstall hooks
   ./scripts/install-hooks.sh
   chmod +x .git/hooks/*
   ```

4. **Namespace Directory Creation Fails**
   ```bash
   # Check permissions
   ls -la .flowforge/
   # Fix permissions
   chmod 755 .flowforge/
   ```

### Diagnostic Commands

```bash
# Check system compatibility
./scripts/namespace/integrate.sh check

# Verify namespace integrity
./scripts/namespace/integrate.sh verify

# View detailed logs
tail -f .flowforge/logs/namespace-manager.log

# Check active sessions
./run_ff_namespace.sh dev:namespace-status
```

## 📈 Performance Tuning

### Optimization Settings

```bash
# Performance configuration
cat > .flowforge/performance.conf << 'EOF'
# Cache settings
CACHE_TTL=3600
CACHE_SIZE_LIMIT=200MB

# Cleanup settings
AUTO_CLEANUP=true
CLEANUP_INTERVAL=1h

# Git settings
GIT_GC_INTERVAL=24h
GIT_AUTO_PUSH=false

# Logging settings
LOG_LEVEL=INFO
LOG_ROTATION_SIZE=10MB
LOG_RETENTION_DAYS=30
EOF
```

### Monitoring Performance

```bash
# Monitor namespace usage
du -sh .flowforge/dev-*/ | sort -hr

# Monitor active sessions
find .flowforge/dev-*/sessions/ -name "current.json" -exec jq -r '.active' {} +

# Monitor cache hit rates
grep "cache_hit" .flowforge/logs/*.log | wc -l
```

---

**Document Version**: 2.0.0
**Last Updated**: 2024-09-18
**Deployment Status**: Production Ready
**Target Audience**: DevOps Engineers, Team Leads