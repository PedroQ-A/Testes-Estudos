# FlowForge Namespace Troubleshooting Guide

## 🚨 Quick Issue Resolution

This guide provides immediate solutions to common namespace separation issues. For complex problems, see our [Advanced Troubleshooting](./troubleshooting-advanced.md) guide.

## 🔍 Diagnostic Tools

### Quick Health Check

```bash
#!/bin/bash
# quick-diagnosis.sh
echo "🔍 FlowForge Namespace Quick Diagnosis"
echo "====================================="

# Check basic requirements
echo "1. Checking dependencies..."
for cmd in git jq bash realpath; do
    if command -v "$cmd" >/dev/null; then
        echo "  ✅ $cmd: Available"
    else
        echo "  ❌ $cmd: Missing - Install required"
    fi
done

# Check FlowForge installation
echo "2. Checking FlowForge installation..."
if [[ -f "./run_ff_namespace.sh" ]]; then
    echo "  ✅ Namespace runner: Found"
    if [[ -x "./run_ff_namespace.sh" ]]; then
        echo "  ✅ Executable permissions: OK"
    else
        echo "  ❌ Executable permissions: Missing"
        echo "    Fix: chmod +x ./run_ff_namespace.sh"
    fi
else
    echo "  ❌ Namespace runner: Not found"
    echo "    Fix: Reinstall FlowForge v2.0+"
fi

# Check namespace manager
echo "3. Checking namespace manager..."
if [[ -f "./scripts/namespace/manager.sh" ]]; then
    echo "  ✅ Manager script: Found"
else
    echo "  ❌ Manager script: Missing"
    echo "    Fix: Run ./scripts/namespace/integrate.sh install"
fi

# Check team configuration
echo "4. Checking team configuration..."
if [[ -f ".flowforge/team/config.json" ]]; then
    if jq empty .flowforge/team/config.json 2>/dev/null; then
        dev_count=$(jq '.team.developers | length' .flowforge/team/config.json)
        echo "  ✅ Team config: Valid ($dev_count developers)"
    else
        echo "  ❌ Team config: Invalid JSON"
        echo "    Fix: Validate JSON syntax"
    fi
else
    echo "  ❌ Team config: Not found"
    echo "    Fix: Create team configuration"
fi

# Check active namespace
echo "5. Checking active namespace..."
if [[ -f ".flowforge/.namespace-env" ]]; then
    source ".flowforge/.namespace-env"
    if [[ -n "${FLOWFORGE_DEVELOPER:-}" ]]; then
        echo "  ✅ Active developer: $FLOWFORGE_DEVELOPER"
        if [[ -d "$FLOWFORGE_NAMESPACE_DIR" ]]; then
            echo "  ✅ Namespace directory: Exists"
        else
            echo "  ❌ Namespace directory: Missing"
            echo "    Fix: Run ./run_ff_namespace.sh dev:namespace-init"
        fi
    else
        echo "  ❌ No active developer"
        echo "    Fix: Run ./run_ff_namespace.sh dev:namespace-init [dev-id]"
    fi
else
    echo "  ❌ No namespace environment"
    echo "    Fix: Initialize namespace"
fi

echo ""
echo "🏥 Diagnosis complete. Fix any ❌ issues above."
```

### Environment Validation

```bash
#!/bin/bash
# validate-environment.sh
echo "🌍 Environment Validation"
echo "========================"

# Check environment variables
echo "Environment Variables:"
echo "  FLOWFORGE_DEVELOPER: ${FLOWFORGE_DEVELOPER:-'Not set'}"
echo "  FLOWFORGE_NAMESPACE_DIR: ${FLOWFORGE_NAMESPACE_DIR:-'Not set'}"
echo "  FLOWFORGE_ROOT_OVERRIDE: ${FLOWFORGE_ROOT_OVERRIDE:-'Not set'}"
echo "  PWD: $PWD"

# Check file permissions
echo ""
echo "File Permissions:"
if [[ -d ".flowforge" ]]; then
    perms=$(ls -ld .flowforge | cut -d' ' -f1)
    echo "  .flowforge/: $perms"
    if [[ "$perms" == "d"*"---" ]] || [[ "$perms" == "d"*"--x" ]]; then
        echo "  ❌ WARNING: Others can access .flowforge directory"
    fi
else
    echo "  ❌ .flowforge directory not found"
fi

# Check git repository
echo ""
echo "Git Repository:"
if git rev-parse --git-dir >/dev/null 2>&1; then
    echo "  ✅ Valid git repository"
    branch=$(git branch --show-current 2>/dev/null || echo "detached")
    echo "  Current branch: $branch"
else
    echo "  ❌ Not a git repository"
fi
```

