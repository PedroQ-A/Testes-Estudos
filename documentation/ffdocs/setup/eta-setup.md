# ETA System Setup Guide

## Overview

This guide covers the setup and configuration of the dual ETA feature in FlowForge statusline. The ETA system provides accurate time-to-completion estimates for individual tickets and project milestones based on historical velocity data and real-time tracking.

## Prerequisites

### System Requirements

- **Python 3.8+**: Required for ETA calculation modules
- **FlowForge 2.0+**: Base FlowForge installation
- **Git repository**: Project must be git-initialized
- **GitHub integration**: For issue and milestone data

### Required Dependencies

```bash
# Core Python modules (usually included)
import json
import os
import re
import time
from pathlib import Path
from typing import Dict, List, Optional, Union, Any
from datetime import datetime, timedelta
```

### Optional Dependencies

```bash
# For enhanced GitHub integration
pip install PyGithub>=1.55

# For improved time parsing
pip install python-dateutil>=2.8.0
```

## Installation

### Automatic Setup

The ETA system is automatically configured when you install FlowForge 2.0:

```bash
# Standard FlowForge installation includes ETA system
curl -sSL https://install.flowforge.dev | bash

# Or via git clone
git clone https://github.com/JustCode-CruzAlex/FlowForge.git
cd FlowForge
./install.sh
```

### Manual Setup

If you need to set up the ETA system manually:

```bash
# 1. Copy ETA modules to your project
cp .claude/eta_calculator.py /path/to/your/project/
cp .claude/estimate_parser.py /path/to/your/project/

# 2. Create required directories
mkdir -p .flowforge/billing
mkdir -p .flowforge/cache

# 3. Initialize tracking files
echo '{"sessions": {}}' > .flowforge/billing/time-tracking.json
echo '{"history": []}' > .flowforge/billing/velocity-history.json

# 4. Test installation
python3 -c "from eta_calculator import ETACalculator; print('ETA system ready')"
```

### Verification

```bash
# Check if ETA system is properly installed
python3 -c "
try:
    from eta_calculator import ETACalculator
    from estimate_parser import EstimateParser
    print('✅ ETA system installed correctly')
except ImportError as e:
    print(f'❌ ETA system not available: {e}')
"
```

## Directory Structure

The ETA system uses the following directory structure:

```
project-root/
├── .flowforge/
│   ├── billing/
│   │   ├── time-tracking.json     # Active time tracking data
│   │   └── velocity-history.json  # Historical velocity data
│   └── cache/
│       └── statusline-cache-*.json # Statusline cache files
├── eta_calculator.py              # Core ETA calculation engine
├── estimate_parser.py             # Issue estimate parsing
└── statusline.py                  # Enhanced statusline with ETA display
```

### File Purposes

#### `.flowforge/billing/time-tracking.json`
Stores active time tracking data for all issues:

```json
{
  "sessions": {
    "142": {
      "total_seconds": 14400,
      "last_updated": "2024-09-15T10:30:00Z",
      "sessions": [
        {
          "start": "2024-09-15T08:00:00Z",
          "end": "2024-09-15T12:00:00Z",
          "duration": 14400,
          "description": "Implementing dual ETA feature"
        }
      ]
    }
  },
  "metadata": {
    "version": "2.0",
    "last_backup": "2024-09-15T00:00:00Z"
  }
}
```

#### `.flowforge/billing/velocity-history.json`
Stores historical completion data for velocity calculations:

```json
{
  "history": [
    {
      "issue_number": "142",
      "estimated": 8.0,
      "actual": 10.5,
      "velocity": 0.76,
      "completed_date": "2024-09-15",
      "issue_type": "feature",
      "complexity": "medium",
      "developer": "dev1"
    }
  ],
  "team_velocity": 0.85,
  "last_calculated": "2024-09-15T10:30:00Z",
  "metadata": {
    "version": "2.0",
    "sample_size": 15
  }
}
```

## Configuration

### Basic Configuration

The ETA system works out-of-the-box with default settings. No configuration is required for basic functionality.

