# FlowForge Validator User Guide

This guide helps users understand and effectively use the FlowForge Hybrid Smart Validator to ensure their FlowForge installations are healthy and properly configured.

## Table of Contents
- [Getting Started](#getting-started)
- [Command Options](#command-options)
- [Understanding Reports](#understanding-reports)
- [Health Scores](#health-scores)
- [Auto-Fix Features](#auto-fix-features)
- [Output Formats](#output-formats)
- [Common Scenarios](#common-scenarios)
- [Best Practices](#best-practices)

## Getting Started

### Prerequisites
- FlowForge 2.0+ installation
- Git repository (required)
- Bash shell (required)
- Node.js (optional, for enhanced features)

### Quick Validation
The simplest way to validate your FlowForge installation:

```bash
# Using FlowForge command (recommended)
/flowforge:dev:validate

# Or direct script execution
./scripts/validate-installation.sh
```

### First-Time Setup Validation
After installing FlowForge for the first time:

```bash
# Validate and auto-fix any issues
./scripts/validate-installation.sh --fix --verbose

# Check the results
echo $?  # 0 = success, 1 = issues found
```

## Command Options

### Basic Options
```bash
# Standard validation (terminal output)
./scripts/validate-installation.sh

# Verbose output with detailed information
./scripts/validate-installation.sh --verbose

# Silent mode (errors only)
./scripts/validate-installation.sh --quiet
```

### Auto-Fix Options
```bash
# Attempt to fix detected issues
./scripts/validate-installation.sh --fix

# Fix issues with verbose logging
./scripts/validate-installation.sh --fix --verbose

# Preview what would be fixed (without --fix)
./scripts/validate-installation.sh --verbose
```

### Output Format Options
```bash
# JSON output for automation
./scripts/validate-installation.sh --json

# HTML dashboard report
./scripts/validate-installation.sh --html > report.html

# Markdown report
./scripts/validate-installation.sh --markdown > report.md
```

### Help and Information
```bash
# Show help information
./scripts/validate-installation.sh --help

# Using FlowForge command help
/flowforge:dev:validate help
```

## Understanding Reports

### Terminal Output
The default terminal output provides a clear, color-coded report:

```
FlowForge Installation Validator v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Git repository detected
✓ Directory structure validated
✓ Required files present
⚠ Node.js not available (some features limited)
✓ Git hooks validated
✓ File permissions validated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Validation Complete

Health Score: 87/100
Checks: 23/25 passed

Warnings:
  • Node.js not available (some features limited)
  • Optional directory missing: agents

✅ FlowForge installation is healthy!
```

### Understanding Icons
- ✅ **Green checkmark**: Check passed successfully
- ⚠️ **Yellow warning**: Minor issue, doesn't block functionality
- ❌ **Red X**: Critical error that needs attention
- ℹ️ **Blue info**: Informational message
- ⟳ **Spinning**: Check in progress

### Progress Indicators
During validation, you'll see progress indicators:
```
⟳ Checking Git repository...
⟳ Validating directory structure...
⟳ Checking required files...
```

## Health Scores

### Score Ranges
The health score helps you quickly assess your installation quality:

| Score | Status | Icon | Description |
|-------|--------|------|-------------|
| 85-100 | Healthy | 🟢 | Installation is optimal |
| 70-84 | Warning | 🟡 | Minor issues detected |
| 50-69 | Poor | 🟠 | Several problems exist |
| 0-49 | Critical | 🔴 | Major issues require immediate attention |

### Score Calculation
The health score is calculated based on:
- **Base score**: 100 points
- **Critical errors**: -50 to -10 points each
- **Warnings**: -5 to -1 points each
- **Pass rate bonus**: +5 points for >90% pass rate

### What Affects Your Score

#### Critical Issues (-50 to -10 points)
- Missing Git repository (-50 points)
- Missing required directories (-10 points each)
- Missing required files (-15 points each)
- Missing Git hooks (-8 points each)

#### Warnings (-5 to -1 points)
- Missing optional directories (-2 points each)
- Outdated configuration (-3 to -5 points)
- Missing optional commands (-1 point each)
- Non-executable scripts (-2 points each)

## Auto-Fix Features

### What Can Be Fixed Automatically
The validator can automatically repair many common issues:

✅ **Fixable Issues:**
- Missing `.flowforge` directory
- Missing configuration files
- Incorrect file permissions
- Missing Git hooks
- Outdated configuration versions
- Non-executable scripts

❌ **Cannot Auto-Fix:**
- Missing Git repository (requires `git init`)
- Network connectivity issues
- Permission denied errors
- Corrupted files

### Using Auto-Fix
```bash
# See what would be fixed
./scripts/validate-installation.sh --verbose

# Apply fixes
./scripts/validate-installation.sh --fix

# Apply fixes with detailed output
./scripts/validate-installation.sh --fix --verbose
```

### Auto-Fix Report Example
```
Fixed Issues:
  • Created directory: .flowforge
  • Created default config: .flowforge/config.json
  • Created Git hook: pre-commit
  • Fixed permissions: scripts/task-time.sh
  • Updated config version
```

## Output Formats

### JSON Format
Perfect for automation and integration with other tools:

```bash
./scripts/validate-installation.sh --json > validation.json
```

```json
{
  "status": "success",
  "health_score": 87,
  "timestamp": "2025-01-15T10:30:00Z",
  "checks": {
    "performed": 25,
    "passed": 23,
    "failed": 2
  },
  "errors": [],
  "warnings": [
    "Node.js not available (some features limited)"
  ],
  "fixed": [],
  "performance": {
    "total_duration_ms": 1250
  }
}
```

### HTML Dashboard
Generate a beautiful HTML report for sharing or archiving:

```bash
./scripts/validate-installation.sh --html > dashboard.html
open dashboard.html  # macOS
xdg-open dashboard.html  # Linux
```

The HTML report includes:
- Interactive health score visualization
- Detailed metrics cards
- Color-coded issue lists
- Performance charts
- Responsive design for mobile

### Markdown Format
Create documentation-friendly reports:

```bash
./scripts/validate-installation.sh --markdown > report.md
```

Perfect for:
- Including in project documentation
- GitHub issue reports
- Team status updates
- Historical records

## Common Scenarios

### Scenario 1: Fresh Installation
After installing FlowForge on a new project:

```bash
# 1. Navigate to your project
cd /path/to/your/project

# 2. Run validation with auto-fix
./scripts/validate-installation.sh --fix --verbose

# 3. Check the results
if [ $? -eq 0 ]; then
    echo "✅ Installation successful!"
else
    echo "❌ Issues detected, check output above"
fi
```

### Scenario 2: CI/CD Pipeline
Integrate validation into your continuous integration:

```bash
#!/bin/bash
# In your CI script

# Run validation with JSON output
./scripts/validate-installation.sh --json > validation.json

# Check exit code
if [ $? -ne 0 ]; then
    echo "❌ FlowForge validation failed"
    cat validation.json
    exit 1
fi

echo "✅ FlowForge validation passed"
```

### Scenario 3: Debugging Issues
When FlowForge isn't working as expected:

```bash
# 1. Run verbose validation
DEBUG=1 ./scripts/validate-installation.sh --verbose

# 2. Check specific components
ls -la .flowforge/
git rev-parse --git-dir
echo $PATH

# 3. Try auto-fix if issues found
./scripts/validate-installation.sh --fix
```

### Scenario 4: Team Onboarding
Help new team members validate their setup:

```bash
# Create a simple validation script for team
cat > validate-setup.sh << 'EOF'
#!/bin/bash
echo "🚀 Validating your FlowForge setup..."
./scripts/validate-installation.sh --fix --verbose

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup complete! You're ready to use FlowForge."
else
    echo ""
    echo "❌ Setup issues detected. Please review the output above."
    echo "Need help? Check the troubleshooting guide:"
    echo "   documentation/2.0/validation/TROUBLESHOOTING.md"
fi
EOF

chmod +x validate-setup.sh
```

### Scenario 5: Maintenance and Health Checks
Regular validation for ongoing projects:

```bash
# Weekly health check (in cron or scheduled task)
0 9 * * 1 cd /path/to/project && ./scripts/validate-installation.sh --json >> logs/weekly-health.log

# Generate monthly report
./scripts/validate-installation.sh --html > reports/health-$(date +%Y-%m).html
```

## Best Practices

### 1. Regular Validation
- Run validation before starting work sessions
- Include validation in your Git hooks
- Schedule periodic health checks
- Validate after major changes

### 2. Environment Management
```bash
# Set up your environment
export GITHUB_TOKEN="your-token-here"  # For GitHub API features
export FLOWFORGE_ENV="development"     # Optional environment flag

# Add to your shell profile
echo 'export GITHUB_TOKEN="your-token"' >> ~/.bashrc
```

### 3. Team Standards
- Document required health score (recommend 85+)
- Share validation reports in team meetings
- Use auto-fix for consistent environments
- Include validation in onboarding checklists

### 4. Automation Integration
```bash
# Pre-commit hook
echo './scripts/validate-installation.sh --quiet' >> .git/hooks/pre-commit

# Package.json script
{
  "scripts": {
    "validate": "./scripts/validate-installation.sh",
    "validate:fix": "./scripts/validate-installation.sh --fix",
    "validate:report": "./scripts/validate-installation.sh --html > validation-report.html"
  }
}
```

### 5. Troubleshooting Workflow
1. Run validation with verbose output
2. Check the health score and specific errors
3. Try auto-fix for fixable issues
4. Consult the troubleshooting guide
5. Check environment variables and dependencies
6. Review recent changes that might have caused issues

### 6. Performance Optimization
- Use `--quiet` in automated scripts
- Skip GitHub checks in CI with `SKIP_GITHUB_TEST=1`
- Cache validation results for frequent checks
- Use JSON output for programmatic processing

## Exit Codes

Understanding validator exit codes helps with automation:

| Exit Code | Meaning | Next Steps |
|-----------|---------|------------|
| 0 | Success (health score ≥ 70) | Continue with normal operations |
| 1 | Issues detected (health score < 70) | Review errors, try auto-fix |
| 2 | Critical validation error | Check environment, dependencies |

### Using Exit Codes in Scripts
```bash
#!/bin/bash
./scripts/validate-installation.sh --quiet

case $? in
    0)
        echo "✅ Validation passed"
        ;;
    1)
        echo "⚠️ Issues detected, attempting auto-fix..."
        ./scripts/validate-installation.sh --fix --quiet
        ;;
    2)
        echo "❌ Critical error during validation"
        exit 1
        ;;
esac
```

---

**Next Steps:**
- Review the [API Reference](API_REFERENCE.md) for developer integration
- Check the [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues
- See the main [README](README.md) for technical details