## 🛠️ Common Issues & Solutions

### Issue 1: "Command not found" Errors

**Symptoms:**
```bash
./run_ff_namespace.sh: command not found
```

**Causes & Solutions:**

1. **File not executable**
   ```bash
   # Check permissions
   ls -la run_ff_namespace.sh
   # Fix: Make executable
   chmod +x run_ff_namespace.sh
   ```

2. **Wrong directory**
   ```bash
   # Check if you're in project root
   pwd
   ls -la | grep run_ff_namespace.sh
   # Fix: Navigate to correct directory
   cd /path/to/your/project
   ```

3. **FlowForge not installed**
   ```bash
   # Check installation
   which flowforge
   # Fix: Install FlowForge
   npm install -g @justcode-cruzalex/flowforge
   ```

### Issue 2: Namespace Initialization Failures

**Symptoms:**
```bash
ERROR: Cannot create namespace directory
ERROR: Invalid developer ID
```

**Solutions:**

1. **Permission Issues**
   ```bash
   # Check directory permissions
   ls -la .flowforge/
   # Fix permissions
   chmod 755 .flowforge/
   mkdir -p .flowforge/dev-{your-id}
   ```

2. **Invalid Developer ID**
   ```bash
   # Valid format: alphanumeric, dash, underscore
   ./run_ff_namespace.sh dev:namespace-init "valid-dev-id"
   # Invalid: special characters, spaces
   ./run_ff_namespace.sh dev:namespace-init "invalid dev id!"  # ❌
   ```

3. **Team Configuration Missing**
   ```bash
   # Create minimal team config
   mkdir -p .flowforge/team
   cat > .flowforge/team/config.json << 'EOF'
   {
     "team": {
       "name": "Development Team",
       "developers": {}
     }
   }
   EOF
   ```

### Issue 3: Session Start Failures

**Symptoms:**
```bash
ERROR: No active namespace
ERROR: Session file not accessible
```

**Solutions:**

1. **No Active Namespace**
   ```bash
   # Check current namespace
   echo $FLOWFORGE_DEVELOPER
   # Fix: Initialize namespace
   ./run_ff_namespace.sh dev:namespace-init your-dev-id
   ```

2. **Corrupted Session File**
   ```bash
   # Check session file
   cat .flowforge/dev-{your-id}/sessions/current.json
   # Fix: Reset session
   ./run_ff_namespace.sh session:end "Reset corrupted session"
   ```

3. **Provider Configuration Issues**
   ```bash
   # Check provider config
   ls -la .flowforge/providers/
   # Fix: Configure provider
   ./run_ff_namespace.sh project:setup
   ```

### Issue 4: Developer Switching Problems

**Symptoms:**
```bash
ERROR: Developer not found
ERROR: Cannot switch to inactive namespace
```

**Solutions:**

1. **Developer Not in Team Config**
   ```bash
   # Check available developers
   jq '.team.developers | keys[]' .flowforge/team/config.json
   # Fix: Add developer to team
   ./run_ff_namespace.sh dev:namespace-init new-developer
   ```

2. **Namespace Corruption**
   ```bash
   # Verify namespace integrity
   ./scripts/namespace/integrate.sh verify
   # Fix: Recreate namespace
   ./run_ff_namespace.sh dev:namespace-clean old-dev-id
   ./run_ff_namespace.sh dev:namespace-init old-dev-id
   ```

### Issue 5: Git Integration Issues

**Symptoms:**
```bash
ERROR: Cannot create developer branch
ERROR: Git sync failed
```

**Solutions:**

1. **Git Configuration Problems**
   ```bash
   # Check git config
   git config --list | grep user
   # Fix: Configure git
   git config user.name "Your Name"
   git config user.email "your.email@company.com"
   ```