### Advanced Configuration

#### Custom Paths

```python
# Configure custom paths in your statusline initialization
from eta_calculator import ETACalculator

calculator = ETACalculator(
    time_tracking_path="custom/path/time-tracking.json",
    velocity_history_path="custom/path/velocity.json"
)
```

#### Team Settings

```python
# Configure team-specific settings
calculator = ETACalculator()

# Set team size for concurrent work calculations
calculator.team_size = 3

# Set default velocity for new teams
calculator.default_velocity = 0.8  # Team takes 25% longer than estimates
```

#### Cache Configuration

```bash
# Set custom cache directory via environment
export XDG_CACHE_HOME=/path/to/custom/cache

# Or configure in code
import os
os.environ['XDG_CACHE_HOME'] = '/path/to/custom/cache'
```

### Environment Variables

The ETA system respects several environment variables:

```bash
# Cache directory
export XDG_CACHE_HOME=/custom/cache/dir

# Default team velocity (0.1 to 5.0)
export FLOWFORGE_DEFAULT_VELOCITY=0.85

# Team size for concurrent calculations
export FLOWFORGE_TEAM_SIZE=3

# Enable debug logging
export FLOWFORGE_ETA_DEBUG=true

# GitHub API token for enhanced issue fetching
export GITHUB_TOKEN=ghp_your_token_here
```

## GitHub Integration

### Issue Estimate Format

Add estimates to your GitHub issues using any of these formats:

```markdown
# Method 1: Standard format
**Estimate:** 4h

# Method 2: Natural language
This task should take approximately 6 hours to complete.

# Method 3: Inline format
Estimate: 2.5h

# Method 4: Time format
Time: 8 hours

# Method 5: Estimated format
4.5h estimated
```

### Supported Estimate Formats

| Format | Example | Parsed Value |
|--------|---------|--------------|
| `Estimate: Xh` | `Estimate: 4h` | 4.0 |
| `Estimate: X hours` | `Estimate: 2.5 hours` | 2.5 |
| `Time: Xh` | `Time: 8h` | 8.0 |
| `X hours estimated` | `4 hours estimated` | 4.0 |
| `Xh estimated` | `2.5h estimated` | 2.5 |

### Example Issue Template

Create a `.github/ISSUE_TEMPLATE/feature.md` template:

```markdown
---
name: Feature Request
about: Create a feature request with time estimate
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Description
Brief description of the feature.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes
Any technical considerations.

## **Estimate: Xh**
Replace X with estimated hours (e.g., 4h, 2.5h).

## Dependencies
List any dependencies on other issues.
```

### Milestone Setup

1. **Create milestones** in GitHub with clear names
2. **Assign issues** to milestones for tracking
3. **Set milestone due dates** for additional context

```bash
# Create milestone via GitHub CLI
gh milestone create "v2.0 Launch" --due-date 2024-10-01 --description "Major release with new features"

# Assign issue to milestone
gh issue edit 142 --milestone "v2.0 Launch"
```

## Testing the Setup

### Basic Functionality Test

```python
#!/usr/bin/env python3
"""Test ETA system setup."""

def test_eta_system():
    """Test all ETA system components."""

    # Test 1: Import modules
    try:
        from eta_calculator import ETACalculator, format_eta
        from estimate_parser import EstimateParser
        print("✅ All modules imported successfully")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

    # Test 2: Initialize calculator
    try:
        calculator = ETACalculator()
        print("✅ ETACalculator initialized")
    except Exception as e:
        print(f"❌ Calculator initialization failed: {e}")
        return False

    # Test 3: Test estimate parsing
    try:
        parser = EstimateParser()
        estimate = parser.parse_estimate("Estimate: 4h")
        assert estimate == 4.0
        print(f"✅ Estimate parsing works: {estimate}h")
    except Exception as e:
        print(f"❌ Estimate parsing failed: {e}")
        return False

    # Test 4: Test time formatting
    try:
        formatted = format_eta(2.5)
        assert formatted == "2h 30m"
        print(f"✅ Time formatting works: {formatted}")
    except Exception as e:
        print(f"❌ Time formatting failed: {e}")
        return False

    # Test 5: Test file access
    try:
        time_spent = calculator.get_time_spent("999")  # Non-existent issue
        assert time_spent == 0.0
        print("✅ File access works (graceful handling)")
    except Exception as e:
        print(f"❌ File access failed: {e}")
        return False

    print("\n🎉 ETA system setup is complete and working!")
    return True

if __name__ == "__main__":
    test_eta_system()
```

