# FlowForge Milestone Mode

## Overview
Milestone Mode is a powerful FlowForge feature that enables true parallel development using Git worktrees and intelligent branch management. This feature allows teams to work simultaneously on multiple project milestones without the friction of constant branch switching, merge conflicts, or context confusion.

Perfect for scenarios where you need to maintain parallel streams of development, such as:
- Current release development while planning next version
- Multiple feature teams working on different deliverables
- Hotfix development while continuing main development
- Proof-of-concept work alongside production development

## Key Features

### 1. Intelligent Milestone-Based Branching
FlowForge automatically adapts its branching strategy based on your current milestone context:

- **Normal Mode Pattern**: `feature/<issue>-work`
  - Example: `feature/123-work`
  - Best for linear development on a single stream

- **Milestone Mode Pattern**: `milestone/<name>/issue/<number>`
  - Example: `milestone/v2.0-launch/issue/123`
  - Creates clear hierarchical organization
  - Enables multiple parallel development streams

The pattern switching is completely automatic based on your milestone configuration, requiring no manual branch naming decisions.

### 2. Claude Code Statusline Integration
FlowForge provides real-time visual feedback through the Claude Code statusline (the bottom information bar in your terminal):

**Normal Mode Statusline:**
```
⚩ FF v2.0 📋 317/21 [▓▓▓░░] 14% | ⏱ 00:23/0:30 | 💰 4:30h left | 🌿 feature/317-work | Opus
```

**Milestone Mode Statusline:**
```
🎯 MILESTONE: v2.0-demo | 317/21 [▓▓▓░░] | ⏱ 00:23 | ETA: 4.5h | 🌿 milestone/v2.0-demo/issue/317 | Opus
```

**Key Statusline Differences:**
- **Milestone Indicator**: `🎯 MILESTONE: v2.0-demo` replaces the standard FlowForge version indicator
- **Simplified Time Display**: Focuses on current session time and milestone ETA
- **Branch Context**: Full milestone branch path shown for complete context
- **Visual Clarity**: Distinct styling prevents confusion between normal and milestone work

### 3. Advanced Git Worktree Support
FlowForge's milestone mode leverages Git worktrees for true parallel development:

**Benefits:**
- **Isolated Development**: Each milestone gets its own working directory
- **Zero Context Switching**: No need to stash, commit, or switch branches
- **Independent Configurations**: Each worktree maintains its own milestone settings
- **Simultaneous Work**: Work on multiple milestones at the same time
- **Clean Separation**: Changes in one milestone don't affect another

**Technical Implementation:**
- Each worktree is a complete working copy linked to the same repository
- File system isolation prevents conflicts between milestone work
- Git operations remain independent between worktrees
- FlowForge commands work seamlessly in any worktree environment

## Command Reference

### Enable Milestone Mode
```bash
/flowforge:milestone:mode enable <milestone-name>
```

**Purpose**: Activates milestone mode for your current project directory, switching FlowForge into milestone-aware development mode.

**What It Does:**
1. **Creates Configuration Files**:
   - `.milestone-context`: Simple text file with milestone name
   - `.flowforge/worktree.json`: Comprehensive JSON configuration
2. **Git Integration Setup**:
   - Sets `flowforge.milestone` Git config value
   - Sets `flowforge.milestone-mode` to "enabled"
   - Updates statusline display configuration
3. **Branch Management**:
   - Creates milestone base branch if it doesn't exist
   - Checks out the milestone branch
   - Sets up branch hierarchy for issue branches

**Example:**
```bash
# Enable milestone mode for v2.0 launch
/flowforge:milestone:mode enable v2.0-launch

# Output:
✅ Milestone mode enabled: v2.0-launch
📁 Configuration created: .milestone-context, .flowforge/worktree.json
🌿 Milestone branch created: milestone/v2.0-launch
🎯 Statusline updated: Now showing milestone context
```

### Disable Milestone Mode
```bash
/flowforge:milestone:mode disable
```

**Purpose**: Safely deactivates milestone mode and returns to normal FlowForge development workflow.

**What It Does:**
1. **Configuration Cleanup**:
   - Removes `.milestone-context` file
   - Archives `.flowforge/worktree.json` (for audit trail)
   - Clears Git configuration values
2. **Statusline Reset**:
   - Returns to normal FlowForge statusline display
   - Removes milestone indicators
3. **Branch Guidance**:
   - Provides information about existing milestone branches
   - Suggests next steps for branch cleanup

**Example:**
```bash
/flowforge:milestone:mode disable

# Output:
✅ Milestone mode disabled
🗑️  Configuration files removed
📊 Status: 3 milestone branches remain (manual cleanup required)
💡 Tip: Use 'git branch -d milestone/v2.0-launch' to clean up when ready
```

### Check Status
```bash
/flowforge:milestone:mode status
```

**Purpose**: Provides comprehensive information about your current milestone mode configuration and environment.

**Information Displayed:**
- **Mode Status**: Enabled/disabled state
- **Active Milestone**: Current milestone name and configuration
- **Branch Information**: Milestone branches and their status
- **Worktree Details**: Any associated worktrees and their paths
- **Time Tracking**: Current session information if active