2. **Branch Naming Conflicts**
   ```bash
   # Check existing branches
   git branch -a | grep dev-
   # Fix: Clean old branches
   git branch -D dev-old-developer/feature/old-task
   ```

3. **Remote Repository Issues**
   ```bash
   # Check remote access
   git remote -v
   git fetch --dry-run
   # Fix: Update remote credentials
   git remote set-url origin https://token@github.com/user/repo.git
   ```

## 🔧 System Fixes

### Reset Namespace Environment

```bash
#!/bin/bash
# reset-namespace.sh
DEV_ID="$1"

echo "🔄 Resetting namespace for developer: $DEV_ID"

# Backup current state
if [[ -d ".flowforge/dev-$DEV_ID" ]]; then
    mv ".flowforge/dev-$DEV_ID" ".flowforge/dev-$DEV_ID.backup.$(date +%s)"
fi

# Clear environment
rm -f .flowforge/.namespace-env

# Reinitialize
./run_ff_namespace.sh dev:namespace-init "$DEV_ID" --auto

echo "✅ Namespace reset complete"
```

### Fix Permissions

```bash
#!/bin/bash
# fix-permissions.sh
echo "🔒 Fixing FlowForge permissions..."

# Set correct directory permissions
find .flowforge -type d -exec chmod 755 {} +

# Set correct file permissions
find .flowforge -type f -exec chmod 644 {} +

# Secure sensitive files
chmod 600 .flowforge/team/config.json 2>/dev/null || true
chmod 700 .flowforge/dev-*/ 2>/dev/null || true
chmod 600 .flowforge/dev-*/sessions/* 2>/dev/null || true
chmod 600 .flowforge/dev-*/config.json 2>/dev/null || true

# Make scripts executable
chmod +x run_ff_namespace.sh
chmod +x scripts/namespace/*.sh

echo "✅ Permissions fixed"
```

### Clean Corrupted Data

```bash
#!/bin/bash
# clean-corrupted-data.sh
echo "🧹 Cleaning corrupted FlowForge data..."

# Remove temporary files
find .flowforge -name "*.tmp" -delete
find .flowforge -name "*.lock" -delete

# Remove empty directories
find .flowforge -type d -empty -delete

# Validate JSON files
for json_file in $(find .flowforge -name "*.json"); do
    if ! jq empty "$json_file" 2>/dev/null; then
        echo "❌ Corrupted JSON: $json_file"
        # Backup corrupted file
        mv "$json_file" "$json_file.corrupted.$(date +%s)"

        # Recreate with minimal structure
        case "$json_file" in
            */team/config.json)
                echo '{"team":{"name":"Team","developers":{}}}' > "$json_file"
                ;;
            */sessions/current.json)
                echo '{"active":false,"sessionId":null}' > "$json_file"
                ;;
            */config.json)
                echo '{"version":"2.0.0","created":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > "$json_file"
                ;;
        esac
        echo "✅ Recreated: $json_file"
    fi
done

echo "✅ Cleanup complete"
```

## 📊 Performance Issues

### High Memory Usage

**Diagnosis:**
```bash
# Check namespace sizes
du -sh .flowforge/dev-*/ | sort -hr

# Check for large files
find .flowforge -size +10M -ls

# Check process memory
ps aux | grep flowforge
```

**Solutions:**
```bash
# Clean large cache files
./run_ff_namespace.sh dev:namespace-clean --cache

# Set memory limits
export FLOWFORGE_CACHE_SIZE_LIMIT="100MB"

# Enable automatic cleanup
export FLOWFORGE_AUTO_CLEANUP="true"
```

### Slow Performance

**Diagnosis:**
```bash
# Time command execution
time ./run_ff_namespace.sh dev:namespace-status

# Check disk I/O
iostat -x 1 5

# Check for many small files
find .flowforge -type f | wc -l
```

**Solutions:**
```bash
# Enable caching
export FLOWFORGE_CACHE_TTL="3600"

# Optimize git operations
git config core.preloadindex true
git config core.fscache true

# Use SSD storage if available
# Move .flowforge to SSD and symlink
```

## 🚨 Emergency Recovery

### Complete System Recovery

