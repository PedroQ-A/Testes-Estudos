# FlowForge Cache Management Fix

## Problem Solved
The `.flowforge/.statusline-cache.json` file was being tracked by git despite being in `.gitignore`, causing persistent modification warnings and blocking commits/pushes.

## Solution Implemented

### 1. **Cache Location Changed**
- **Old Location**: `.flowforge/.statusline-cache.json` (inside repository)
- **New Location**: `~/.cache/flowforge/statusline-cache-{hash}.json` (user cache directory)
- **Benefits**:
  - Completely outside repository - impossible to track
  - Follows XDG Base Directory Specification
  - Project-specific cache files (using path hash)
  - No git tracking issues ever

### 2. **Git Tracking Cleanup**
- Removed all cache files from git index using `git rm --cached`
- Files deleted:
  - `.flowforge/.statusline-cache.json`
  - `.flowforge/statusline-performance.json`
  - `.claude/.flowforge/.statusline-cache.json`

### 3. **Enhanced .gitignore**
Added comprehensive patterns:
```gitignore
.flowforge/.statusline-cache.json
.flowforge/statusline-performance.json
.flowforge/.cache/
*.cache.json
```

### 4. **Pre-commit Hook Protection**
Added `check_cache_files()` function to `.git/hooks/pre-commit`:
- Blocks any attempt to commit cache files
- Patterns blocked: `\.cache|cache\.json|statusline-cache|\.tmp$|\.temp$`
- Provides clear error messages with fix instructions
- Runs as first check in pre-commit flow

### 5. **Cleanup Script**
Created `/scripts/cleanup-cache.sh`:
- Removes cache files from git tracking
- Deletes local cache files
- Verifies .gitignore entries
- Can be run anytime to clean up stray cache files

## Implementation Details

### Python StatusLine Changes
Modified `.claude/statusline.py` to use proper cache directory:
```python
# Priority: XDG_CACHE_HOME > HOME/.cache > /tmp
cache_base = Path(os.environ.get('XDG_CACHE_HOME',
                  os.environ.get('HOME', '/tmp') + '/.cache'))
flowforge_cache_dir = cache_base / 'flowforge'
project_hash = hashlib.md5(str(self.base_path).encode()).hexdigest()[:8]
self.cache_file = flowforge_cache_dir / f'statusline-cache-{project_hash}.json'
```

### Cache Directory Structure
```
~/.cache/flowforge/
├── statusline-cache-34f5f876.json  # Project 1
├── statusline-cache-a2b3c4d5.json  # Project 2
└── ...                              # Other projects
```

## Testing & Verification

### Tests Performed
1. ✅ Cache files removed from git tracking
2. ✅ New cache location working (`~/.cache/flowforge/`)
3. ✅ Pre-commit hook blocks cache file commits
4. ✅ .gitignore prevents adding new cache files
5. ✅ Python statusline using new location
6. ✅ No performance degradation

### How to Verify
```bash
# Check git status - should show no modified cache files
git status | grep cache

# Check new cache location
ls -la ~/.cache/flowforge/

# Test pre-commit hook (will fail as expected)
echo "test" > test.cache.json
git add test.cache.json  # Should be blocked by .gitignore

# Run cleanup if needed
./scripts/cleanup-cache.sh
```

## Benefits

1. **Permanent Fix**: Cache files can never be tracked again
2. **Clean Git History**: No more constant cache file modifications
3. **XDG Compliant**: Follows Linux desktop standards
4. **Multi-Project Support**: Each project has its own cache file
5. **Automatic Protection**: Pre-commit hook prevents accidents
6. **Easy Cleanup**: Script provided for maintenance

## Migration Notes

For existing FlowForge installations:
1. Run `./scripts/cleanup-cache.sh` once
2. Update to latest version
3. Cache will automatically use new location

## Technical Architecture

```
Repository Files          User Cache Directory
================          ====================
.flowforge/               ~/.cache/flowforge/
├── [config files]        ├── statusline-cache-{hash}.json
├── [NO CACHE FILES]      └── [other cache files]
└── ...

Git Hooks                 Protection Layers
=========                 ================
.git/hooks/               1. File location (outside repo)
├── pre-commit           2. .gitignore patterns
│   └── check_cache()    3. Pre-commit hook
└── ...                  4. Cleanup script
```

## Maintenance

- **No regular maintenance needed** - cache files are now properly isolated
- **If issues arise**: Run `./scripts/cleanup-cache.sh`
- **Cache lifecycle**: Managed automatically by Python code
- **Cache size**: Minimal (~1KB per project)

## Related Files

- `.claude/statusline.py` - Main statusline implementation
- `.git/hooks/pre-commit` - Pre-commit hook with cache prevention
- `.gitignore` - Updated with cache patterns
- `/scripts/cleanup-cache.sh` - Cleanup utility

## Status

✅ **ISSUE RESOLVED** - Cache tracking permanently fixed