# NPX Quick Start Guide

## Overview

FlowForge supports **NPX execution mode**, allowing you to try the complete framework instantly without any installation. This zero-commitment approach lets developers evaluate FlowForge and start using it immediately.

## Quick Start Examples

### 🚀 Try FlowForge Right Now (30 seconds)

```bash
# Step 1: Initialize FlowForge in your project
npx @flowforge/cli init

# Step 2: Start your first productive session
npx @flowforge/cli run session:start

# Step 3: Explore available commands
npx @flowforge/cli help
```

### Essential NPX Commands

```bash
# Initialize FlowForge (sets up project structure)
npx @flowforge/cli init

# Check version and execution mode
npx @flowforge/cli version

# List all available commands
npx @flowforge/cli list

# View AI agents (Rule #35 compliance)
npx @flowforge/cli agents

# Run specific FlowForge commands
npx @flowforge/cli run session:start [issue-number]
npx @flowforge/cli run dev:status
npx @flowforge/cli run project:plan feature-name

# Get comprehensive help
npx @flowforge/cli help
```

## Three Execution Modes

FlowForge adapts to your preferred workflow with three execution modes:

### 1. NPX Mode (Zero Installation)
```bash
npx @flowforge/cli <command>
```

**Benefits:**
- ✅ **Zero Commitment** - Try without installing
- ✅ **Always Latest** - NPX fetches the newest version
- ✅ **Full Functionality** - Complete FlowForge experience
- ✅ **Cross-Project** - Use anywhere without setup
- ✅ **Demo-Friendly** - Perfect for presentations

**Best For:** First-time users, demos, quick trials, continuous latest version

### 2. Global Installation
```bash
# One-time installation
npm install -g @flowforge/cli

# Then use anywhere
flowforge init
flowforge run session:start
```

**Benefits:**
- ✅ **System-Wide Access** - Available in all projects
- ✅ **Faster Execution** - No download time
- ✅ **Offline Ready** - Works without internet
- ✅ **Short Commands** - Use `ff` alias
- ✅ **Consistent Version** - Controlled updates

**Best For:** Regular FlowForge users, multiple projects, stable environments

### 3. Local Installation
```bash
# Add to specific project
npm install @flowforge/cli

# Use with npx locally
npx flowforge init
```

**Benefits:**
- ✅ **Project-Specific** - Version tied to project
- ✅ **Team Consistency** - Same version for all team members
- ✅ **Package.json** - Managed as project dependency
- ✅ **CI/CD Ready** - Reproducible builds

**Best For:** Team projects, specific version requirements, CI/CD pipelines

## Detailed Usage Examples

### Getting Started Workflow

```bash
# 1. Navigate to your project
cd my-awesome-project

# 2. Initialize FlowForge (creates .flowforge/, commands/, etc.)
npx @flowforge/cli init

# 3. Check what was installed
npx @flowforge/cli version

# 4. Start your first session
npx @flowforge/cli run session:start

# 5. See available commands (now local commands work too)
npx @flowforge/cli list
```

### Development Workflow with NPX

```bash
# Morning: Start your development day
npx @flowforge/cli run session:start 123

# Work on your code...
# FlowForge tracks time automatically

# Need to check project status?
npx @flowforge/cli run dev:status

# Run tests following TDD (Rule #3)
npx @flowforge/cli run dev:tdd new-feature

# Check rule compliance
npx @flowforge/cli run dev:checkrules

# End of day: Complete session
npx @flowforge/cli run session:end "Implemented user authentication"
```

### Project Management with NPX

```bash
# Plan a new feature
npx @flowforge/cli run project:plan user-dashboard

# View current tasks
npx @flowforge/cli run project:tasks

# Get task reports
npx @flowforge/cli run project:tasks --status=active

# Set up project initially
npx @flowforge/cli run project:setup
```

## NPX vs Installed: Feature Comparison

| Feature | NPX Mode | Global Install | Local Install |
|---------|----------|----------------|---------------|
| **Setup Time** | 0 seconds | ~30 seconds | ~10 seconds |
| **First Run Speed** | 5-10 seconds | <1 second | <1 second |
| **Subsequent Runs** | 2-3 seconds | <1 second | <1 second |
| **Always Latest** | ✅ Yes | Manual update | Manual update |
| **Offline Usage** | ❌ No | ✅ Yes | ✅ Yes |
| **Cross-Project** | ✅ Yes | ✅ Yes | ❌ No |
| **Team Consistency** | Version varies | Manual sync | ✅ Automatic |
| **CI/CD Ready** | ✅ Yes | Requires install | ✅ Yes |
| **Disk Usage** | 0 MB local | ~50 MB | ~50 MB |

## Common Use Cases

