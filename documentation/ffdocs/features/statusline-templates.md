# FlowForge Statusline Templates

## Overview

The FlowForge Statusline Templates provide a streamlined way to integrate the enhanced statusline functionality into any FlowForge project. These templates automatically install the complete statusline system with optimized performance, intelligent caching, and seamless shell integration.

## Features

- **Automatic Installation**: Templates deployed during FlowForge project setup
- **Dynamic Path Resolution**: Finds FlowForge installation regardless of setup method
- **Performance Optimized**: Sub-100ms execution with intelligent caching
- **Shell Integration**: Works with Bash, Zsh, Fish, and popular frameworks
- **Update Mechanism**: Easy updates with backup and rollback capabilities

## Installation Process

### Automatic Installation (Recommended)

The statusline templates are automatically installed during FlowForge project setup:

```bash
# Standard FlowForge setup includes statusline
./scripts/install-flowforge.sh

# Or via FlowForge commands
./run_ff_command.sh flowforge:project:setup
```

**Installation Process:**
1. **Template Detection**: Installer identifies available statusline templates
2. **Dynamic Resolution**: Finds FlowForge root using multiple detection methods
3. **File Deployment**: Copies statusline files to project `.flowforge/bin/`
4. **Permission Setup**: Sets proper executable permissions
5. **Cache Initialization**: Creates cache directory and initial cache file

### Manual Installation

If you need to install statusline templates manually:

```bash
# 1. Ensure FlowForge is installed
npm list @justcode-cruzalex/flowforge

# 2. Run the statusline updater
./scripts/update-statusline.sh

# 3. Verify installation
./.flowforge/bin/statusline --version
```

## File Structure

The statusline templates install the following structure:

```
.flowforge/
├── bin/
│   ├── statusline                    # Main statusline executable
│   ├── statusline_optimized.py       # Performance-optimized version
│   └── core/                         # Core module directory
│       ├── statusline.py             # Main statusline module
│       ├── statusline_cache.py       # Caching system
│       ├── statusline_data_loader.py # Data loading utilities
│       ├── statusline_helpers.py     # Helper functions
│       └── statusline.sh             # Shell script version
├── .statusline-cache/                # Cache directory
├── .statusline-cache.json            # Cache data file
└── config/
    └── statusline.json               # Configuration settings (optional)
```

### Core Files Description

**Primary Executables:**
- `statusline`: Main executable with intelligent fallback system
- `statusline_optimized.py`: Performance-optimized Python implementation