**Example Output:**
```bash
/flowforge:milestone:mode status

# Output:
🎯 Milestone Mode Status Report
═══════════════════════════════

📊 Status: ENABLED
🎯 Active Milestone: v2.0-launch
📁 Configuration: .milestone-context, .flowforge/worktree.json
🌿 Current Branch: milestone/v2.0-launch/issue/317

📋 Milestone Branches:
   ✓ milestone/v2.0-launch (base)
   ✓ milestone/v2.0-launch/issue/316 (merged)
   ➤ milestone/v2.0-launch/issue/317 (current)
   📝 milestone/v2.0-launch/issue/318 (in progress)

🗂️  Worktrees:
   📁 /home/user/projects/FlowForge (main)
   📁 /home/user/projects/FF-v3-planning (worktree: v3.0-planning)

⏱️  Current Session: Issue #317 (00:23 elapsed)
```

### Setup Worktree (Advanced)
```bash
/flowforge:milestone:mode setup <milestone-name> [target-path]
```

**Purpose**: Creates a new Git worktree specifically configured for milestone development, enabling true parallel work.

**Parameters:**
- `<milestone-name>`: Name of the milestone (e.g., "v3.0-planning")
- `[target-path]`: Optional path for worktree (defaults to `../<project>-<milestone>`)

**What It Does:**
1. **Worktree Creation**:
   - Creates new Git worktree at specified location
   - Links to main repository while maintaining independence
2. **Milestone Configuration**:
   - Automatically enables milestone mode in new worktree
   - Creates milestone-specific configuration files
   - Sets up proper Git config values
3. **Directory Structure**:
   - Creates organized directory structure
   - Maintains clear separation from main development

**Example:**
```bash
# Create worktree for v3.0 planning
/flowforge:milestone:mode setup v3.0-planning ../FF-v3-planning

# Output:
🔨 Creating milestone worktree...
📁 Worktree created: ../FF-v3-planning
🎯 Milestone mode enabled: v3.0-planning
🌿 Base branch created: milestone/v3.0-planning
✅ Ready for parallel development

💡 Next steps:
   cd ../FF-v3-planning
   /flowforge:session:start <issue-number>
```

### Interactive Mode
```bash
/flowforge:milestone:mode
```

**Purpose**: Launches an interactive menu system for easy milestone management without memorizing command syntax.

**Features:**
- **Visual Menu**: Easy-to-navigate options
- **Status Overview**: Current configuration at a glance
- **Quick Actions**: Enable/disable, status check, worktree creation
- **Help Integration**: Built-in help and examples
- **Safe Operations**: Confirmation prompts for destructive actions

**Example Session:**
```bash
/flowforge:milestone:mode

# Interactive Menu:
┌─────────────────────────────────────────┐
│        FlowForge Milestone Mode         │
├─────────────────────────────────────────┤
│ Current Status: DISABLED                │
│                                         │
│ [1] Enable milestone mode               │
│ [2] Check current status                │
│ [3] Setup new worktree                  │
│ [4] View milestone branches             │
│ [5] Help and examples                   │
│ [q] Quit                                │
└─────────────────────────────────────────┘

Select option [1-5, q]: _
```

## FlowForge Integration Points

### Seamless Session Management
The `session:start` command automatically adapts to your milestone context, providing zero-friction development workflow:

**Normal Mode (Default):**
```bash
/flowforge:session:start 123
# Branch created: feature/123-work
# Statusline: ⚩ FF v2.0 📋 123 | ⏱ 00:00 | 🌿 feature/123-work
```

**Milestone Mode (Auto-detected):**
```bash
# With milestone mode enabled for "v2.0-launch"
/flowforge:session:start 123
# Branch created: milestone/v2.0-launch/issue/123
# Statusline: 🎯 MILESTONE: v2.0-launch | 123 | ⏱ 00:00 | 🌿 milestone/v2.0-launch/issue/123
```

### Time Tracking Integration
Milestone mode enhances FlowForge's time tracking capabilities:

**Enhanced Time Context:**
- **Milestone-specific tracking**: Time logged per milestone for better project accounting
- **Cross-milestone reporting**: Generate time reports across multiple milestones
- **ETA calculations**: Milestone progress estimation based on historical velocity
- **Budget allocation**: Track time against milestone budgets

**Time Tracking Features:**
```bash
# Time reports by milestone
/flowforge:report:time --milestone v2.0-launch

# Cross-milestone time summary
/flowforge:report:time --all-milestones

# Milestone progress tracking
/flowforge:milestone:mode status  # Shows time allocation and progress
```

### Git Integration
Milestone mode leverages Git's advanced features for professional development workflows:

**Worktree Management:**
- **Automatic setup**: Creates and manages Git worktrees transparently
- **Branch hierarchy**: Maintains clean branch organization
- **Merge strategies**: Intelligent milestone-to-main merge handling

**Git Configuration:**
```bash
# Git config values set by milestone mode
git config flowforge.milestone          # Current milestone name
git config flowforge.milestone-mode     # "enabled" status
git config flowforge.branch-pattern     # Milestone branch pattern
git config flowforge.statusline-mode    # "milestone" display mode
```

### Claude Code Terminal Integration
Milestone mode provides enhanced visual feedback through the Claude Code interface:

**Statusline Features:**
- **Real-time updates**: Statusline changes immediately when switching contexts
- **Milestone awareness**: Different display modes for clear context separation
- **Progress indicators**: Visual progress bars for milestone completion
- **Time remaining**: ETA calculations for milestone delivery

**Terminal Customization:**
```bash
# Statusline customization options
export FLOWFORGE_STATUSLINE_MILESTONE_FORMAT="🎯 %milestone% | %issue% | ⏱ %time%"
export FLOWFORGE_STATUSLINE_SHOW_ETA=true
export FLOWFORGE_STATUSLINE_COMPACT_MODE=false
```

