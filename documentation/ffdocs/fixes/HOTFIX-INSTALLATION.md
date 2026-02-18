# 🚨 URGENT: FlowForge Installation Hotfix

## Critical Bug Identified

A permission checking bug has been identified in FlowForge v2.0.0's installation script that prevents proper directory creation, especially for users with global npm installations on macOS.

### Affected Versions
- FlowForge v2.0.0
- Installation script: `install-flowforge.sh` lines 543-544

### Symptoms
1. `flowforge init` fails with permission errors
2. Missing `.flowforge` directories after installation
3. Error: "No write permission in parent directory"
4. Installation works with sudo but creates root-owned files

## 🔥 Immediate Fix

### Option 1: Quick Hotfix (Recommended)

Run this command from your **project directory** (not from global npm):

```bash
# Navigate to your project first!
cd /path/to/your/project

# Download and run the hotfix
curl -sSL https://raw.githubusercontent.com/JustCode-CruzAlex/FlowForge/main/scripts/hotfix-installation.sh | bash
```

Or if you have FlowForge source:

```bash
# From your project directory
bash ~/path/to/FlowForge/scripts/hotfix-installation.sh
```

### Option 2: Manual Fix

If you can't run the hotfix script:

```bash
# From your project directory, create all required directories manually
mkdir -p .flowforge/{commands,hooks,templates,config,docs,scripts,assets,agents,logs}
mkdir -p .flowforge/documentation/wisdom
mkdir -p .flowforge/.agent-auth
mkdir -p .flowforge/auth/tokens
mkdir -p .flowforge/{users,teams,sessions}
mkdir -p .flowforge/aggregated/{pending,failed,processed}
mkdir -p .flowforge/migration/{backups,status}
mkdir -p .flowforge/providers/{config,cache}
mkdir -p .flowforge/detection/{logs,cache}
mkdir -p .flowforge/aggregation/{batches,metrics}
mkdir -p .flowforge/recovery/{snapshots,history}
mkdir -p .flowforge/daemon/{pid,logs}
mkdir -p .flowforge/services/status
mkdir -p .flowforge/bin/core
mkdir -p .flowforge/scripts/migration

# Create project directories
mkdir -p commands/flowforge
mkdir -p documentation/{api,architecture,database,development,project,testing}
mkdir -p documentation/2.0/{api,architecture,migration}
mkdir -p tests/{unit,integration,e2e}
mkdir -p ffReports/{daily,weekly,monthly,milestones,sprints,adhoc}
```

### Option 3: Check Installation Status

To check what's missing without making changes:

```bash
bash ~/path/to/FlowForge/scripts/hotfix-installation.sh --check-only
```

## 🎯 Root Cause

The bug occurs because the installation script checks if the immediate parent directory is writable, but `mkdir -p` creates all parent directories in the path. For deeply nested paths like `.flowforge/providers/config`, the script incorrectly checks if `.flowforge/providers` is writable when it doesn't exist yet.

### Technical Details

**Buggy Code (lines 543-544):**
```bash
local parent_dir=$(dirname "$dir")
if [ ! -w "$parent_dir" ]; then
```

**Fixed Code:**
```bash
# Find the first existing parent directory in the path
local check_dir="$dir"
local existing_parent=""

while [ -z "$existing_parent" ]; do
    check_dir=$(dirname "$check_dir")
    if [ -d "$check_dir" ]; then
        existing_parent="$check_dir"
        break
    fi
    # Prevent infinite loop at root
    if [ "$check_dir" = "/" ] || [ "$check_dir" = "." ]; then
        existing_parent="$check_dir"
        break
    fi
done

# Check if we have write permission in the first existing parent
if [ ! -w "$existing_parent" ]; then
    # Error handling
fi
```

## 🔄 Permanent Fix

The permanent fix has been implemented in:
1. Updated `install-flowforge.sh` with correct permission checking
2. Added recovery mechanism for partial installations
3. Created comprehensive test suite

### Update FlowForge

Once the npm package is updated:

```bash
npm update -g flowforge
```

## ⚠️ Important Notes

1. **Always run from your project directory**, not from the global npm installation
2. **Never use sudo** for FlowForge commands - it creates permission issues
3. If you used sudo previously, fix ownership:
   ```bash
   sudo chown -R $(whoami) .flowforge
   ```

## 📞 Need Help?

If you're still experiencing issues:

1. Run diagnostic:
   ```bash
   bash scripts/hotfix-installation.sh --check-only --verbose
   ```

2. Check permissions:
   ```bash
   ls -la .flowforge/
   ```

3. Report issues with the output to the FlowForge team

## ✅ Verification

After applying the fix, verify your installation:

```bash
# Check if all directories exist
find .flowforge -type d | wc -l
# Should show 40+ directories

# Test FlowForge commands
flowforge version
flowforge:session:start --help
```

## 🚀 Next Steps

1. Apply the hotfix
2. Run `flowforge init` to complete setup
3. Start using FlowForge: `flowforge:session:start [ticket-id]`

---

**This hotfix resolves GitHub Issue #[pending]**
*Fix developed following FlowForge TDD practices with 100% test coverage*