**Core Modules (Rule #24 Compliance):**
- `statusline.py`: Main module (<700 lines, refactored for performance)
- `statusline_cache.py`: Intelligent caching with TTL and size management
- `statusline_data_loader.py`: Asynchronous data loading and GitHub integration
- `statusline_helpers.py`: Utility functions and formatters
- `statusline.sh`: Bash fallback for minimal environments

**Supporting Files:**
- `.statusline-cache.json`: JSON cache with performance metrics
- `statusline.json`: Optional configuration overrides

## Configuration Options

### Basic Configuration

Create `.flowforge/config/statusline.json` for custom settings:

```json
{
  "enabled": true,
  "display_format": "compact",
  "modules": {
    "git": {
      "enabled": true,
      "show_branch": true,
      "show_status": true,
      "fetch_remote": false
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
    }
  },
  "performance": {
    "cache_ttl": 300,
    "timeout": 2,
    "enable_background_fetch": true
  },
  "formatting": {
    "separator": " │ ",
    "use_colors": true,
    "use_icons": true,
    "theme": "default"
  }
}
```

### Environment Variables

Control behavior without config files:

```bash
# Core settings
export FLOWFORGE_STATUSLINE_ENABLED=1
export FLOWFORGE_STATUSLINE_THEME="minimal"
export FLOWFORGE_STATUSLINE_CACHE_TTL=300

# Performance tuning
export FLOWFORGE_STATUSLINE_TIMEOUT=5
export FLOWFORGE_STATUSLINE_DEBUG=0

# Module toggles
export FLOWFORGE_STATUSLINE_GIT_ENABLED=1
export FLOWFORGE_STATUSLINE_SESSION_ENABLED=1
export FLOWFORGE_STATUSLINE_PROJECT_ENABLED=1
```

## Update Mechanism Usage

### Automatic Updates

FlowForge automatically updates statusline templates during framework updates:

```bash
# Framework update includes statusline templates
./run_ff_command.sh flowforge:update
```

### Manual Updates

Use the dedicated update script for statusline-only updates:

```bash
# Update statusline from latest templates
./scripts/update-statusline.sh
```

**Update Process:**
1. **Dynamic Discovery**: Finds FlowForge installation location
2. **Backup Creation**: Backs up existing files with timestamps
3. **Template Deployment**: Copies latest template files
4. **Permission Reset**: Ensures proper executable permissions
5. **Cache Preservation**: Maintains existing cache and configuration
6. **Verification**: Confirms installation success

### Update Features

**Intelligent Backup System:**
```bash
# Automatic backups during updates
.flowforge/bin/statusline.backup.20240913_143522
.flowforge/bin/statusline_optimized.py.backup.20240913_143522
```

**Dynamic Path Resolution:**
- Detects FlowForge root from package.json
- Searches parent directories for FlowForge installation
- Checks node_modules for local installations
- Falls back to global npm installations
- Graceful error handling when templates not found

**Rollback Capability:**
```bash
# Restore from backup if needed
cp .flowforge/bin/statusline.backup.20240913_143522 .flowforge/bin/statusline
chmod +x .flowforge/bin/statusline
```

## Shell Integration

### Bash Integration

Add to `.bashrc`:

```bash
# FlowForge Statusline Integration
function flowforge_prompt() {
    local statusline_path="./.flowforge/bin/statusline"
    if [[ -x "$statusline_path" ]]; then
        local output
        if output=$(timeout 2s "$statusline_path" 2>/dev/null); then
            echo " [$output]"
        fi
    fi
}

# Add to PS1
PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w$(flowforge_prompt)\$ '
```

### Zsh Integration

Add to `.zshrc`:

```zsh
# FlowForge Statusline Integration
function flowforge_prompt() {
    local statusline_path="./.flowforge/bin/statusline"
    if [[ -x "$statusline_path" ]]; then
        local output
        if output=$("$statusline_path" 2>/dev/null); then
            echo " [$output]"
        fi
    fi
}

# Add to PROMPT
PROMPT='%n@%m:%~$(flowforge_prompt)%# '
```

### Oh My Zsh Integration

Create custom theme in `~/.oh-my-zsh/custom/themes/flowforge.zsh-theme`:

```zsh
# FlowForge Enhanced Theme
local flowforge_info='$(flowforge_statusline_info)'

PROMPT="%{$fg[green]%}%n@%m%{$reset_color%}:%{$fg[blue]%}%~%{$reset_color%}${flowforge_info}%# "

function flowforge_statusline_info() {
    if [[ -x "./.flowforge/bin/statusline" ]]; then
        local output=$(./.flowforge/bin/statusline 2>/dev/null)
        if [[ $? -eq 0 && -n "$output" ]]; then
            echo " %{$fg[cyan]%}[$output]%{$reset_color%}"
        fi
    fi
}
```

## Performance Optimization

### Caching Strategy

The template system implements multi-layer caching:

**Level 1 - Memory Cache:**
- Function result memoization
- Git command output caching
- Configuration data caching

**Level 2 - File Cache:**
- JSON cache with TTL timestamps
- Structured cache organization
- Automatic cleanup of expired entries

**Level 3 - Background Processing:**
- Asynchronous GitHub data fetching
- Pre-warming of frequently accessed data
- Intelligent cache invalidation

### Performance Metrics

**Expected Performance:**
- Cold start: <200ms
- Warm cache: <50ms
- Memory usage: <10MB RSS
- Cache hit ratio: >85%

**Monitoring:**
```bash
# Check performance metrics
jq '.performance_metrics' ./.flowforge/.statusline-cache.json

# Example output:
{
  "last_execution_time": 45.2,
  "average_execution_time": 52.1,
  "cache_hit_ratio": 0.87,
  "total_executions": 1247
}
```

## Performance & Caching

The statusline uses intelligent caching to achieve sub-25ms response times while fetching data from external sources like GitHub.

### How Caching Works

1. **Cache-First Approach**: Statusline checks the cache file first (`.flowforge/.statusline-cache.json`)
2. **Instant Response**: If cache exists and is fresh (< 60 seconds old), data loads in <25ms
3. **Background Refresh**: When cache expires, statusline uses stale data and triggers background refresh
4. **First Run**: Initial execution may take ~500ms to fetch GitHub data, then caches for subsequent runs

### Performance Metrics

- **Before Caching**: 500-1000ms (waiting for GitHub API)
- **After Caching**: <25ms (95% faster!)
- **Cache TTL**: 60 seconds
- **Cache Location**: `.flowforge/.statusline-cache.json`

### Cache Management

**View Cache Contents:**
```bash
cat .flowforge/.statusline-cache.json | python3 -m json.tool
```

**Force Cache Refresh:**
```bash
rm .flowforge/.statusline-cache.json
.flowforge/bin/statusline  # Will rebuild cache
```

## Troubleshooting

### Common Issues

#### Issue: Statusline Not Showing GitHub Data
```bash
# Symptom: Statusline shows placeholder text or no milestone data
[FlowForge] @justcode-cruzalex/flowforge | Branch: main | Model
```

**Cause**: GitHub API timeout (was 1-40ms, needs 500ms+)

**Solution**:
1. Update to latest statusline (includes timeout fix)
2. Clear and rebuild cache:
```bash
rm .flowforge/.statusline-cache.json
.flowforge/bin/statusline  # First run ~500ms, then <25ms
```
3. Verify cache is working:
```bash
ls -la .flowforge/.statusline-cache.json
time .flowforge/bin/statusline  # Should be <0.025s
```

#### Issue: Templates Not Found During Installation
```bash
Error: Statusline templates not found in FlowForge installation
```

**Solution:**
```bash
# Verify FlowForge installation
npm list @justcode-cruzalex/flowforge

# Check template directory exists
ls -la node_modules/@justcode-cruzalex/flowforge/templates/statusline/

# Reinstall if missing
npm reinstall @justcode-cruzalex/flowforge
```

#### Issue: Permission Denied
```bash
Error: Permission denied: ./.flowforge/bin/statusline
```

**Solution:**
```bash
# Fix permissions
chmod +x ./.flowforge/bin/statusline
chmod +x ./.flowforge/bin/statusline_optimized.py

# Verify permissions
ls -la ./.flowforge/bin/statusline*
```

#### Issue: Cache Corruption
```bash
Error: JSON decode error in cache file
```

**Solution:**
```bash
# Reset cache
echo '{}' > ./.flowforge/.statusline-cache.json

# Or remove and recreate
rm ./.flowforge/.statusline-cache.json
mkdir -p ./.flowforge/.statusline-cache
./.flowforge/bin/statusline  # Will recreate cache
```

#### Issue: Slow Performance
```bash
# Enable debug mode
export FLOWFORGE_STATUSLINE_DEBUG=1
./.flowforge/bin/statusline

# Check execution time
time ./.flowforge/bin/statusline

# Solutions:
# 1. Increase cache TTL
export FLOWFORGE_STATUSLINE_CACHE_TTL=600

# 2. Disable expensive features
export FLOWFORGE_STATUSLINE_GIT_REMOTE=0

# 3. Clean cache
rm ./.flowforge/.statusline-cache.json
```

### Debug Mode

Enable comprehensive debugging:

```bash
# Set debug environment
export FLOWFORGE_STATUSLINE_DEBUG=1

# Run statusline with debug output
./.flowforge/bin/statusline

# Debug output includes:
# - Cache hit/miss information
# - Execution timing breakdown
# - Git command output
# - Error stack traces
# - Configuration loading status
```

### Log Analysis

Check statusline logs:

```bash
# View recent activity
tail -f ./.flowforge/logs/statusline.log

# Search for errors
grep -i error ./.flowforge/logs/statusline.log

# Analyze performance
grep "execution_time" ./.flowforge/logs/statusline.log | tail -10
```

## Advanced Usage

### Custom Formatters

Create custom status formatters:

```python
# .flowforge/formatters/custom.py
def format_project_status(project_info):
    """Custom project status formatter"""
    if project_info.get('has_tests', False):
        return f"🧪 {project_info['name']} (tested)"
    return f"📦 {project_info['name']}"

def format_git_branch(branch_info):
    """Custom git branch formatter"""
    branch = branch_info['name']
    if branch.startswith('feature/'):
        return f"✨ {branch[8:]}"  # Remove 'feature/' prefix
    elif branch.startswith('fix/'):
        return f"🔧 {branch[4:]}"   # Remove 'fix/' prefix
    return f"🌿 {branch}"
```

Register in configuration:
```json
{
  "formatters": {
    "project_status": ".flowforge/formatters/custom.py:format_project_status",
    "git_branch": ".flowforge/formatters/custom.py:format_git_branch"
  }
}
```

### Integration Hooks

**Pre-render hook:**
```bash
#!/bin/bash
# .flowforge/hooks/pre-statusline.sh
# Custom preparation before statusline generation
if [ -f "./package.json" ]; then
    export FLOWFORGE_PROJECT_TYPE="node"
fi
```

**Post-render hook:**
```bash
#!/bin/bash
# .flowforge/hooks/post-statusline.sh
# Custom processing after statusline generation
echo "Statusline updated: $1" >> ./.flowforge/logs/statusline-activity.log
```

### Theme System

Create custom themes:

```json
{
  "themes": {
    "developer": {
      "icons": {
        "git": "🔀",
        "timer": "⏰",
        "issue": "🎫",
        "project": "💻"
      },
      "colors": {
        "branch": "#00ff00",
        "timer": "#ffaa00",
        "issue": "#0088ff"
      },
      "format": "{git} {timer} {issue}",
      "separator": " • "
    }
  }
}
```

## Migration from Legacy Systems

### From Basic Prompts

Replace basic git prompts with FlowForge statusline:

```bash
# Old basic prompt
PS1='[\u@\h \W$(__git_ps1 " (%s)")]\$ '

# New FlowForge enhanced prompt
PS1='\u@\h:\w$(flowforge_prompt)\$ '
```

### From Powerline/Starship

Migration strategy:
1. Backup existing configuration
2. Install FlowForge statusline templates
3. Test new prompt in separate shell session
4. Gradually migrate custom features
5. Remove old system once verified

## Security Considerations

### File Permissions

Templates automatically set secure permissions:

```bash
# Executable files (755)
-rwxr-xr-x .flowforge/bin/statusline
-rwxr-xr-x .flowforge/bin/statusline_optimized.py

# Cache files (644)
-rw-r--r-- .flowforge/.statusline-cache.json

# Cache directory (755)
drwxr-xr-x .flowforge/.statusline-cache/
```

### Data Privacy

- **Local Processing**: All data processing happens locally
- **No Network Calls**: Templates don't make external requests by default
- **Sanitized Output**: Sensitive information filtered from display
- **Secure Caching**: Cache files have restricted access

## Best Practices

### Installation Best Practices

1. **Use Automatic Installation**: Let FlowForge setup handle template deployment
2. **Verify After Installation**: Always test statusline after installation
3. **Backup Before Updates**: Automatic backups are created, but verify they exist
4. **Test Shell Integration**: Verify prompt works across different terminals

### Configuration Best Practices

1. **Start with Defaults**: Use default configuration initially
2. **Incremental Customization**: Add custom settings gradually
3. **Document Changes**: Comment configuration modifications
4. **Test Thoroughly**: Verify changes work across different scenarios

### Performance Best Practices

1. **Monitor Execution Time**: Keep statusline under 100ms typically
2. **Optimize Cache Settings**: Balance freshness with performance
3. **Disable Expensive Features**: Turn off remote git operations if network is slow
4. **Regular Maintenance**: Clean old cache files and logs periodically

---

## Support

### Getting Help

1. **Check Debug Output**: Enable debug mode for detailed information
2. **Review Logs**: Check `.flowforge/logs/statusline.log` for errors
3. **Test Manually**: Run statusline script directly to isolate issues
4. **Community Support**: FlowForge GitHub discussions and Discord

### Contributing

Contributions welcome for:
- Template improvements
- Performance optimizations
- Shell integration enhancements
- Documentation updates

---

*This documentation follows FlowForge Rule #13 (Living Documentation) and is automatically updated with template changes. Last updated: 2024-09-13*