### 🎯 Demo and Evaluation
```bash
# Perfect for showing FlowForge to your team
cd demo-project
npx @flowforge/cli init
npx @flowforge/cli run session:start
# Show off the features!
```

### 🚀 Quick Project Setup
```bash
# New project? Get FlowForge running in 30 seconds
mkdir new-project && cd new-project
git init
npx @flowforge/cli init
npx @flowforge/cli run session:start
```

### 🔄 Continuous Latest Version
```bash
# Always use the newest FlowForge features
npx @flowforge/cli version  # Shows latest
npx @flowforge/cli run session:start
```

### 👥 Onboarding New Developers
```bash
# New team member? Zero setup time
npx @flowforge/cli init
npx @flowforge/cli agents  # Show the power of Rule #35
npx @flowforge/cli run help
```

## Performance Optimizations

### NPX Caching
NPX caches packages, making subsequent runs faster:

```bash
# First run: Downloads package (~5-10 seconds)
npx @flowforge/cli version

# Subsequent runs: Uses cache (~2-3 seconds)
npx @flowforge/cli help
```

### Pre-warming NPX Cache
```bash
# Pre-download FlowForge for faster demos
npx @flowforge/cli version > /dev/null 2>&1
```

### Hybrid Approach
```bash
# Use NPX for trying, then install for regular use
npx @flowforge/cli init  # Try it first

# If you like it:
npm install -g @flowforge/cli
```

## Troubleshooting NPX Mode

### Issue: "Command not found"
```bash
# Verify NPX is installed
npx --version

# Try with explicit version
npx @flowforge/cli@latest version
```

### Issue: "Slow first execution"
```bash
# This is normal - NPX downloads the package
# Use cache warming for demos:
npx @flowforge/cli version > /dev/null 2>&1
```

### Issue: "Different version than expected"
```bash
# Clear NPX cache
npx clear-npx-cache

# Or force latest version
npx @flowforge/cli@latest version
```

### Issue: "FlowForge commands not available"
```bash
# Make sure you've run init first
npx @flowforge/cli init

# Then local commands become available
npx @flowforge/cli run help
```

## Advanced NPX Usage

### Version Pinning
```bash
# Use specific version
npx @flowforge/cli@2.0.3 init

# Always use latest
npx @flowforge/cli@latest init
```

### Environment Variables
```bash
# Enable debug mode
FLOWFORGE_DEBUG=true npx @flowforge/cli version

# Set custom config
FLOWFORGE_CONFIG_PATH=/custom/path npx @flowforge/cli init
```

### Combining with Other Tools
```bash
# Use in scripts
#!/bin/bash
set -e
npx @flowforge/cli init
npx @flowforge/cli run project:setup
```

## Migration Paths

### From NPX to Global
```bash
# After trying with NPX, install globally
npm install -g @flowforge/cli

# Now use shorter commands
flowforge version
ff run help  # Even shorter with alias
```

### From NPX to Local
```bash
# Add to your project
npm install --save-dev @flowforge/cli

# Add to package.json scripts
{
  "scripts": {
    "ff": "flowforge",
    "start-session": "flowforge run session:start"
  }
}

# Use via npm scripts
npm run start-session
```

## Best Practices

### 1. Demo Preparation
```bash
# Pre-warm cache before presentations
npx @flowforge/cli version > /dev/null 2>&1
```

### 2. Quick Evaluation
```bash
# Test FlowForge in throwaway directory
mkdir ff-test && cd ff-test
npx @flowforge/cli init
# Try features, then rm -rf ff-test
```

### 3. Team Onboarding
```bash
# Have new developers start with NPX
npx @flowforge/cli init
npx @flowforge/cli run help

# Then decide on installation strategy
```

### 4. CI/CD Integration
```bash
# NPX works great in CI
- name: Initialize FlowForge
  run: npx @flowforge/cli init

- name: Run compliance check
  run: npx @flowforge/cli run dev:checkrules
```

## Security Considerations

### Package Verification
```bash
# Verify you're getting the official package
npx @flowforge/cli version
# Should show: "@flowforge/cli" package

# Check NPM page
open https://www.npmjs.com/package/@flowforge/cli
```

### Corporate Networks
```bash
# If behind proxy, NPX inherits npm settings
npm config list
# Verify registry and proxy settings
```

## Summary

NPX mode offers the **fastest path to FlowForge productivity**:

✅ **Zero Setup Time** - Start using FlowForge in 30 seconds  
✅ **Always Current** - NPX fetches the latest version automatically  
✅ **Full Features** - Complete FlowForge experience  
✅ **Risk-Free Trial** - No commitment, no installation  
✅ **Perfect for Demos** - Show FlowForge power instantly  

**Try it now:**
```bash
npx @flowforge/cli init
```

The NPX approach embodies FlowForge's **zero-friction philosophy** - removing barriers between you and productive development!