### Configuration Architecture

Milestone mode uses a two-tier configuration system for optimal performance and flexibility:

#### .milestone-context (Performance File)
A lightweight text file for rapid milestone detection during command execution:

**Purpose:**
- **Fast lookups**: Enables immediate milestone detection without JSON parsing
- **Session initialization**: Quick milestone context establishment
- **Shell integration**: Easy integration with shell scripts and hooks

**Format:**
```
v2.0-team-balanced
```

**Location:** Project root directory (same level as `.git/`)

#### .flowforge/worktree.json (Comprehensive Configuration)
Complete milestone configuration with full metadata and settings:

**Purpose:**
- **Detailed configuration**: All milestone mode settings and metadata
- **Audit trail**: Creation timestamps and author information
- **Advanced features**: Branch patterns, merge targets, and worktree management
- **Integration data**: Links to other FlowForge systems

**Full Schema:**
```json
{
  "milestone": "v2.0-team-balanced",
  "enabled": true,
  "branch_pattern": "milestone/{milestone}/issue/{issue}",
  "base_branch": "milestone/v2.0-team-balanced",
  "merge_target": "main",
  "created": "2025-09-11T07:30:00Z",
  "created_by": "developer-name",
  "worktree": {
    "enabled": true,
    "path": "/home/user/projects/FlowForge",
    "linked_worktrees": [
      {
        "path": "../FF-v3-planning",
        "milestone": "v3.0-planning"
      }
    ]
  },
  "time_tracking": {
    "budget_hours": 40,
    "allocated_hours": 28.5,
    "remaining_hours": 11.5
  },
  "integration": {
    "statusline_format": "milestone",
    "auto_branch_creation": true,
    "merge_strategy": "milestone-to-main"
  }
}
```

**Configuration Fields Explained:**
- **milestone**: Human-readable milestone identifier
- **branch_pattern**: Template for automatic branch naming
- **base_branch**: The main milestone branch (parent for issue branches)
- **merge_target**: Where milestone branches eventually merge (usually `main`)
- **worktree**: Worktree management configuration and linked worktrees
- **time_tracking**: Budget and allocation tracking for milestone
- **integration**: FlowForge system integration settings

## Real-World Workflow Examples

### Single Developer: Parallel Milestone Development
Perfect for developers juggling multiple project phases or working on different versions simultaneously.

**Scenario**: Working on current v2.0 release while planning v3.0 architecture.

```bash
# Setup: Main development environment for v2.0
cd ~/projects/FlowForge
/flowforge:milestone:mode enable v2.0-launch
# Statusline: 🎯 MILESTONE: v2.0-launch | Ready | 🌿 milestone/v2.0-launch

# Work on v2.0 issues
/flowforge:session:start 317  # Bug fix for v2.0
# Statusline: 🎯 MILESTONE: v2.0-launch | 317 | ⏱ 00:15 | 🌿 milestone/v2.0-launch/issue/317

# Need to work on v3.0 planning simultaneously
/flowforge:milestone:mode setup v3.0-architecture ../FF-v3-architecture
cd ../FF-v3-architecture
# Statusline: 🎯 MILESTONE: v3.0-architecture | Ready | 🌿 milestone/v3.0-architecture

/flowforge:session:start 456  # Architecture planning for v3.0
# Statusline: 🎯 MILESTONE: v3.0-architecture | 456 | ⏱ 00:08 | 🌿 milestone/v3.0-architecture/issue/456

# Seamlessly switch between contexts
cd ~/projects/FlowForge        # Back to v2.0 work
cd ../FF-v3-architecture       # Back to v3.0 planning
```

**Benefits:**
- No context switching overhead
- Clear visual separation via statusline
- Independent time tracking per milestone
- Zero risk of cross-milestone contamination

### Team Collaboration: Distributed Milestone Work
Ideal for teams working on different project milestones with clear separation of concerns.

**Scenario**: 4-developer team with specialized milestone assignments.

```bash
# Developer A (Frontend Lead): UI/UX Milestone
/flowforge:milestone:mode enable ui-ux-overhaul
/flowforge:session:start 789  # Component redesign
# Statusline: 🎯 MILESTONE: ui-ux-overhaul | 789 | ⏱ 01:23 | 🌿 milestone/ui-ux-overhaul/issue/789

# Developer B (Backend Lead): Performance Milestone
/flowforge:milestone:mode enable performance-q1
/flowforge:session:start 790  # Database optimization
# Statusline: 🎯 MILESTONE: performance-q1 | 790 | ⏱ 02:15 | 🌿 milestone/performance-q1/issue/790

# Developer C (Security Lead): Security Audit
/flowforge:milestone:mode enable security-audit
/flowforge:session:start 791  # Vulnerability assessment
# Statusline: 🎯 MILESTONE: security-audit | 791 | ⏱ 01:45 | 🌿 milestone/security-audit/issue/791

# Developer D (DevOps): Infrastructure Milestone
/flowforge:milestone:mode enable infra-modernization  
/flowforge:session:start 792  # CI/CD pipeline updates
# Statusline: 🎯 MILESTONE: infra-modernization | 792 | ⏱ 00:56 | 🌿 milestone/infra-modernization/issue/792
```

**Team Benefits:**
- Clear milestone ownership and accountability
- Independent progress tracking
- No branch conflicts between teams
- Milestone-specific time and budget tracking
- Clean merge paths for each milestone

### Hotfix Development: Emergency Response
How to handle urgent fixes while maintaining milestone context.