### Statusline Integration Test

```bash
# Test statusline with ETA system
python3 statusline.py

# Expected output should include ETA information:
# [FlowForge] | 🎯 v2.0 (5/10) [█████░░░░░] 50% | ⏰ 4h 30m on #142 | 2d milestone | ...
```

### Manual Testing Commands

```bash
# Test estimate parsing
python3 -c "
from estimate_parser import EstimateParser
parser = EstimateParser()
print('Testing estimates:')
print(f'\"Estimate: 4h\" -> {parser.parse_estimate(\"Estimate: 4h\")}')
print(f'\"Time: 2.5 hours\" -> {parser.parse_estimate(\"Time: 2.5 hours\")}')
print(f'\"8h estimated\" -> {parser.parse_estimate(\"8h estimated\")}')
"

# Test time formatting
python3 -c "
from eta_calculator import format_eta
print('Testing time formatting:')
print(f'2.5 hours -> {format_eta(2.5)}')
print(f'26 hours -> {format_eta(26)}')
print(f'0 hours -> {format_eta(0)}')
print(f'-2 hours -> {format_eta(-2)}')
"

# Test ETA calculation (with mock data)
python3 -c "
from eta_calculator import ETACalculator
calculator = ETACalculator()
try:
    eta = calculator.calculate_ticket_eta('142')
    print(f'Mock ETA calculation successful: {eta} hours')
except Exception as e:
    print(f'ETA calculation: {e} (expected for new setup)')
"
```

## Cache Management

### Cache Directory Structure

```
$XDG_CACHE_HOME/flowforge/  (or ~/.cache/flowforge/)
├── statusline-cache-a1b2c3d4.json    # Project-specific cache
├── github-issues-cache.json          # GitHub API cache
└── velocity-calculations.json        # Velocity calculation cache
```

### Cache Maintenance

```bash
# View cache usage
du -sh ~/.cache/flowforge/

# Clear all caches
rm -rf ~/.cache/flowforge/

# Clear specific project cache
rm ~/.cache/flowforge/statusline-cache-*.json

# View cache contents
jq '.' ~/.cache/flowforge/statusline-cache-*.json
```

### Cache Configuration

```python
# Configure cache behavior
import os
import tempfile
from pathlib import Path

# Custom cache directory
cache_dir = Path("/custom/cache/location")
cache_dir.mkdir(parents=True, exist_ok=True)
os.environ['XDG_CACHE_HOME'] = str(cache_dir)

# Or use system temp directory
temp_cache = Path(tempfile.gettempdir()) / "flowforge-cache"
temp_cache.mkdir(exist_ok=True)
```

## Troubleshooting

### Common Setup Issues

#### Module Import Errors

**Problem**: `ImportError: No module named 'eta_calculator'`

**Solutions**:
```bash
# Ensure modules are in Python path
export PYTHONPATH="$PYTHONPATH:$(pwd)"

# Or copy modules to project directory
cp .claude/eta_calculator.py .
cp .claude/estimate_parser.py .

# Verify module location
find . -name "eta_calculator.py" -type f
```

#### Permission Errors

**Problem**: `Permission denied` when creating cache files

**Solutions**:
```bash
# Fix cache directory permissions
chmod 755 ~/.cache/flowforge/

# Use alternative cache directory
export XDG_CACHE_HOME=/tmp/flowforge-cache

# Check available space
df -h ~/.cache/
```

#### File Not Found Errors

**Problem**: `FileNotFoundError: time-tracking.json`

