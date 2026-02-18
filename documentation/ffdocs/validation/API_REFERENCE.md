# FlowForge Validator API Reference

This document provides a comprehensive reference for the FlowForge Hybrid Smart Validator API, including both programmatic interfaces and command-line usage.

## Table of Contents
- [Node.js API](#nodejs-api)
- [Bash Script API](#bash-script-api)
- [Command Line Interface](#command-line-interface)
- [Data Structures](#data-structures)
- [Exit Codes](#exit-codes)
- [Environment Variables](#environment-variables)
- [Integration Examples](#integration-examples)

## Node.js API

### FlowForgeValidator Class

The main validator class provides programmatic access to all validation functionality.

#### Constructor

```javascript
const { FlowForgeValidator } = require('./scripts/validation/validator.js');

const validator = new FlowForgeValidator(projectRoot);
```

**Parameters:**
- `projectRoot` (string, optional): Root directory of the FlowForge project. Defaults to `process.cwd()`.

**Properties:**
- `healthScore` (number): Current health score (0-100)
- `errors` (Array): Array of error objects
- `warnings` (Array): Array of warning messages
- `fixedIssues` (Array): Array of auto-fixed issues
- `checksPerformed` (number): Total number of checks performed
- `checksPassed` (number): Number of checks that passed
- `version` (string): FlowForge version being validated
- `validatorVersion` (string): Validator version

#### Methods

##### `validate(options = {})`

Runs comprehensive validation of the FlowForge installation.

```javascript
const results = await validator.validate({
  fix: false,        // Enable auto-fix
  skipGithub: false  // Skip GitHub API tests
});
```

**Parameters:**
- `options` (Object, optional): Validation options
  - `fix` (boolean): Enable auto-fix mode. Default: `false`
  - `skipGithub` (boolean): Skip GitHub API tests. Default: `false`

**Returns:**
```javascript
{
  status: 'success' | 'error',
  health_score: number,
  timestamp: string,
  validator_version: string,
  flowforge_version: string,
  checks: {
    performed: number,
    passed: number,
    failed: number
  },
  errors: Array<ErrorObject>,
  warnings: Array<string>,
  fixed: Array<string>,
  performance: {
    total_duration_ms: number,
    checks: Object<string, number>
  }
}
```

##### `checkGitRepository()`

Validates that the current directory is a Git repository.

```javascript
const isGitRepo = await validator.checkGitRepository();
```

**Returns:** `boolean` - True if valid Git repository

##### `checkDirectories()`

Validates required and optional directory structure.

```javascript
await validator.checkDirectories();
```

**Side Effects:**
- Updates `healthScore`
- Adds errors to `errors` array
- Adds warnings to `warnings` array

##### `checkFiles()`

Validates presence of required files.

```javascript
await validator.checkFiles();
```

**Side Effects:**
- Updates `healthScore`
- Adds errors to `errors` array
- Calls `validateConfigFile()` for config.json

##### `validateConfiguration()`

Deep validation of FlowForge configuration.

```javascript
const result = await validator.validateConfiguration();
```

**Returns:**
```javascript
{
  valid: boolean,
  warnings: Array<string>
}
```

##### `checkGitHooks()`

Validates Git hooks installation and permissions.

```javascript
await validator.checkGitHooks();
```

**Side Effects:**
- Updates `healthScore`
- Adds errors for missing or non-executable hooks

##### `checkPermissions()`

Validates file permissions for scripts.

```javascript
await validator.checkPermissions();
```

**Side Effects:**
- Updates `healthScore`
- Adds warnings for non-executable scripts

##### `checkNodeEnvironment()`

Checks Node.js availability and version.

```javascript
const nodeInfo = await validator.checkNodeEnvironment();
```

**Returns:**
```javascript
{
  available: boolean,
  version?: string,
  error?: string
}
```

##### `testGitHubIntegration()`

Tests GitHub API connectivity and rate limits.

```javascript
const githubStatus = await validator.testGitHubIntegration();
```

**Returns:**
```javascript
{
  connected: boolean,
  rate_limit?: Object,
  error?: string
}
```

##### `fix()`

Attempts to automatically fix detected issues.

```javascript
const fixResults = await validator.fix();
```

**Returns:**
```javascript
{
  status: 'success' | 'error',
  fixed: Array<string>,
  failed: Array<string>,
  message?: string
}
```

**Fixable Issues:**
- Missing directories
- Missing configuration files
- Missing Git hooks
- File permissions
- Outdated configuration versions

#### Error Objects

Error objects have the following structure:

```javascript
{
  type: string,        // Error category
  message: string,     // Human-readable error message
  path?: string,       // File/directory path related to error
  details?: Object     // Additional error details
}
```

**Error Types:**
- `git_repository`: Not in a Git repository
- `missing_directory`: Required directory not found
- `missing_file`: Required file not found
- `missing_config`: Configuration file not found
- `invalid_json`: Malformed JSON in config
- `missing_hook`: Git hook not found
- `hook_permissions`: Git hook not executable
- `directory_error`: Directory access error
- `invalid_config`: Configuration validation error

#### Usage Example

```javascript
const { FlowForgeValidator } = require('./scripts/validation/validator.js');

async function validateProject() {
  const validator = new FlowForgeValidator('/path/to/project');
  
  try {
    // Run validation
    const results = await validator.validate({ 
      fix: true,
      skipGithub: process.env.CI === 'true'
    });
    
    console.log(`Health Score: ${results.health_score}/100`);
    console.log(`Checks: ${results.checks.passed}/${results.checks.performed} passed`);
    
    if (results.errors.length > 0) {
      console.log('Errors:', results.errors);
    }
    
    if (results.fixed.length > 0) {
      console.log('Fixed Issues:', results.fixed);
    }
    
    return results.status === 'success';
    
  } catch (error) {
    console.error('Validation failed:', error.message);
    return false;
  }
}

// Use in your application
validateProject().then(isValid => {
  if (isValid) {
    console.log('✅ Validation passed');
    process.exit(0);
  } else {
    console.log('❌ Validation failed');
    process.exit(1);
  }
});
```

## Bash Script API

### Command Line Interface

The bash validator provides a command-line interface with multiple options.

#### Basic Usage

```bash
./scripts/validate-installation.sh [OPTIONS]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--json` | Output results in JSON format | false |
| `--html` | Generate HTML dashboard report | false |
| `--markdown` | Generate Markdown report | false |
| `--fix` | Attempt to fix detected issues | false |
| `--verbose`, `-v` | Show detailed validation information | false |
| `--quiet`, `-q` | Suppress non-error output | false |
| `--help`, `-h` | Show help message | - |

#### Environment Variables

The bash validator respects several environment variables:

```bash
# Enable debug output
export DEBUG=1

# Skip GitHub API tests (for CI environments)
export CI=1
export SKIP_GITHUB_TEST=1

# GitHub token for API calls
export GITHUB_TOKEN="your-token"
export GH_TOKEN="your-token"
```

#### Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 0 | Success | Health score ≥ 70 |
| 1 | Validation Failed | Health score < 70 |
| 2 | Critical Error | Script execution failed |

#### Output Formats

##### Terminal Format (Default)

Human-readable output with color coding:

```
FlowForge Installation Validator v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Git repository detected
✓ Directory structure validated
⚠ Node.js not available (some features limited)
✓ Required files present
✓ Git hooks validated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Validation Complete

Health Score: 87/100
Checks: 23/25 passed

✅ FlowForge installation is healthy!
```

##### JSON Format

Machine-readable structured output:

```json
{
  "status": "success",
  "health_score": 87,
  "timestamp": "2025-01-15T10:30:00Z",
  "validator_version": "1.0.0",
  "flowforge_version": "2.0.0",
  "checks": {
    "performed": 25,
    "passed": 23,
    "failed": 2
  },
  "errors": [],
  "warnings": [
    "Node.js not available (some features limited)",
    "Optional directory missing: agents"
  ],
  "fixed": [],
  "performance": {
    "total_duration_ms": 1250,
    "checks": {
      "directories": 123,
      "files": 89,
      "permissions": 43,
      "hooks": 67
    }
  }
}
```

##### HTML Format

Rich dashboard with interactive elements:

```html
<!DOCTYPE html>
<html>
<head>
  <title>FlowForge Health Dashboard</title>
  <!-- Embedded CSS and JavaScript -->
</head>
<body>
  <!-- Health score visualization -->
  <!-- Interactive metrics cards -->
  <!-- Issue details and recommendations -->
</body>
</html>
```

##### Markdown Format

Documentation-friendly report:

```markdown
# FlowForge Installation Report

**Generated:** 2025-01-15 10:30:00 UTC
**Health Score:** 87/100 - Healthy

## Validation Summary

| Metric | Value |
|--------|-------|
| Total Checks | 25 |
| Passed | 23 |
| Failed | 2 |
| Pass Rate | 92% |

## Issues Detected

### Warnings (2)
- ⚠️ Node.js not available (some features limited)
- ⚠️ Optional directory missing: agents
```

### Script Functions

The bash validator provides internal functions that can be used for custom validation:

#### `check_file(file, description, required)`

Validates file existence.

```bash
# Usage
check_file ".flowforge/config.json" "FlowForge configuration" true

# Returns
# 0 if file exists
# 1 if file missing
```

#### `check_directory(dir, description, required)`

Validates directory existence.

```bash
# Usage
check_directory ".flowforge" "FlowForge directory" true

# Returns
# 0 if directory exists
# 1 if directory missing
```

#### `check_executable(file, description)`

Validates file existence and executable permissions.

```bash
# Usage
check_executable "scripts/task-time.sh" "Time tracking script"

# Returns
# 0 if executable
# 1 if not executable or missing
```

#### Global Variables

The bash validator uses several global variables:

```bash
HEALTH_SCORE=100          # Current health score
ERRORS=()                 # Array of error messages
WARNINGS=()               # Array of warning messages
FIXED_ISSUES=()           # Array of fixed issues
CHECKS_PERFORMED=0        # Total checks performed
CHECKS_PASSED=0          # Checks that passed
VALIDATION_START_TIME    # Validation start timestamp
```

## FlowForge Command Integration

### `/flowforge:dev:validate`

The FlowForge command provides native integration with the validator:

```bash
# Basic validation
/flowforge:dev:validate

# Verbose output
/flowforge:dev:validate --verbose

# Help information
/flowforge:dev:validate help
```

#### Command Structure

The command is implemented in `/commands/flowforge/dev/validate.md` and provides:

- Error handling with helpful messages
- Integration with FlowForge environment
- Consistent output formatting
- Auto-discovery of validator scripts

## Data Structures

### Validation Results

Standard validation result structure used across all interfaces:

```typescript
interface ValidationResults {
  status: 'success' | 'error' | 'warning';
  health_score: number;                    // 0-100
  timestamp: string;                       // ISO 8601 format
  validator_version: string;
  flowforge_version: string;
  checks: {
    performed: number;
    passed: number;
    failed: number;
  };
  errors: ErrorObject[];
  warnings: string[];
  fixed: string[];
  performance: {
    total_duration_ms: number;
    checks: Record<string, number>;
  };
}
```

### Error Object

```typescript
interface ErrorObject {
  type: string;           // Error category
  message: string;        // Human-readable message
  path?: string;          // Related file/directory path
  details?: any;          // Additional error context
}
```

### Configuration Structure

FlowForge configuration file structure:

```typescript
interface FlowForgeConfig {
  version: string;                    // FlowForge version
  features: string[];                 // Enabled features
  created: string;                    // ISO 8601 timestamp
  validator_version?: string;         // Validator version
  updated?: string;                   // Last update timestamp
}
```

**Valid Features:**
- `time-tracking`: Time tracking functionality
- `github-integration`: GitHub API integration
- `auto-validation`: Automatic validation
- `agent-system`: FlowForge agent system

## Integration Examples

### CI/CD Pipeline Integration

#### GitHub Actions

```yaml
name: FlowForge Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Validate FlowForge Installation
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          ./scripts/validate-installation.sh --json > validation.json
          
          # Check exit code
          if [ $? -ne 0 ]; then
            echo "❌ Validation failed"
            cat validation.json
            exit 1
          fi
          
          # Extract health score
          HEALTH_SCORE=$(node -pe "JSON.parse(require('fs').readFileSync('validation.json', 'utf8')).health_score")
          echo "Health Score: $HEALTH_SCORE/100"
          
          # Require minimum health score
          if [ "$HEALTH_SCORE" -lt 85 ]; then
            echo "❌ Health score too low (minimum: 85)"
            exit 1
          fi
          
          echo "✅ Validation passed"
          
      - name: Upload Validation Report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: validation-report
          path: validation.json
```

#### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('FlowForge Validation') {
            steps {
                script {
                    sh './scripts/validate-installation.sh --json > validation.json'
                    
                    def exitCode = sh(
                        script: 'echo $?',
                        returnStdout: true
                    ).trim() as Integer
                    
                    if (exitCode != 0) {
                        error("FlowForge validation failed")
                    }
                    
                    // Parse results
                    def results = readJSON file: 'validation.json'
                    echo "Health Score: ${results.health_score}/100"
                    
                    if (results.health_score < 85) {
                        error("Health score below threshold: ${results.health_score}")
                    }
                }
            }
            
            post {
                always {
                    archiveArtifacts artifacts: 'validation.json', fingerprint: true
                }
            }
        }
    }
}
```

### Pre-commit Hook Integration

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running FlowForge validation..."

# Run validation with quiet mode
if ! ./scripts/validate-installation.sh --quiet; then
    echo "❌ FlowForge validation failed"
    echo "   Run './scripts/validate-installation.sh --fix' to attempt repairs"
    echo "   Or use 'git commit --no-verify' to bypass this check"
    exit 1
fi

echo "✅ FlowForge validation passed"
exit 0
```

### Node.js Application Integration

```javascript
// app.js - Express application with health check endpoint

const express = require('express');
const { FlowForgeValidator } = require('./scripts/validation/validator.js');

const app = express();
const validator = new FlowForgeValidator();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const results = await validator.validate({
      skipGithub: true  // Skip slow GitHub checks for health endpoint
    });
    
    res.status(results.status === 'success' ? 200 : 503).json({
      status: results.status,
      health_score: results.health_score,
      timestamp: results.timestamp,
      checks: results.checks,
      errors: results.errors,
      warnings: results.warnings
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Detailed validation endpoint
app.get('/validate', async (req, res) => {
  try {
    const results = await validator.validate({
      fix: req.query.fix === 'true'
    });
    
    res.json(results);
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Validation failed',
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Health check: http://localhost:3000/health');
  console.log('Validation: http://localhost:3000/validate');
});
```

### Custom Validation Script

```bash
#!/bin/bash
# custom-validation.sh - Custom validation with email alerts

RECIPIENT="admin@example.com"
HEALTH_THRESHOLD=80

# Run validation
echo "Running FlowForge validation..."
./scripts/validate-installation.sh --json > validation.json

EXIT_CODE=$?
HEALTH_SCORE=$(node -pe "JSON.parse(require('fs').readFileSync('validation.json', 'utf8')).health_score")

# Generate report
./scripts/validate-installation.sh --html > validation-report.html

# Check results
if [ $EXIT_CODE -ne 0 ] || [ "$HEALTH_SCORE" -lt "$HEALTH_THRESHOLD" ]; then
    # Send alert email
    {
        echo "Subject: FlowForge Validation Alert"
        echo "Content-Type: text/html"
        echo ""
        cat validation-report.html
    } | sendmail "$RECIPIENT"
    
    echo "❌ Validation failed (Health Score: $HEALTH_SCORE)"
    exit 1
else
    echo "✅ Validation passed (Health Score: $HEALTH_SCORE)"
    exit 0
fi
```

## Performance Considerations

### Optimization Tips

1. **Skip GitHub checks in CI**: Set `SKIP_GITHUB_TEST=1`
2. **Use quiet mode**: Add `--quiet` for automated scripts
3. **Cache validation results**: Store results for repeated checks
4. **Timeout protection**: Built-in 25-second timeout for Node.js validator
5. **Fallback mechanism**: Automatic fallback to bash validator

### Typical Performance

- **Bash validator**: ~500ms (local checks only)
- **Node.js validator**: ~2-5s (includes GitHub API)
- **Memory usage**: <10MB for both validators
- **Network calls**: Only for GitHub API (optional)

---

This API reference provides comprehensive coverage of the FlowForge Hybrid Smart Validator interfaces. For usage examples and troubleshooting, see the [User Guide](USER_GUIDE.md) and [Troubleshooting Guide](TROUBLESHOOTING.md).