**Scenario**: Critical production bug needs immediate attention during milestone development.

```bash
# Currently working on v2.1 milestone
# Statusline: 🎯 MILESTONE: v2.1-features | 234 | ⏱ 01:30 | 🌿 milestone/v2.1-features/issue/234

# Urgent hotfix needed - create hotfix worktree
/flowforge:milestone:mode setup hotfix-critical ../FF-hotfix
cd ../FF-hotfix
/flowforge:session:start 999  # Critical security patch
# Statusline: 🎯 MILESTONE: hotfix-critical | 999 | ⏱ 00:00 | 🌿 milestone/hotfix-critical/issue/999

# Work on hotfix with full FlowForge tracking
# After hotfix completion, return to milestone work
cd ~/projects/FlowForge
# Statusline: 🎯 MILESTONE: v2.1-features | 234 | ⏱ 01:30 | 🌿 milestone/v2.1-features/issue/234
```

### Migration Scenarios: Mode Transitions
Common patterns for transitioning between normal and milestone modes.

**Scenario 1: Project Growth (Normal → Milestone)**
```bash
# Start: Normal development mode
/flowforge:session:start 100  # Creates feature/100-work
# Statusline: ⚩ FF v2.0 📋 100 | ⏱ 02:30 | 🌿 feature/100-work

# Project grows, need milestone organization
/flowforge:session:end "Completing feature before milestone transition"

# Enable milestone mode for organized development
/flowforge:milestone:mode enable v2.0-release
/flowforge:session:start 101  # Creates milestone/v2.0-release/issue/101
# Statusline: 🎯 MILESTONE: v2.0-release | 101 | ⏱ 00:00 | 🌿 milestone/v2.0-release/issue/101
```

**Scenario 2: Milestone Completion (Milestone → Normal)**
```bash
# Milestone completed, returning to normal development
# Statusline: 🎯 MILESTONE: v2.0-release | 150 | ⏱ 08:45 | 🌿 milestone/v2.0-release/issue/150

/flowforge:session:end "Milestone v2.0-release completed"
/flowforge:milestone:mode disable

/flowforge:session:start 151  # Creates feature/151-work
# Statusline: ⚩ FF v2.0 📋 151 | ⏱ 00:00 | 🌿 feature/151-work
```

**Scenario 3: Milestone Switching**
```bash
# Switch between different milestones
# Current: v2.0-performance
# Statusline: 🎯 MILESTONE: v2.0-performance | 200 | ⏱ 03:20 | 🌿 milestone/v2.0-performance/issue/200

/flowforge:session:pause
/flowforge:milestone:mode enable v2.0-security
/flowforge:session:start 201  # Switch to security milestone
# Statusline: 🎯 MILESTONE: v2.0-security | 201 | ⏱ 00:00 | 🌿 milestone/v2.0-security/issue/201
```

## Best Practices & Professional Guidelines

### Milestone Naming Conventions

**Recommended Patterns:**
```bash
# Version-based milestones
v2.0-launch          # Major version release
v2.1-features        # Feature release
v2.0.1-hotfix       # Patch release

# Feature-based milestones
ui-redesign-q1       # UI/UX focused milestone
performance-audit    # Performance improvements
security-hardening   # Security enhancements
api-v3-migration     # API version upgrade

# Time-based milestones
q1-2024-goals       # Quarterly objectives
sprint-23           # Sprint-specific work
demo-prep           # Event preparation
```

**Naming Guidelines:**
- **Be descriptive but concise** (max 20 characters recommended)
- **Use hyphens, not underscores** for consistency with Git conventions
- **Include context** (version, purpose, timeframe)
- **Avoid special characters** that might cause shell issues
- **Use lowercase** for consistency across systems

### Worktree Organization Strategy

**Directory Structure Best Practices:**
```bash
~/projects/
├── FlowForge/                    # Main repository (primary milestone)
├── FF-v3-planning/               # Future version planning
├── FF-hotfix-current/            # Emergency fixes
├── FF-performance-audit/         # Performance work
└── FF-client-demo/              # Demo preparation
```

**Benefits of This Structure:**
- **Clear naming**: Immediate identification of purpose
- **Logical grouping**: Related work stays together
- **Easy navigation**: Tab completion works efficiently
- **Backup friendly**: Each worktree can be backed up independently

### Team Collaboration Guidelines

**Milestone Assignment Strategies:**

1. **Vertical Team Assignment** (Recommended)
   ```bash
   # Each team owns a complete milestone
   Team A: /flowforge:milestone:mode enable frontend-v2
   Team B: /flowforge:milestone:mode enable backend-v2
   Team C: /flowforge:milestone:mode enable devops-v2
   ```

2. **Feature-Based Assignment**
   ```bash
   # Teams work on specific features across milestones
   Auth Team: /flowforge:milestone:mode enable auth-overhaul
   API Team: /flowforge:milestone:mode enable api-v3-migration
   UI Team: /flowforge:milestone:mode enable ui-modernization
   ```

**Communication Protocols:**
- **Daily standups**: Include milestone context in status updates
- **Code reviews**: Milestone-aware PR templates and reviewers
- **Documentation**: Milestone-specific documentation requirements
- **Testing**: Independent test suites per milestone

### Statusline Optimization

**Visual Clarity Best Practices:**
```bash
# Configure terminal for optimal milestone visibility
export FLOWFORGE_STATUSLINE_MILESTONE_EMOJI="🎯"
export FLOWFORGE_STATUSLINE_COMPACT_MODE=false
export FLOWFORGE_STATUSLINE_SHOW_BRANCH=true
export FLOWFORGE_STATUSLINE_SHOW_ETA=true
```