**Solutions**:
```bash
# Create missing directories and files
mkdir -p .flowforge/billing
echo '{"sessions": {}}' > .flowforge/billing/time-tracking.json
echo '{"history": []}' > .flowforge/billing/velocity-history.json

# Verify file creation
ls -la .flowforge/billing/
```

### Performance Issues

#### Slow ETA Calculations

**Problem**: Statusline takes >1 second to generate

**Solutions**:
```python
# Enable performance monitoring
import time

start = time.time()
# ... ETA calculations ...
duration = time.time() - start
print(f"ETA calculation took {duration:.3f}s")

# Optimize by:
# 1. Using local cache for GitHub data
# 2. Reducing API calls
# 3. Implementing async calculations
```

#### High Memory Usage

**Problem**: ETA system using excessive memory

**Solutions**:
```bash
# Monitor memory usage
ps aux | grep python3

# Clear caches regularly
find ~/.cache/flowforge/ -name "*.json" -mtime +7 -delete

# Limit cache size
du -sh ~/.cache/flowforge/ | awk '{if($1 > "10M") print "Cache too large"}'
```

### Validation Scripts

#### Complete Setup Validation

```bash
#!/bin/bash
# validate-eta-setup.sh

echo "🔍 Validating ETA system setup..."

# Check Python version
python_version=$(python3 --version 2>&1)
echo "Python version: $python_version"

# Check required directories
for dir in ".flowforge/billing" ".flowforge/cache"; do
    if [ -d "$dir" ]; then
        echo "✅ Directory exists: $dir"
    else
        echo "❌ Missing directory: $dir"
        mkdir -p "$dir"
        echo "📁 Created directory: $dir"
    fi
done

# Check required files
for file in ".flowforge/billing/time-tracking.json" ".flowforge/billing/velocity-history.json"; do
    if [ -f "$file" ]; then
        echo "✅ File exists: $file"
    else
        echo "❌ Missing file: $file"
        case "$file" in
            *time-tracking.json)
                echo '{"sessions": {}}' > "$file"
                ;;
            *velocity-history.json)
                echo '{"history": []}' > "$file"
                ;;
        esac
        echo "📄 Created file: $file"
    fi
done

# Test Python modules
python3 -c "
import sys
try:
    from eta_calculator import ETACalculator
    from estimate_parser import EstimateParser
    print('✅ Python modules available')
except ImportError as e:
    print(f'❌ Python modules missing: {e}')
    sys.exit(1)
"

# Test cache directory
cache_test_file="$HOME/.cache/flowforge/test.json"
mkdir -p "$(dirname "$cache_test_file")"
echo '{}' > "$cache_test_file" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Cache directory writable"
    rm "$cache_test_file"
else
    echo "❌ Cache directory not writable"
fi

echo "🎉 ETA system validation complete!"
```

#### Performance Benchmark

```python
#!/usr/bin/env python3
"""Benchmark ETA system performance."""

import time
import statistics
from eta_calculator import ETACalculator, format_eta

def benchmark_eta_system():
    """Run performance benchmarks."""
    calculator = ETACalculator()

    # Benchmark estimate parsing
    from estimate_parser import EstimateParser
    parser = EstimateParser()

    test_estimates = [
        "Estimate: 4h",
        "Time: 2.5 hours",
        "8h estimated",
        "Approximately 6 hours needed"
    ]

    parse_times = []
    for estimate_text in test_estimates:
        start = time.time()
        result = parser.parse_estimate(estimate_text)
        duration = time.time() - start
        parse_times.append(duration * 1000)  # Convert to ms

    print(f"Estimate parsing: {statistics.mean(parse_times):.2f}ms avg")

    # Benchmark time formatting
    format_times = []
    test_hours = [0, 0.5, 2.5, 8, 26, 45, 168]

    for hours in test_hours:
        start = time.time()
        result = format_eta(hours)
        duration = time.time() - start
        format_times.append(duration * 1000)

    print(f"Time formatting: {statistics.mean(format_times):.2f}ms avg")

    # Benchmark ETA calculation
    calc_times = []
    test_issues = ["142", "143", "144", "145", "146"]

    for issue in test_issues:
        start = time.time()
        try:
            result = calculator.calculate_ticket_eta(issue)
        except:
            pass  # Expected for non-existent issues
        duration = time.time() - start
        calc_times.append(duration * 1000)

    print(f"ETA calculation: {statistics.mean(calc_times):.2f}ms avg")

    # Performance targets
    targets = {
        "parsing": 1.0,    # 1ms
        "formatting": 0.5, # 0.5ms
        "calculation": 100 # 100ms
    }

    results = {
        "parsing": statistics.mean(parse_times),
        "formatting": statistics.mean(format_times),
        "calculation": statistics.mean(calc_times)
    }

    print("\nPerformance Summary:")
    for metric, time_ms in results.items():
        target = targets[metric]
        status = "✅" if time_ms <= target else "⚠️"
        print(f"{status} {metric}: {time_ms:.2f}ms (target: {target}ms)")

if __name__ == "__main__":
    benchmark_eta_system()
```

