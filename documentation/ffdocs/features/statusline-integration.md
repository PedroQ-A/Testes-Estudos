# FlowForge Statusline Integration

## Overview

The FlowForge Statusline Integration provides real-time project status information directly in your shell prompt, enabling developers to see critical project information at a glance without interrupting their workflow.

## Table of Contents

1. [Architecture](#architecture)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Features](#features)
5. [Shell Integration](#shell-integration)
6. [Error Scenarios](#error-scenarios)
7. [Troubleshooting](#troubleshooting)
8. [Performance](#performance)
9. [Customization](#customization)
10. [API Reference](#api-reference)

> **📚 Related Documentation:**
> For template-based installation and update procedures, see [StatusLine Templates Guide](./statusline-templates.md)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                   Shell Integration Layer                   │
├─────────────────────────────────────────────────────────────┤
│  Bash/Zsh/Fish → Statusline Script → Cache System → Output │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Shell Prompt     │───▶│  statusline Script  │───▶│    Cache System     │
│   (PS1/PROMPT)     │    │   (Python3/Bash)   │    │  (.statusline-cache)│
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │   Project Status    │
                           │ • Git Branch        │
                           │ • Active Session    │
                           │ • Time Tracking     │
                           │ • Issue Context     │
                           └─────────────────────┘
```

### Core Files

```
.flowforge/
├── bin/
│   └── statusline              # Main statusline executable
├── .statusline-cache/          # Cache directory
├── .statusline-cache.json      # Cache data
└── config/
    └── statusline.json         # Configuration settings
```

## Installation

### Automatic Installation

The statusline is automatically installed by the FlowForge Installation Wizard:

```bash
# During FlowForge installation
./run_ff_command.sh flowforge:project:setup
```

### Manual Installation

If you need to install or reinstall the statusline manually:

```bash
# 1. Ensure .flowforge directory structure exists
mkdir -p .flowforge/bin .flowforge/.statusline-cache

# 2. Copy statusline script
cp path/to/flowforge/bin/statusline .flowforge/bin/statusline
chmod +x .flowforge/bin/statusline

# 3. Initialize cache
echo '{}' > .flowforge/.statusline-cache.json

# 4. Test installation
./.flowforge/bin/statusline
```

### Fallback Installation

If the main statusline script is unavailable, a fallback version is automatically created:

```python
#!/usr/bin/env python3
# FlowForge Statusline - Fallback version
import json
import sys
import os
from datetime import datetime

def main():
    try:
        import subprocess
        result = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            capture_output=True,
            text=True,
            cwd=os.getcwd()
        )
        branch = result.stdout.strip() if result.returncode == 0 else 'main'
    except:
        branch = 'main'

    output = {
        'branch': branch,
        'time': datetime.now().strftime('%H:%M'),
        'version': 'fallback'
    }

    print(json.dumps(output))

if __name__ == '__main__':
    main()
```

## Configuration

### Basic Configuration

Create `.flowforge/config/statusline.json`:

```json
{
  "enabled": true,
  "cache_ttl": 300,
  "modules": {
    "git": {
      "enabled": true,
      "show_branch": true,
      "show_status": true,
      "show_ahead_behind": false
    },
    "session": {
      "enabled": true,
      "show_timer": true,
      "show_issue": true
    },
    "project": {
      "enabled": true,
      "show_name": true,
      "show_version": false
    },
    "time": {
      "enabled": true,
      "format": "%H:%M"
    }
  },
  "formatting": {
    "separator": " │ ",
    "colors": {
      "branch": "blue",
      "timer": "green",
      "issue": "yellow",
      "project": "cyan"
    },
    "icons": {
      "git": "🌿",
      "timer": "⏱️",
      "issue": "🎯",
      "project": "📦"
    }
  },
  "performance": {
    "timeout": 2,
    "max_cache_size": 100,
    "cleanup_interval": 3600
  }
}
```

### Advanced Configuration

For power users, additional configuration options:

```json
{
  "hooks": {
    "pre_render": "/path/to/custom/pre-hook.sh",
    "post_render": "/path/to/custom/post-hook.sh"
  },
  "integrations": {
    "jira": {
      "enabled": false,
      "api_url": "https://yourcompany.atlassian.net",
      "cache_ttl": 600
    },
    "slack": {
      "enabled": false,
      "webhook_url": "https://hooks.slack.com/...",
      "status_updates": true
    }
  },
  "themes": {
    "current": "default",
    "custom_themes": {
      "minimal": {
        "show_icons": false,
        "separator": " | ",
        "colors": false
      },
      "verbose": {
        "show_icons": true,
        "show_all_info": true,
        "multiline": false
      }
    }
  }
}
```

## Features

### 1. Git Integration

**Branch Display**: Shows current git branch with status indicators
```bash
🌿 feature/statusline-integration │ ⚡ 2 ahead
```

**Status Indicators**:
- `⚡ N ahead`: Commits ahead of remote
- `⬇ N behind`: Commits behind remote
- `✗ N`: Uncommitted changes
- `+N`: Staged changes
- `?N`: Untracked files

### 2. Session Management

**Active Session Display**: Shows running FlowForge session information
```bash
⏱️ 02:45:30 │ 🎯 #123-feature-work
```

**Session Information**:
- Timer: Current session duration
- Issue: Associated GitHub issue number
- Status: Session state (active, paused, completed)

### 3. Project Context

**Project Information**: Displays project metadata
```bash
📦 my-app v2.1.0 │ FlowForge ✨
```

**Project Details**:
- Name: Project name from package.json
- Version: Current project version
- FlowForge Status: Integration status

### 4. Performance Monitoring

**Execution Time**: Tracks statusline performance
- Cache hit/miss ratios
- Execution duration
- Memory usage
- Error rates

## Shell Integration

### Bash Integration

Add to your `.bashrc` or `.bash_profile`:

```bash
# FlowForge Statusline Integration
function flowforge_statusline() {
    local statusline_path="./.flowforge/bin/statusline"

    # Check if we're in a FlowForge project
    if [[ -x "$statusline_path" ]]; then
        local status_output
        # Run with timeout to prevent hanging
        if status_output=$(timeout 2s "$statusline_path" 2>/dev/null); then
            echo "$status_output"
        else
            echo "⚠️ statusline timeout"
        fi
    fi
}

# Enhanced PS1 with FlowForge statusline
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]$(flowforge_statusline)\$ '
```

### Zsh Integration

Add to your `.zshrc`:

```zsh
# FlowForge Statusline Integration
function flowforge_statusline() {
    local statusline_path="./.flowforge/bin/statusline"

    if [[ -x "$statusline_path" ]]; then
        local status_output
        if status_output=$("$statusline_path" 2>/dev/null); then
            echo " $status_output"
        fi
    fi
}

# Enhanced PROMPT with FlowForge statusline
PROMPT='%F{green}%n@%m%f:%F{blue}%~%f$(flowforge_statusline)%# '
```

### Fish Shell Integration

Add to your `config.fish`:

```fish
# FlowForge Statusline Integration
function flowforge_statusline
    set statusline_path "./.flowforge/bin/statusline"

    if test -x "$statusline_path"
        set status_output (eval "$statusline_path" 2>/dev/null)
        if test $status status -eq 0
            echo " $status_output"
        end
    end
end

# Enhanced prompt with FlowForge statusline
function fish_prompt
    echo (set_color green)(whoami)(set_color normal)'@'(set_color green)(hostname)(set_color normal)':'(set_color blue)(pwd)(set_color normal)(flowforge_statusline)'$ '
end
```

### Oh My Zsh Theme Integration

Create a custom theme in `~/.oh-my-zsh/custom/themes/flowforge.zsh-theme`:

```zsh
# FlowForge Oh My Zsh Theme
local flowforge_info='$(flowforge_statusline)'

PROMPT="%{$fg[green]%}%n@%m%{$reset_color%}:%{$fg[blue]%}%~%{$reset_color%}${flowforge_info}%# "

function flowforge_statusline() {
    if [[ -x "./.flowforge/bin/statusline" ]]; then
        local output=$(./.flowforge/bin/statusline 2>/dev/null)
        if [[ $? -eq 0 && -n "$output" ]]; then
            echo " %{$fg[cyan]%}[$output]%{$reset_color%}"
        fi
    fi
}
```

## Error Scenarios

### 1. Permission Errors

**Scenario**: Statusline script lacks execute permissions
```bash
Error: Permission denied: ./.flowforge/bin/statusline
```

**Solution**:
```bash
chmod +x ./.flowforge/bin/statusline
```

**Prevention**: Installation wizard automatically sets correct permissions

### 2. Missing Dependencies

**Scenario**: Python3 not available for fallback script
```bash
Error: /usr/bin/env: 'python3': No such file or directory
```

**Solutions**:
```bash
# Option 1: Install Python3
sudo apt-get install python3  # Ubuntu/Debian
brew install python3          # macOS

# Option 2: Create bash fallback
cat > ./.flowforge/bin/statusline << 'EOF'
#!/bin/bash
# Bash fallback statusline
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
time=$(date +%H:%M)
echo "{\"branch\":\"$branch\",\"time\":\"$time\",\"version\":\"bash-fallback\"}"
EOF
chmod +x ./.flowforge/bin/statusline
```

### 3. Cache Corruption

**Scenario**: Statusline cache becomes corrupted
```bash
Error: JSON decode error in cache file
```

**Solution**:
```bash
# Reset cache
echo '{}' > ./.flowforge/.statusline-cache.json

# Or remove cache entirely (will be recreated)
rm -f ./.flowforge/.statusline-cache.json
```

### 4. Git Repository Issues

**Scenario**: Not in a git repository
```bash
Error: Not a git repository
```

**Handling**: Statusline gracefully handles non-git directories by:
- Showing "no-git" instead of branch name
- Disabling git-specific features
- Continuing to show other project information

### 5. Network Timeouts

**Scenario**: Remote git operations timeout
```bash
Warning: git fetch timeout, using cached data
```

**Mitigation**: Statusline implements intelligent fallbacks:
- Uses cached remote status when network is slow
- Degrades gracefully to local-only information
- Provides timeout warnings without failing

## Troubleshooting

### Debug Mode

Enable detailed debugging:

```bash
# Set debug environment variable
export FLOWFORGE_STATUSLINE_DEBUG=1

# Run statusline manually to see debug output
./.flowforge/bin/statusline
```

Debug output includes:
- Cache hit/miss information
- Execution timing
- Git command output
- Error stack traces
- Configuration loading status

### Common Issues and Solutions

#### Issue: Statusline not appearing in prompt

**Diagnosis**:
```bash
# Check if statusline is executable
ls -la ./.flowforge/bin/statusline

# Test statusline directly
./.flowforge/bin/statusline

# Check shell integration
echo $PS1  # Bash
echo $PROMPT  # Zsh
```

**Solutions**:
1. Verify shell integration is properly added
2. Check for syntax errors in shell config
3. Ensure statusline script has correct permissions
4. Test in new shell session

#### Issue: Slow prompt response

**Diagnosis**:
```bash
# Time the statusline execution
time ./.flowforge/bin/statusline

# Check cache status
cat ./.flowforge/.statusline-cache.json | jq .
```

**Solutions**:
1. Adjust cache TTL in configuration
2. Disable expensive features (remote git status)
3. Clean up cache files
4. Check for network issues affecting git operations

#### Issue: Incorrect project information

**Diagnosis**:
```bash
# Verify FlowForge installation
ls -la ./.flowforge/

# Check configuration
cat ./.flowforge/config/settings.json

# Verify git repository status
git status
```

**Solutions**:
1. Reinitialize FlowForge project
2. Check git repository integrity
3. Verify project configuration files
4. Clear and rebuild cache

### Log Analysis

Statusline maintains logs in `.flowforge/logs/statusline.log`:

```bash
# View recent statusline activity
tail -f ./.flowforge/logs/statusline.log

# Search for errors
grep -i error ./.flowforge/logs/statusline.log

# Analyze performance
grep -i "execution_time" ./.flowforge/logs/statusline.log
```

Log levels:
- `DEBUG`: Detailed execution information
- `INFO`: Normal operation events
- `WARN`: Non-critical issues
- `ERROR`: Critical failures requiring attention

## Performance

### Benchmarking

Statusline performance targets:
- **Execution Time**: < 100ms (typical), < 500ms (maximum)
- **Memory Usage**: < 10MB RSS
- **Cache Hit Ratio**: > 80% in normal usage
- **Error Rate**: < 1% of executions

### Performance Monitoring

Built-in performance tracking:

```json
{
  "performance_metrics": {
    "last_execution_time": 45.2,
    "average_execution_time": 52.1,
    "cache_hit_ratio": 0.87,
    "total_executions": 1247,
    "error_count": 3,
    "last_error": "2024-01-15T14:30:22Z"
  }
}
```

### Optimization Techniques

1. **Intelligent Caching**:
   - Git information cached for 5 minutes
   - Project metadata cached until changes
   - Network operations cached longer

2. **Lazy Loading**:
   - Only fetch information that's displayed
   - Skip expensive operations when not needed

3. **Background Updates**:
   - Cache warming in background processes
   - Asynchronous remote git updates

4. **Graceful Degradation**:
   - Timeout protection for all operations
   - Fallback to cached data when operations fail
   - Progressive feature disabling under load

### Cache Management

```bash
# Cache statistics
jq '.performance_metrics' ./.flowforge/.statusline-cache.json

# Clear cache
rm ./.flowforge/.statusline-cache.json

# Warm cache manually
./.flowforge/bin/statusline --warm-cache

# Cache size monitoring
du -sh ./.flowforge/.statusline-cache/
```

## Customization

### Custom Formatters

Create custom status formatters:

```python
# .flowforge/formatters/custom_git.py
def format_git_status(branch_info):
    """Custom git status formatter"""
    if branch_info['ahead'] > 0:
        return f"🚀 {branch_info['branch']} +{branch_info['ahead']}"
    return f"📍 {branch_info['branch']}"
```

Register in configuration:
```json
{
  "formatters": {
    "git_status": ".flowforge/formatters/custom_git.py:format_git_status"
  }
}
```

### Custom Modules

Create custom information modules:

```python
# .flowforge/modules/docker_status.py
def get_docker_status():
    """Get Docker container status for current project"""
    import subprocess
    try:
        result = subprocess.run(['docker-compose', 'ps', '--services', '--filter', 'status=running'],
                              capture_output=True, text=True, timeout=1)
        if result.returncode == 0:
            services = result.stdout.strip().split('\n')
            return {'docker_services': len([s for s in services if s])}
    except:
        pass
    return {'docker_services': 0}
```

Register in configuration:
```json
{
  "modules": {
    "docker": {
      "enabled": true,
      "module_path": ".flowforge/modules/docker_status.py",
      "function": "get_docker_status",
      "cache_ttl": 30
    }
  }
}
```

### Theme Customization

Create custom themes:

```json
{
  "themes": {
    "my_theme": {
      "name": "My Custom Theme",
      "colors": {
        "branch": "#00ff00",
        "timer": "#ff9900",
        "issue": "#0099ff",
        "project": "#ff00ff"
      },
      "icons": {
        "git": "⛔",
        "timer": "🕐",
        "issue": "📋",
        "project": "💼"
      },
      "format_template": "{git_icon} {branch} {separator} {timer_icon} {timer} {separator} {issue_icon} {issue}",
      "separator": " • ",
      "brackets": ["[", "]"],
      "show_empty": false
    }
  }
}
```

Apply theme:
```bash
# Set theme in configuration
jq '.themes.current = "my_theme"' .flowforge/config/statusline.json

# Or set via environment
export FLOWFORGE_STATUSLINE_THEME=my_theme
```

## API Reference

### Command Line Interface

```bash
# Basic usage
./.flowforge/bin/statusline

# Options
./.flowforge/bin/statusline --help
./.flowforge/bin/statusline --version
./.flowforge/bin/statusline --config-file custom.json
./.flowforge/bin/statusline --output-format json
./.flowforge/bin/statusline --output-format text
./.flowforge/bin/statusline --debug
./.flowforge/bin/statusline --warm-cache
./.flowforge/bin/statusline --clear-cache
```

### JSON Output Format

Default JSON structure:
```json
{
  "git": {
    "branch": "feature/statusline-integration",
    "status": {
      "ahead": 2,
      "behind": 0,
      "modified": 3,
      "staged": 1,
      "untracked": 0
    },
    "remote": "origin/main"
  },
  "session": {
    "active": true,
    "duration": "02:45:30",
    "issue": "#123",
    "status": "working"
  },
  "project": {
    "name": "flowforge",
    "version": "2.0.0",
    "flowforge_enabled": true
  },
  "timestamp": "2024-01-15T14:30:22Z",
  "performance": {
    "execution_time": 45.2,
    "cache_used": true
  }
}
```

### Environment Variables

```bash
# Configuration
export FLOWFORGE_STATUSLINE_CONFIG=".flowforge/config/custom-statusline.json"
export FLOWFORGE_STATUSLINE_CACHE_DIR=".flowforge/cache/statusline"
export FLOWFORGE_STATUSLINE_THEME="minimal"

# Behavior
export FLOWFORGE_STATUSLINE_TIMEOUT="5"
export FLOWFORGE_STATUSLINE_DEBUG="1"
export FLOWFORGE_STATUSLINE_DISABLED="0"

# Performance
export FLOWFORGE_STATUSLINE_CACHE_TTL="300"
export FLOWFORGE_STATUSLINE_MAX_CACHE_SIZE="100"
```

### Integration Hooks

**Pre-render hook**: Called before generating status
```bash
#!/bin/bash
# .flowforge/hooks/pre-statusline.sh
echo "Preparing statusline data..."
# Custom preparation logic
```

**Post-render hook**: Called after generating status
```bash
#!/bin/bash
# .flowforge/hooks/post-statusline.sh
# Receives statusline output as $1
echo "Statusline generated: $1"
# Custom post-processing logic
```

## Migration Guide

### From Legacy Systems

If migrating from other statusline systems:

1. **From Powerline**:
   ```bash
   # Backup existing configuration
   cp ~/.config/powerline/config.json ~/.config/powerline/config.json.backup

   # Install FlowForge statusline
   ./run_ff_command.sh flowforge:project:setup

   # Update shell configuration
   # Replace powerline references with FlowForge statusline
   ```

2. **From Starship**:
   ```bash
   # Backup starship config
   cp ~/.config/starship.toml ~/.config/starship.toml.backup

   # Install FlowForge statusline
   ./run_ff_command.sh flowforge:project:setup

   # Update shell prompt configuration
   ```

3. **From Custom Prompts**:
   - Identify current prompt functionality
   - Map features to FlowForge statusline modules
   - Create custom formatters for unique features
   - Test thoroughly before removing old system

### Version Upgrades

When upgrading FlowForge statusline:

1. **Backup Configuration**:
   ```bash
   cp -r .flowforge/config .flowforge/config.backup
   ```

2. **Clear Cache**:
   ```bash
   rm -rf .flowforge/.statusline-cache*
   ```

3. **Update Scripts**:
   ```bash
   ./run_ff_command.sh flowforge:update
   ```

4. **Verify Configuration**:
   ```bash
   ./.flowforge/bin/statusline --config-check
   ```

## Security Considerations

### Data Privacy

The statusline system is designed with privacy in mind:

- **Local Only**: All data processing happens locally
- **No Network Transmission**: No project data sent to external services
- **Secure Caching**: Cache files have restricted permissions (600)
- **Sanitized Output**: Sensitive information is filtered from display

### File Permissions

Proper file permissions are critical:

```bash
# Statusline executable
chmod 755 .flowforge/bin/statusline

# Cache files (user only)
chmod 600 .flowforge/.statusline-cache.json
chmod 700 .flowforge/.statusline-cache/

# Configuration files
chmod 644 .flowforge/config/statusline.json
```

### Input Validation

All inputs are validated to prevent:
- Command injection
- Path traversal
- Buffer overflows
- JSON injection

## Best Practices

### Performance Best Practices

1. **Keep Cache TTL Reasonable**: Don't set too low (causes frequent updates) or too high (stale data)
2. **Monitor Execution Time**: Use debug mode to identify slow operations
3. **Limit Network Operations**: Disable remote git status if network is unreliable
4. **Clean Up Regularly**: Remove old cache files and logs

### Configuration Best Practices

1. **Start Simple**: Begin with default configuration and customize gradually
2. **Test Changes**: Always test configuration changes in a separate session
3. **Backup Configuration**: Keep backups of working configurations
4. **Document Customizations**: Comment your configuration changes

### Integration Best Practices

1. **Test Shell Integration**: Verify prompt works across different terminals
2. **Handle Errors Gracefully**: Don't let statusline errors break your prompt
3. **Use Timeouts**: Always timeout statusline calls in shell functions
4. **Provide Fallbacks**: Have a simple fallback when statusline fails

---

## Support and Contributing

### Getting Help

1. **Check Logs**: Review `.flowforge/logs/statusline.log`
2. **Debug Mode**: Run with `FLOWFORGE_STATUSLINE_DEBUG=1`
3. **Test Manually**: Execute statusline script directly
4. **Community Support**: FlowForge Discord/GitHub discussions

### Contributing

Contributions to statusline functionality:

1. **Bug Reports**: Include debug output and configuration
2. **Feature Requests**: Provide use cases and expected behavior
3. **Pull Requests**: Follow FlowForge development guidelines
4. **Documentation**: Help improve this documentation

### Development

For statusline development:

```bash
# Clone FlowForge repository
git clone https://github.com/FlowForge/FlowForge.git

# Navigate to statusline development area
cd FlowForge/.flowforge/bin/

# Make changes and test
./statusline --debug
```

---

*This documentation follows FlowForge Rule #26 (Function Documentation) and Rule #27 (Documentation Updates). Last updated: 2024-01-15*