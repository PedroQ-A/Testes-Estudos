# Installation Guide

## Quick Install

```bash
# Clone the repository
git clone https://github.com/JustCode-CruzAlex/FlowForge.git
cd FlowForge

# Run installation script
./scripts/install-flowforge.sh

# Install all agents
./scripts/agent-manager.sh install
```

## Requirements

- Git 2.0+
- Bash 4.0+
- GitHub CLI (gh)
- jq (JSON processor)

## What Gets Installed

1. **Core Scripts** - Time tracking, position tracking, context preservation
2. **Commands** - All FlowForge commands for Claude Code
3. **Agents** - 12 specialized agents for different tasks
4. **Hooks** - Git hooks for rule enforcement
5. **Documentation** - Complete v2.0 documentation

## Verification

After installation, verify everything works:

```bash
# Check installation
./scripts/agent-manager.sh verify

# Test a command
./run_ff_command.sh flowforge:help
```

## Next Steps

- [First Session](./first-session.md) - Start your first work session
- [Core Concepts](./concepts.md) - Understand FlowForge principles