## Backup and Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup-eta-data.sh

backup_dir="$HOME/.flowforge-backups/$(date +%Y%m%d)"
mkdir -p "$backup_dir"

# Backup time tracking data
if [ -f ".flowforge/billing/time-tracking.json" ]; then
    cp ".flowforge/billing/time-tracking.json" "$backup_dir/"
    echo "✅ Backed up time tracking data"
fi

# Backup velocity history
if [ -f ".flowforge/billing/velocity-history.json" ]; then
    cp ".flowforge/billing/velocity-history.json" "$backup_dir/"
    echo "✅ Backed up velocity history"
fi

# Backup cache files
if [ -d "$HOME/.cache/flowforge" ]; then
    cp -r "$HOME/.cache/flowforge" "$backup_dir/cache/"
    echo "✅ Backed up cache files"
fi

echo "📦 Backup completed: $backup_dir"
```

### Recovery Procedures

```bash
#!/bin/bash
# restore-eta-data.sh

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_date>"
    echo "Available backups:"
    ls -1 "$HOME/.flowforge-backups/" 2>/dev/null || echo "No backups found"
    exit 1
fi

backup_dir="$HOME/.flowforge-backups/$1"

if [ ! -d "$backup_dir" ]; then
    echo "❌ Backup not found: $backup_dir"
    exit 1
fi

# Restore time tracking data
if [ -f "$backup_dir/time-tracking.json" ]; then
    mkdir -p ".flowforge/billing"
    cp "$backup_dir/time-tracking.json" ".flowforge/billing/"
    echo "✅ Restored time tracking data"
fi

# Restore velocity history
if [ -f "$backup_dir/velocity-history.json" ]; then
    cp "$backup_dir/velocity-history.json" ".flowforge/billing/"
    echo "✅ Restored velocity history"
fi

# Restore cache files
if [ -d "$backup_dir/cache" ]; then
    mkdir -p "$HOME/.cache"
    cp -r "$backup_dir/cache" "$HOME/.cache/flowforge"
    echo "✅ Restored cache files"
fi

echo "🔄 Recovery completed from: $backup_dir"
```

## Next Steps

After completing the setup:

1. **Add estimates to issues**: Update your GitHub issues with time estimates
2. **Start time tracking**: Use FlowForge session commands to track time
3. **Monitor statusline**: Verify dual ETA display is working
4. **Build velocity history**: Complete a few issues to establish velocity baseline
5. **Configure team settings**: Adjust team size and default velocity as needed

### Getting Started Checklist

- [ ] ETA system installed and tested
- [ ] Required directories and files created
- [ ] GitHub issues have time estimates
- [ ] Statusline shows dual ETA information
- [ ] Time tracking is active
- [ ] Cache directory is writable
- [ ] Backup strategy implemented
- [ ] Team velocity configuration reviewed

---

**Version:** FlowForge 2.0
**Guide Type:** Setup and Configuration
**Author:** FlowForge Documentation Team
**Last Updated:** 2024-09-15