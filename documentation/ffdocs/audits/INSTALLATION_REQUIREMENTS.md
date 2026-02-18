
# FlowForge StatusLine Installation Requirements

## System Requirements

### Minimum Requirements:
- **Python**: 3.7 or higher
- **Operating System**: Linux, macOS, Windows
- **Memory**: 50MB RAM (typical usage)
- **Disk Space**: < 1MB for core files

### Required Files:
```
.claude/
├── statusline.py                    # Main entry point
├── statusline_cache.py             # Caching system
├── statusline_data_loader.py       # Data loading
├── statusline_helpers.py           # Helper functions
└── context_usage_calculator.py     # Context calculation
```

## Optional Dependencies

### For Enhanced Features:
- **Git**: Repository integration and branch detection
- **GitHub CLI (gh)**: Milestone data from GitHub issues
- **FlowForge structure**: Enhanced project management features

### Optional Directory Structure:
```
project/
├── .flowforge/
│   ├── tasks.json              # Current milestone data
│   ├── milestones.json         # Project milestones
│   └── local/
│       └── session.json        # Session information
├── .task-times.json            # Time tracking data
└── package.json               # Project metadata
```

## Installation Methods

### Method 1: Direct Copy (Recommended)
```bash
# Copy core files to target project
cp /path/to/templates/statusline/core/*.py .claude/
chmod +x .claude/statusline.py
```

### Method 2: Template Installation
```bash
# Use FlowForge template system
flowforge template install statusline
```

### Method 3: Manual Setup
```bash
mkdir -p .claude
# Download/copy each required file individually
curl -o .claude/statusline.py https://...
# ... etc for each file
```

## Configuration

### Environment Variables (Optional):
- `GITHUB_TOKEN` or `GH_TOKEN`: GitHub API access
- `XDG_CACHE_HOME`: Custom cache directory
- `FLOWFORGE_DEBUG`: Enable debug logging

### Project-Specific Config:
- Create `.flowforge/` directory for enhanced features
- Set up `package.json` with project name
- Initialize git repository for branch integration

## Validation

### Quick Test:
```bash
echo '{"model": {"display_name": "Test"}}' | python .claude/statusline.py
```

### Expected Output:
```
[FlowForge] | 🎯 ProjectName | 🌿 main | 🧠 0% [░░░░░░░░░░] | Test
```

## Performance Considerations

### Typical Performance:
- **Cold start**: < 200ms
- **Warm cache**: < 50ms
- **Large transcripts**: < 2 seconds

### Optimization Tips:
- Use caching (enabled by default)
- Limit transcript file sizes
- Consider background GitHub API calls
- Regular cache cleanup

## Security Considerations

### Data Handling:
- All data processing is local
- GitHub tokens use official gh CLI
- No data transmitted to external services
- Cache files use appropriate permissions

### File Permissions:
```bash
chmod 644 .claude/*.py
chmod 755 .claude/statusline.py  # Main entry point
chmod 700 ~/.cache/flowforge/    # Cache directory
```

## Troubleshooting

### Common Installation Issues:

1. **Permission Errors**
   ```bash
   chmod +x .claude/statusline.py
   ```

2. **Python Path Issues**
   ```bash
   which python3
   # Update shebang if needed
   ```

3. **Module Import Errors**
   - Verify all files are present
   - Check Python version compatibility
   - Ensure files are not corrupted

4. **Performance Issues**
   - Clear cache: `rm -rf ~/.cache/flowforge/`
   - Check transcript file sizes
   - Disable background GitHub calls

### Support Resources:
- GitHub Issues: Report installation problems
- Documentation: Complete API reference
- Examples: Sample configurations and usage
