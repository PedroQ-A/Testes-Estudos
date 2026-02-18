# FlowForge Validator Troubleshooting Guide

This guide helps resolve common issues encountered when using the FlowForge Hybrid Smart Validator.

## Table of Contents
- [Quick Diagnosis](#quick-diagnosis)
- [Common Issues](#common-issues)
- [Error Categories](#error-categories)
- [Debug Techniques](#debug-techniques)
- [Platform-Specific Issues](#platform-specific-issues)
- [Performance Issues](#performance-issues)
- [Recovery Procedures](#recovery-procedures)

## Quick Diagnosis

### Health Check Commands

Start with these commands to quickly diagnose issues:

```bash
# 1. Basic health check
./scripts/validate-installation.sh --quiet
echo "Exit Code: $?"

# 2. Detailed diagnosis
DEBUG=1 ./scripts/validate-installation.sh --verbose

# 3. Check environment
env | grep -E "(GITHUB_TOKEN|NODE|PATH|FLOWFORGE)"

# 4. Verify file permissions
ls -la scripts/*.sh .git/hooks/*
```

### Quick Status Check

```bash
# One-liner health check
./scripts/validate-installation.sh --json | jq '.health_score, .status, .errors[], .warnings[]'
```

## Common Issues

### 1. "Not in a Git repository"

**Symptoms:**
- Exit code 1
- Health score drops significantly
- Error: "Not in a Git repository"

**Causes:**
- Running validator outside a Git repository
- Corrupted Git directory
- Missing `.git` directory

**Solutions:**

```bash
# Solution 1: Initialize Git repository
git init
git add .
git commit -m "Initial commit"

# Solution 2: Fix corrupted Git directory
rm -rf .git
git init
git remote add origin <your-repo-url>

# Solution 3: Run from correct directory
cd /path/to/your/flowforge/project
./scripts/validate-installation.sh
```

### 2. "Missing required directory"

**Symptoms:**
- Warnings about missing directories
- Health score reduced
- Auto-fix attempts to create directories

**Common Missing Directories:**
- `.flowforge`
- `commands/flowforge`
- `scripts`
- `documentation`

**Solutions:**

```bash
# Auto-fix (recommended)
./scripts/validate-installation.sh --fix

# Manual creation
mkdir -p .flowforge
mkdir -p commands/flowforge
mkdir -p scripts
mkdir -p documentation

# Verify structure
tree -a -L 2 | head -20
```

### 3. "Node.js validator timeout"

**Symptoms:**
- Validation hangs or times out
- Falls back to bash validator
- Network-related errors

**Causes:**
- Slow network connection
- GitHub API rate limiting
- Firewall blocking requests
- DNS resolution issues

**Solutions:**

```bash
# Solution 1: Skip GitHub checks
SKIP_GITHUB_TEST=1 ./scripts/validate-installation.sh

# Solution 2: Use CI mode
CI=1 ./scripts/validate-installation.sh

# Solution 3: Force bash validator
./scripts/validate-installation.sh  # Direct bash execution

# Solution 4: Check network connectivity
curl -I https://api.github.com/rate_limit
dig api.github.com
```

### 4. "Script not executable"

**Symptoms:**
- Permission errors
- Scripts fail to run
- Warning messages about permissions

**Solutions:**

```bash
# Fix all script permissions
find scripts -name "*.sh" -exec chmod +x {} \;

# Fix specific scripts
chmod +x scripts/validate-installation.sh
chmod +x scripts/task-time.sh
chmod +x scripts/install-flowforge.sh

# Verify permissions
ls -la scripts/*.sh
```

### 5. "Invalid JSON in configuration"

**Symptoms:**
- Configuration validation fails
- Health score penalty
- JSON parse errors

**Solutions:**

```bash
# Validate JSON manually
jq empty .flowforge/config.json

# Fix with auto-repair
./scripts/validate-installation.sh --fix

# Manual fix - recreate config
cat > .flowforge/config.json << 'EOF'
{
  "version": "2.0.0",
  "features": ["time-tracking", "github-integration", "auto-validation"],
  "created": "2025-01-15T10:30:00Z",
  "validator_version": "1.0.0"
}
EOF
```

### 6. "GitHub API connection failed"

**Symptoms:**
- GitHub integration warnings
- API-related errors
- Network timeout messages

**Solutions:**

```bash
# Solution 1: Set GitHub token
export GITHUB_TOKEN="your-personal-access-token"
./scripts/validate-installation.sh

# Solution 2: Skip GitHub tests
export SKIP_GITHUB_TEST=1
./scripts/validate-installation.sh

# Solution 3: Test GitHub API manually
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit

# Solution 4: Check rate limits
curl -I https://api.github.com/rate_limit
```

### 7. "Git hooks not installed"

**Symptoms:**
- Missing Git hook warnings
- Hooks directory empty
- Installation incomplete

**Solutions:**

```bash
# Auto-fix hooks
./scripts/validate-installation.sh --fix

# Manual hook installation
./scripts/install-flowforge.sh

# Verify hooks
ls -la .git/hooks/
cat .git/hooks/pre-commit
```

### 8. "Command not found"

**Symptoms:**
- Missing command errors
- PATH-related issues
- Environment problems

**Solutions:**

```bash
# Check required commands
which git bash node npm jq

# Install missing commands (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install git bash nodejs npm jq

# Install missing commands (macOS)
brew install git bash node jq

# Check PATH
echo $PATH
export PATH="/usr/local/bin:$PATH"
```

## Error Categories

### Critical Errors (Exit Code 1)

These errors prevent normal FlowForge operation:

#### Git Repository Errors
```
❌ Not in a Git repository
❌ Git directory corrupted
❌ Cannot access Git configuration
```

**Resolution:** Initialize or repair Git repository

#### File System Errors
```
❌ Missing required directory: .flowforge
❌ Required file not found: .flowforge/config.json
❌ Permission denied accessing directory
```

**Resolution:** Use auto-fix or manually create missing components

#### Configuration Errors
```
❌ Invalid JSON in configuration file
❌ Configuration version mismatch (critical)
❌ Corrupted configuration file
```

**Resolution:** Recreate configuration file or use auto-fix

### Warnings (Exit Code 0)

These issues suggest improvements but don't block functionality:

#### Optional Components
```
⚠️ Node.js not available (some features limited)
⚠️ Optional directory missing: agents
⚠️ jq not found (recommended)
```

**Resolution:** Install optional dependencies for enhanced features

#### Minor Configuration Issues
```
⚠️ Configuration version outdated
⚠️ Unknown configuration field
⚠️ GitHub API connection failed
```

**Resolution:** Update configuration or check network connectivity

### System Errors (Exit Code 2)

These indicate validator or system problems:

#### Validator Errors
```
❌ Validation script not found
❌ Validator execution failed
❌ Timeout during validation
```

**Resolution:** Check FlowForge installation integrity

## Debug Techniques

### Enable Debug Mode

```bash
# Enable comprehensive debugging
DEBUG=1 ./scripts/validate-installation.sh --verbose

# Show bash script execution
set -x
./scripts/validate-installation.sh
set +x
```

### Trace Execution

```bash
# Trace bash script
bash -x ./scripts/validate-installation.sh

# Trace specific functions
DEBUG=1 /flowforge:dev:validate --verbose
```

### Analyze JSON Output

```bash
# Get detailed error information
./scripts/validate-installation.sh --json | jq -r '
  .errors[] | 
  "Type: \(.type)\nMessage: \(.message)\nPath: \(.path // "N/A")\n---"
'

# Check performance metrics
./scripts/validate-installation.sh --json | jq '.performance'

# Extract warnings
./scripts/validate-installation.sh --json | jq -r '.warnings[]'
```

### Manual Component Testing

```bash
# Test Git repository
git rev-parse --git-dir
git status

# Test directory structure
for dir in .flowforge commands scripts documentation; do
  echo -n "$dir: "
  [ -d "$dir" ] && echo "✓" || echo "✗"
done

# Test file permissions
find scripts -name "*.sh" -not -perm -u+x

# Test Node.js validator
node scripts/validation/validator.js --help
```

## Platform-Specific Issues

### Windows (WSL/Git Bash)

#### Path Issues
```bash
# Fix path separators
export SCRIPT_DIR=$(cygpath -u "$(dirname "${BASH_SOURCE[0]}")")

# Use proper line endings
git config core.autocrlf true
```

#### Permission Issues
```bash
# Windows doesn't support execute permissions
# Validator handles this gracefully by checking file existence
```

### macOS

#### Permission Issues
```bash
# Fix Homebrew permissions
sudo chown -R $(whoami) /usr/local

# Install missing tools
brew install bash jq
```

#### Node.js Issues
```bash
# Fix Node.js installation
brew uninstall node
brew install node@18
echo 'export PATH="/usr/local/opt/node@18/bin:$PATH"' >> ~/.zshrc
```

### Linux

#### Package Manager Issues
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install git bash nodejs npm jq

# CentOS/RHEL
sudo yum install git bash nodejs npm jq

# Arch Linux
sudo pacman -S git bash nodejs npm jq
```

#### Permission Issues
```bash
# Fix script permissions
find . -name "*.sh" -exec chmod +x {} \;

# Fix directory permissions
chmod 755 .flowforge scripts commands
```

## Performance Issues

### Slow Validation

**Symptoms:**
- Validation takes >10 seconds
- Timeouts occur frequently
- High CPU or network usage

**Solutions:**

```bash
# Use bash validator (faster)
./scripts/validate-installation.sh

# Skip GitHub checks
SKIP_GITHUB_TEST=1 ./scripts/validate-installation.sh

# Use quiet mode
./scripts/validate-installation.sh --quiet

# Profile performance
time ./scripts/validate-installation.sh --json
```

### Memory Issues

**Symptoms:**
- Out of memory errors
- System becomes unresponsive
- Swap usage increases

**Solutions:**

```bash
# Monitor memory usage
top -p $(pgrep -f validate-installation)

# Use lighter validation
./scripts/validate-installation.sh --quiet

# Check for memory leaks
valgrind node scripts/validation/validator.js
```

### Network Issues

**Symptoms:**
- GitHub API timeouts
- DNS resolution failures
- Connection refused errors

**Solutions:**

```bash
# Test network connectivity
ping api.github.com
curl -I https://api.github.com

# Use alternative DNS
export DNS_SERVER=8.8.8.8

# Skip network tests
export SKIP_GITHUB_TEST=1
```

## Recovery Procedures

### Complete Reset

When validation completely fails:

```bash
#!/bin/bash
# complete-reset.sh - Nuclear option for broken installations

echo "🚨 Starting complete FlowForge reset..."

# 1. Backup current state
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cp -r .flowforge backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# 2. Remove broken components
rm -rf .flowforge
rm -f .git/hooks/*flowforge*

# 3. Reinstall FlowForge
if [ -f scripts/install-flowforge.sh ]; then
    ./scripts/install-flowforge.sh
else
    echo "❌ Install script not found"
    echo "💡 Please reinstall FlowForge from scratch"
    exit 1
fi

# 4. Validate installation
if ./scripts/validate-installation.sh --fix; then
    echo "✅ Reset complete and validation passed"
else
    echo "❌ Reset failed - manual intervention required"
    exit 1
fi
```

### Selective Repair

For specific component issues:

```bash
# Repair Git hooks only
rm -f .git/hooks/{pre-commit,commit-msg,post-commit}
./scripts/validate-installation.sh --fix

# Repair configuration only
rm -f .flowforge/config.json
./scripts/validate-installation.sh --fix

# Repair permissions only
find scripts -name "*.sh" -exec chmod +x {} \;
find .git/hooks -name "*flowforge*" -exec chmod +x {} \;
```

### Emergency Bypass

For critical situations where validation blocks essential operations:

```bash
# Temporarily disable validation
export FLOWFORGE_SKIP_VALIDATION=1

# Bypass Git hooks
git commit --no-verify -m "Emergency commit"

# Force validation to pass
export FLOWFORGE_FORCE_PASS=1
./scripts/validate-installation.sh
```

## Getting Help

### Diagnostic Information Collection

Before seeking help, collect diagnostic information:

```bash
#!/bin/bash
# collect-diagnostics.sh

echo "FlowForge Diagnostic Information"
echo "==============================="
echo "Date: $(date)"
echo "User: $(whoami)"
echo "PWD: $(pwd)"
echo

echo "System Information:"
echo "OS: $(uname -a)"
echo "Shell: $SHELL"
echo "Node: $(node --version 2>/dev/null || echo 'Not available')"
echo "npm: $(npm --version 2>/dev/null || echo 'Not available')"
echo

echo "FlowForge Structure:"
ls -la .flowforge/ 2>/dev/null || echo ".flowforge directory not found"
echo

echo "Git Information:"
git status 2>/dev/null || echo "Not in a Git repository"
ls -la .git/hooks/ 2>/dev/null | grep flowforge || echo "No FlowForge hooks found"
echo

echo "Validation Results:"
./scripts/validate-installation.sh --json 2>&1 | head -50

echo "Environment Variables:"
env | grep -E "(GITHUB|NODE|PATH|FLOWFORGE)" | sort
```

### Common Support Scenarios

1. **New Installation Issues**
   - Provide diagnostic output
   - Include installation method used
   - Share any error messages

2. **Performance Problems**
   - Include timing information
   - Share system specifications
   - Note network configuration

3. **Platform-Specific Issues**
   - Specify exact OS and version
   - Include shell information
   - Share permission errors

4. **Integration Problems**
   - Include CI/CD configuration
   - Share automation scripts
   - Provide full error logs

### Contact Information

- **GitHub Issues:** Use `validation` label
- **Documentation:** Check other guides in this directory
- **Debug Logs:** Always include with support requests

---

**Remember:** Most validation issues can be resolved with `./scripts/validate-installation.sh --fix` or by ensuring you're in the correct directory with proper permissions.