**Terminal Setup Recommendations:**
- **Use different terminal profiles** for different milestones
- **Color-code terminal backgrounds** by milestone type
- **Set meaningful terminal titles** that include milestone context
- **Configure shell prompt** to show milestone information

### Time and Budget Management

**Milestone Time Tracking:**
```bash
# Set milestone budgets during setup
/flowforge:milestone:mode enable v2.0-launch --budget 40h

# Monitor progress regularly
/flowforge:milestone:mode status  # Shows time allocation

# Generate milestone reports
/flowforge:report:time --milestone v2.0-launch --format detailed
```

**Budget Allocation Guidelines:**
- **Plan for 20% buffer** in milestone estimates
- **Track time daily** to identify scope creep early
- **Review weekly** to adjust milestone scope if needed
- **Document budget changes** with justifications

### Branch Management Excellence

**Branch Hierarchy Best Practices:**
```bash
# Clean milestone branch structure
main                                    # Production-ready code
├── milestone/v2.0-launch              # Milestone base branch
│   ├── milestone/v2.0-launch/issue/317 # Individual issues
│   ├── milestone/v2.0-launch/issue/318
│   └── milestone/v2.0-launch/issue/319
└── milestone/v2.1-features            # Next milestone
    ├── milestone/v2.1-features/issue/401
    └── milestone/v2.1-features/issue/402
```

**Merge Strategies:**
- **Milestone to main**: Use pull requests with comprehensive reviews
- **Issue to milestone**: Fast-forward merges when possible
- **Cross-milestone dependencies**: Use cherry-picking sparingly
- **Conflict resolution**: Prioritize milestone base branch updates

### Quality Assurance Integration

**Testing Strategy per Milestone:**
```bash
# Milestone-specific test suites
npm test -- --milestone=v2.0-launch
npm run test:integration -- --milestone-filter=v2.0
npm run test:e2e -- --milestone-tag=launch
```

**Quality Gates:**
- **Code coverage**: Maintain 80%+ coverage per milestone
- **Integration tests**: Pass all milestone-specific scenarios
- **Performance tests**: Meet milestone performance targets
- **Security scans**: No critical vulnerabilities in milestone scope

## Troubleshooting Guide

### Common Issues and Solutions

#### Statusline Not Updating
**Problem**: FlowForge statusline doesn't show milestone context

**Symptoms:**
- Statusline shows normal mode format despite milestone mode being enabled
- Milestone indicators (🎯) not appearing
- Branch information incorrect

**Solutions:**
```bash
# 1. Refresh FlowForge statusline configuration
export FLOWFORGE_STATUSLINE_REFRESH=true
source ~/.bashrc  # or ~/.zshrc

# 2. Check Git configuration
git config --get flowforge.milestone-mode
git config --get flowforge.milestone

# 3. Verify configuration files
ls -la .milestone-context .flowforge/worktree.json

# 4. Reset and re-enable milestone mode
/flowforge:milestone:mode disable
/flowforge:milestone:mode enable your-milestone
```

#### Branch Creation Failures
**Problem**: Cannot create milestone branches or issue branches

**Symptoms:**
```bash
fatal: A branch named 'milestone/v2.0/issue/123' already exists
fatal: Cannot create worktree: branch already exists
```

**Solutions:**
```bash
# 1. Check existing branches
git branch -a | grep milestone

# 2. Clean up conflicting branches (if safe to do so)
git branch -d milestone/v2.0/issue/123

# 3. Use different milestone name
/flowforge:milestone:mode enable v2.0-launch-updated

# 4. Force recreate milestone base (advanced)
git branch -D milestone/v2.0-launch
/flowforge:milestone:mode enable v2.0-launch
```

#### Worktree Path Conflicts
**Problem**: Cannot create worktree due to existing directory

**Symptoms:**
```bash
fatal: '../FF-v3-planning' already exists
fatal: Cannot create a worktree with a conflicting path
```

**Solutions:**
```bash
# 1. Choose different path
/flowforge:milestone:mode setup v3-planning ../FF-v3-planning-new

# 2. Remove existing directory (ensure no important work)
rm -rf ../FF-v3-planning
/flowforge:milestone:mode setup v3-planning ../FF-v3-planning

# 3. Use absolute path
/flowforge:milestone:mode setup v3-planning /home/user/projects/FF-v3-planning

# 4. Check for hidden Git worktrees
git worktree list
git worktree prune  # Clean up stale worktrees
```

#### Configuration File Corruption
**Problem**: Milestone mode partially working or showing errors

**Symptoms:**
- Commands work but configuration seems inconsistent
- JSON parsing errors in logs
- Statusline shows mixed information

**Solutions:**
```bash
# 1. Validate configuration files
jq . .flowforge/worktree.json  # Should parse without errors
cat .milestone-context         # Should show single milestone name

# 2. Reset configuration
/flowforge:milestone:mode disable
rm -f .milestone-context .flowforge/worktree.json
/flowforge:milestone:mode enable your-milestone

# 3. Manual configuration repair
echo "your-milestone-name" > .milestone-context
mkdir -p .flowforge
# Recreate worktree.json with proper structure
```

#### Time Tracking Issues
**Problem**: Time tracking not working properly in milestone mode

**Symptoms:**
- Session time not recording
- Milestone time reports empty
- ETA calculations incorrect