```bash
#!/bin/bash
# emergency-recovery.sh
echo "🚨 Emergency FlowForge Recovery"
echo "==============================="

# Create emergency backup
if [[ -d ".flowforge" ]]; then
    mv .flowforge .flowforge.emergency.backup.$(date +%s)
    echo "✅ Emergency backup created"
fi

# Reinstall FlowForge
echo "📦 Reinstalling FlowForge..."
curl -L https://github.com/JustCode-CruzAlex/FlowForge/releases/latest/download/flowforge-portable.tar.gz | tar -xz

# Basic setup
echo "🔧 Basic setup..."
mkdir -p .flowforge/team
echo '{"team":{"name":"Recovery Team","developers":{}}}' > .flowforge/team/config.json

# Install namespace features
./scripts/namespace/integrate.sh install

echo "✅ Emergency recovery complete"
echo ""
echo "Next steps:"
echo "1. Configure your team in .flowforge/team/config.json"
echo "2. Initialize your namespace: ./run_ff_namespace.sh dev:namespace-init [your-id]"
echo "3. Restore data from backup if needed"
```

### Data Recovery

```bash
#!/bin/bash
# recover-data.sh
BACKUP_DIR="$1"

if [[ -z "$BACKUP_DIR" ]]; then
    echo "Usage: $0 /path/to/backup"
    exit 1
fi

echo "🔄 Recovering data from: $BACKUP_DIR"

# Recover team configuration
if [[ -f "$BACKUP_DIR/.flowforge/team/config.json" ]]; then
    cp "$BACKUP_DIR/.flowforge/team/config.json" .flowforge/team/config.json
    echo "✅ Team configuration recovered"
fi

# Recover namespace directories
for ns_dir in "$BACKUP_DIR"/.flowforge/dev-*/; do
    if [[ -d "$ns_dir" ]]; then
        dev_id=$(basename "$ns_dir" | sed 's/dev-//')
        cp -r "$ns_dir" ".flowforge/"
        echo "✅ Recovered namespace: $dev_id"
    fi
done

echo "✅ Data recovery complete"
```

## 📞 Getting Help

### Log Collection for Support

```bash
#!/bin/bash
# collect-logs.sh
SUPPORT_DIR="flowforge-support-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$SUPPORT_DIR"

echo "📋 Collecting support information..."

# System information
uname -a > "$SUPPORT_DIR/system-info.txt"
git --version >> "$SUPPORT_DIR/system-info.txt"
jq --version >> "$SUPPORT_DIR/system-info.txt"

# FlowForge configuration
cp -r .flowforge/team/ "$SUPPORT_DIR/" 2>/dev/null || true
cp .flowforge/.namespace-env "$SUPPORT_DIR/" 2>/dev/null || true

# Logs (sanitized)
mkdir -p "$SUPPORT_DIR/logs"
for log in .flowforge/logs/*.log; do
    if [[ -f "$log" ]]; then
        # Remove sensitive information
        sed 's/token=[^&]*/token=REDACTED/g' "$log" | \
        sed 's/password=[^&]*/password=REDACTED/g' > "$SUPPORT_DIR/logs/$(basename "$log")"
    fi
done

# Create support archive
tar -czf "${SUPPORT_DIR}.tar.gz" "$SUPPORT_DIR"
rm -rf "$SUPPORT_DIR"

echo "✅ Support information collected: ${SUPPORT_DIR}.tar.gz"
echo ""
echo "📧 Send this file to support with your issue description"
```

### Support Checklist

Before contacting support, please:

1. **Run Quick Diagnosis**: `./quick-diagnosis.sh`
2. **Check Documentation**: Review this troubleshooting guide
3. **Try Common Fixes**: Apply relevant solutions above
4. **Collect Logs**: Run `./collect-logs.sh`
5. **Document Steps**: Note what you were doing when the issue occurred

### Contact Information

- **GitHub Issues**: https://github.com/JustCode-CruzAlex/FlowForge/issues
- **Documentation**: https://github.com/JustCode-CruzAlex/FlowForge/docs
- **Community**: Check existing issues for similar problems

---

**Document Version**: 2.0.0
**Last Updated**: 2024-09-18
**Coverage**: Common namespace issues (90%)
**Target Audience**: Developers, Team Leads