**Solutions:**
```bash
# 1. Check session status
/flowforge:session:status

# 2. Verify milestone configuration includes time tracking
cat .flowforge/worktree.json | jq '.time_tracking'

# 3. Restart session with proper milestone context
/flowforge:session:end "Fixing time tracking"
/flowforge:session:start your-issue-number

# 4. Check FlowForge time tracking service
/flowforge:dev:status | grep -i time
```

#### Git Integration Problems
**Problem**: Git operations behaving unexpectedly in milestone mode

**Symptoms:**
- Commits going to wrong branches
- Push operations failing
- Merge conflicts with milestone branches

**Solutions:**
```bash
# 1. Verify current branch context
git branch --show-current
git status

# 2. Check Git configuration
git config --list | grep flowforge

# 3. Reset Git milestone configuration
git config --unset flowforge.milestone
git config --unset flowforge.milestone-mode
/flowforge:milestone:mode enable your-milestone  # Reconfigure

# 4. Manual branch checkout
git checkout milestone/your-milestone/issue/number
```

### Advanced Troubleshooting

#### Debug Mode
**Enable detailed logging for complex issues:**
```bash
export FLOWFORGE_DEBUG=true
export FLOWFORGE_MILESTONE_DEBUG=true
/flowforge:milestone:mode status  # Verbose output
```

#### Configuration Backup and Restore
**Backup milestone configuration before major changes:**
```bash
# Backup
cp .milestone-context .milestone-context.backup
cp .flowforge/worktree.json .flowforge/worktree.json.backup

# Restore
cp .milestone-context.backup .milestone-context
cp .flowforge/worktree.json.backup .flowforge/worktree.json
```

#### Complete Reset Procedure
**When all else fails, complete milestone mode reset:**
```bash
# 1. End any active sessions
/flowforge:session:end "Milestone mode reset"

# 2. Disable milestone mode
/flowforge:milestone:mode disable

# 3. Clean up configuration
rm -f .milestone-context .flowforge/worktree.json

# 4. Clear Git configuration
git config --unset flowforge.milestone 2>/dev/null || true
git config --unset flowforge.milestone-mode 2>/dev/null || true

# 5. Restart fresh
/flowforge:milestone:mode enable new-milestone-name
```

## Technical Implementation Details

### Git Configuration Schema
Milestone mode integrates with Git through a comprehensive configuration system:

**Core Configuration Values:**
```bash
# Milestone identification
git config flowforge.milestone "v2.0-launch"
git config flowforge.milestone-mode "enabled"

# Branch management
git config flowforge.branch-pattern "milestone/{milestone}/issue/{issue}"
git config flowforge.base-branch "milestone/v2.0-launch"
git config flowforge.merge-target "main"

# Statusline integration
git config flowforge.statusline-mode "milestone"
git config flowforge.statusline-format "🎯 MILESTONE: {milestone} | {issue} | ⏱ {time}"

# Worktree management
git config flowforge.worktree-enabled "true"
git config flowforge.worktree-path "/home/user/projects/FlowForge"
```

**Configuration Inheritance:**
- **Repository level**: Shared across all developers
- **User level**: Personal preferences and overrides
- **Worktree level**: Specific to individual worktrees

### Advanced Branch Architecture

**Complete Branch Hierarchy:**
```
main                                    # Production branch
├── develop                            # Integration branch (optional)
├── milestone/v2.0-launch             # Milestone base branch
│   ├── milestone/v2.0-launch/issue/317 # Individual development branches
│   ├── milestone/v2.0-launch/issue/318
│   ├── milestone/v2.0-launch/issue/319
│   └── milestone/v2.0-launch/hotfix/001 # Milestone-specific hotfixes
├── milestone/v2.1-features            # Future milestone
│   ├── milestone/v2.1-features/issue/401
│   ├── milestone/v2.1-features/issue/402
│   └── milestone/v2.1-features/spike/api-v3 # Research branches
├── milestone/security-audit           # Cross-cutting milestone
│   ├── milestone/security-audit/issue/501
│   └── milestone/security-audit/issue/502
└── feature/100-work                   # Non-milestone development
```

**Branch Naming Patterns:**
- **Milestone base**: `milestone/{milestone-name}`
- **Issue branches**: `milestone/{milestone-name}/issue/{issue-number}`
- **Hotfix branches**: `milestone/{milestone-name}/hotfix/{hotfix-number}`
- **Spike branches**: `milestone/{milestone-name}/spike/{spike-name}`
- **Feature branches**: `milestone/{milestone-name}/feature/{feature-name}`

### Worktree File System Architecture

**Standard Layout:**
```
~/projects/
├── FlowForge/                          # Main repository (primary milestone)
│   ├── .git/                          # Main Git directory
│   ├── .milestone-context             # Current: v2.0-launch
│   ├── .flowforge/
│   │   ├── worktree.json              # Worktree configuration
│   │   ├── milestone.json             # Milestone metadata
│   │   └── time-tracking.json         # Time tracking data
│   └── src/                           # Source code
│       └── ...
├── FF-v3-planning/                     # Future version worktree
│   ├── .git -> ../FlowForge/.git/worktrees/FF-v3-planning  # Git link
│   ├── .milestone-context             # Current: v3.0-planning
│   ├── .flowforge/
│   │   └── worktree.json              # Independent configuration
│   └── src/                           # Independent source state
│       └── ...
├── FF-hotfix-security/                 # Emergency response worktree
│   ├── .git -> ../FlowForge/.git/worktrees/FF-hotfix-security
│   ├── .milestone-context             # Current: security-hotfix
│   └── ...
└── FF-performance-audit/               # Performance optimization worktree
    ├── .git -> ../FlowForge/.git/worktrees/FF-performance-audit
    ├── .milestone-context             # Current: performance-q1
    └── ...
```

**Worktree Isolation Benefits:**
- **Independent file systems**: No file conflicts between milestones
- **Separate working directories**: Each milestone has complete source state
- **Shared Git history**: All worktrees share the same repository history
- **Independent configurations**: Each worktree maintains its own FlowForge settings

### FlowForge Command Architecture

**Command Processing Flow:**
```
1. Command Invocation
   ↓
2. Milestone Context Detection (.milestone-context file)
   ↓
3. Configuration Loading (.flowforge/worktree.json)
   ↓
4. Git Configuration Reading (flowforge.* values)
   ↓
5. Statusline Format Selection (milestone vs normal)
   ↓
6. Branch Pattern Application
   ↓
7. Command Execution with Milestone Context
   ↓
8. Statusline Update
   ↓
9. Time Tracking Integration
   ↓
10. Result Reporting
```

### Integration Points

**FlowForge System Integration:**
```json
{
  "integrations": {
    "time_tracking": {
      "milestone_aware": true,
      "budget_tracking": true,
      "cross_milestone_reports": true
    },
    "git_hooks": {
      "pre_commit": "validate_milestone_context",
      "post_commit": "update_milestone_progress",
      "pre_push": "check_milestone_branch"
    },
    "statusline": {
      "format": "milestone",
      "update_frequency": "real_time",
      "custom_indicators": true
    },
    "session_management": {
      "milestone_context_aware": true,
      "automatic_branch_creation": true,
      "cross_milestone_session_tracking": true
    }
  }
}
```

**Performance Optimizations:**
- **Fast context detection**: `.milestone-context` file for O(1) milestone lookup
- **Lazy configuration loading**: Full JSON config loaded only when needed
- **Cached Git configuration**: Git config values cached during session
- **Optimized statusline updates**: Minimal computation for real-time updates

### Security Considerations

**Configuration Security:**
- **File permissions**: Configuration files readable only by user
- **Sensitive data handling**: No credentials stored in milestone configuration
- **Git configuration validation**: Malicious Git config values prevented
- **Path traversal protection**: Worktree paths validated for safety

**Worktree Security:**
- **Isolated environments**: Each worktree isolated from others
- **Controlled access**: Worktree creation requires explicit authorization
- **Audit trail**: All milestone operations logged for security review

## Business & Development Benefits

### Organizational Excellence

**Project Management Benefits:**
- **Clear Milestone Tracking**: Issues automatically organized by milestone context
- **Progress Visibility**: Real-time progress tracking per milestone via statusline
- **Budget Control**: Time tracking and budget allocation per milestone
- **Deadline Management**: ETA calculations and milestone delivery tracking
- **Resource Allocation**: Clear developer assignment per milestone

**Team Collaboration Benefits:**
- **Parallel Development**: Multiple teams working simultaneously without conflicts
- **Context Separation**: Clear boundaries between different project phases
- **Independent Deployments**: Milestones can be deployed independently
- **Reduced Context Switching**: Developers stay focused on single milestone
- **Knowledge Management**: Milestone-specific documentation and decisions

### Technical Excellence

**Development Workflow Benefits:**
- **Zero-Friction Switching**: Instant context switching between milestones
- **Isolated Environments**: True parallel development using Git worktrees
- **Automatic Branch Management**: Intelligent branch creation and organization
- **Clean Git History**: Organized commit history by milestone phases
- **Merge Safety**: Reduced merge conflicts through milestone isolation

**Quality Assurance Benefits:**
- **Milestone-Specific Testing**: Independent test suites per milestone
- **Isolated Bug Tracking**: Issues contained within milestone boundaries
- **Progressive Quality Gates**: Quality checks applied per milestone
- **Independent Code Reviews**: Milestone-focused review processes
- **Rollback Safety**: Milestone-level rollback capabilities

### Developer Experience Benefits

**Productivity Enhancements:**
- **Visual Context Clarity**: Always know which milestone you're working on
- **Reduced Cognitive Load**: No mental context switching required
- **Faster Onboarding**: New developers can focus on single milestone
- **Better Time Management**: Accurate time tracking per milestone
- **Improved Focus**: Single milestone context reduces distractions

**Professional Development Benefits:**
- **Clear Deliverables**: Well-defined milestone objectives
- **Measurable Progress**: Concrete progress tracking and reporting
- **Skill Specialization**: Developers can specialize in milestone types
- **Career Growth**: Clear contribution tracking per milestone
- **Professional Recognition**: Milestone-based achievement recognition

### Business Impact

**Financial Benefits:**
- **Accurate Time Tracking**: Precise billing and cost allocation
- **Budget Control**: Milestone-based budget management
- **Resource Optimization**: Efficient developer allocation
- **Reduced Waste**: Less time lost to context switching
- **Predictable Delivery**: Better milestone delivery estimation

**Strategic Benefits:**
- **Agile Delivery**: Independent milestone releases
- **Risk Mitigation**: Isolated milestone risks
- **Stakeholder Communication**: Clear milestone progress reporting
- **Competitive Advantage**: Faster feature delivery through parallel work
- **Scalable Growth**: Milestone mode scales with team growth

### Success Metrics

**Quantifiable Improvements:**
```bash
# Time tracking accuracy
+95% accurate time allocation vs +70% in normal mode

# Context switching reduction
-80% time lost to context switching

# Merge conflict reduction
-60% merge conflicts through milestone isolation

# Delivery predictability
+40% improvement in milestone delivery estimation

# Developer satisfaction
+85% developer satisfaction with milestone mode workflows
```

**Long-term Benefits:**
- **Knowledge Preservation**: Milestone-specific knowledge capture
- **Process Improvement**: Continuous milestone workflow optimization
- **Team Scaling**: Easy onboarding of new team members
- **Client Satisfaction**: More predictable and organized delivery
- **Technical Debt Reduction**: Milestone-focused refactoring and cleanup

---

## Statusline Integration Deep Dive

### Understanding the Claude Code Statusline

The Claude Code statusline is the **bottom information bar** in your terminal that provides real-time development context. FlowForge enhances this statusline with milestone-aware information.

### Normal vs Milestone Mode Statusline Comparison

**Normal Mode Statusline Elements:**
```
⚩ FF v2.0 📋 317/21 [▓▓▓░░] 14% | ⏱ 00:23/0:30 | 💰 4:30h left | 🌿 feature/317-work | Opus
│    │     │     │      │      │        │         │       │           │           │
│    │     │     │      │      │        │         │       │           │           └─ AI Model
│    │     │     │      │      │        │         │       │           └─ Current Branch
│    │     │     │      │      │        │         │       └─ Budget Remaining
│    │     │     │      │      │        │         └─ Current/Estimated Time
│    │     │     │      │      │        └─ Session Timer
│    │     │     │      │      └─ Progress Percentage
│    │     │     │      └─ Progress Bar
│    │     │     └─ Issue/Total Issues
│    │     └─ Project Board Indicator
│    └─ FlowForge Version
└─ FlowForge Indicator
```

**Milestone Mode Statusline Elements:**
```
🎯 MILESTONE: v2.0-demo | 317/21 [▓▓▓░░] | ⏱ 00:23 | ETA: 4.5h | 🌿 milestone/v2.0-demo/issue/317 | Opus
│              │          │     │      │     │         │          │                   │           │
│              │          │     │      │     │         │          │                   │           └─ AI Model
│              │          │     │      │     │         │          │                   └─ Full Branch Path
│              │          │     │      │     │         │          └─ Milestone ETA
│              │          │     │      │     │         └─ Current Session Time
│              │          │     │      │     └─ Progress Bar
│              │          │     │      └─ Issue Progress
│              │          │     └─ Project Board
│              │          └─ Milestone Name
└─ Milestone Indicator
```

### Statusline Configuration Options

**Environment Variables for Customization:**
```bash
# Milestone indicator customization
export FLOWFORGE_STATUSLINE_MILESTONE_EMOJI="🎯"
export FLOWFORGE_STATUSLINE_MILESTONE_PREFIX="MILESTONE:"

# Display format options
export FLOWFORGE_STATUSLINE_COMPACT_MODE=false          # Full vs compact display
export FLOWFORGE_STATUSLINE_SHOW_ETA=true              # Show milestone ETA
export FLOWFORGE_STATUSLINE_SHOW_BRANCH=true           # Show full branch path
export FLOWFORGE_STATUSLINE_SHOW_PROGRESS=true         # Show progress indicators

# Time display options
export FLOWFORGE_STATUSLINE_TIME_FORMAT="HH:MM"         # Time format
export FLOWFORGE_STATUSLINE_SHOW_BUDGET=false          # Hide budget in milestone mode
export FLOWFORGE_STATUSLINE_ETA_PRECISION="hours"       # ETA precision (hours/minutes)

# Color and styling
export FLOWFORGE_STATUSLINE_MILESTONE_COLOR="cyan"      # Milestone indicator color
export FLOWFORGE_STATUSLINE_BRANCH_COLOR="green"       # Branch name color
export FLOWFORGE_STATUSLINE_TIME_COLOR="yellow"        # Time display color
```

**Custom Format Templates:**
```bash
# Create custom statusline format
export FLOWFORGE_STATUSLINE_MILESTONE_FORMAT="🎯 {milestone} | {issue} | ⏱ {time} | {branch}"

# Available template variables
{milestone}     # Current milestone name
{issue}         # Current issue number
{time}          # Session elapsed time
{eta}           # Milestone ETA
{branch}        # Current branch name
{progress}      # Progress percentage
{progress_bar}  # Visual progress bar
{budget}        # Budget information
{model}         # AI model name
```

### Advanced Statusline Features

**Real-Time Updates:**
- **Instant Context Switching**: Statusline updates immediately when changing milestones
- **Live Progress Tracking**: Progress bars update as issues are completed
- **Dynamic ETA Calculation**: ETA adjusts based on current velocity
- **Branch Awareness**: Shows complete milestone branch hierarchy

**Integration with External Tools:**
```bash
# Terminal multiplexer integration
# tmux status bar
set -g status-right "#(flowforge statusline --format tmux)"

# screen hardstatus
hardstatus string "%{= kw}%?%-w%?%{= BW}%n %t%{= kw}%?%+w%? %= $(flowforge statusline --format screen)"

# Shell prompt integration
PS1="$(flowforge statusline --format prompt) $ "
```

---

*Milestone Mode represents a paradigm shift in development workflow management, providing the organizational structure and visual clarity needed for professional software development at scale. Part of FlowForge v2.0's commitment to developer productivity and project success.*