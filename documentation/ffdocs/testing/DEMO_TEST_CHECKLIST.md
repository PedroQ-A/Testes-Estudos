# FlowForge Installation Wizard Demo - Testing Checklist

## Overview

This document provides comprehensive testing instructions for the FlowForge Installation Wizard demo for Monday's presentation to 6 developers.

**Demo Components:**
- Interactive Installation Wizard (Issue #316)
- NPX Package Distribution
- Visual Demo Flow with Effects
- Rollback & Error Handling
- Progress Tracking & Statistics

## Pre-Demo Setup

### Environment Requirements

**Host Machine Specifications:**
- **OS**: macOS/Linux (Windows not supported)
- **Node.js**: v18+ (recommended v20.10.0)
- **NPM**: v10+ 
- **Git**: v2.40+
- **Shell**: bash/zsh
- **Memory**: 4GB+ available
- **Disk**: 500MB+ free space
- **Network**: Stable internet for NPX downloads

### Pre-Demo Checklist (Complete 30 minutes before)

```bash
# 1. Verify environment
node --version    # Should be v18+
npm --version     # Should be v10+
git --version     # Should be v2.40+

# 2. Test NPX installation (critical!)
npx @flowforge/installer --version
# Expected: v2.0.x

# 3. Clean test directory
rm -rf /tmp/demo-test
mkdir /tmp/demo-test
cd /tmp/demo-test

# 4. Test basic installation flow
npx @flowforge/installer --demo
# Should complete successfully in 2-3 minutes

# 5. Verify installation files
ls -la flowforge-project/
# Should show: .flowforge/, commands/, hooks/, etc.
```

## Demo Flow Testing

### Test Scenario 1: Standard Demo Mode

**Purpose**: Verify the enhanced demo presentation works flawlessly

**Steps**:
```bash
# Clean environment
rm -rf demo-project && mkdir demo-project && cd demo-project

# Run demo mode
npx @flowforge/installer --demo --project-name="Demo Project"

# Expected timeline: 2-3 minutes
```

**Expected Results**:
✅ **Animated Banner**: FlowForge logo with effects  
✅ **Environment Detection**: 7 system checks (OS, Node, NPM, Git, Shell, Docker, Python)  
✅ **Feature Selection**: 8 available features displayed with checkboxes  
✅ **Progress Animation**: Multi-step progress bars with percentages  
✅ **Installation Simulation**: Realistic timing and visual feedback  
✅ **Success Celebration**: Animated celebration with emojis  
✅ **Statistics Display**: Component counts, duration, disk usage  

**Key Metrics to Verify**:
- Total duration: 120-180 seconds
- Components shown: 8 total
- Features selected: 5 (time-tracking, git-hooks, testing, project-management, api-designer)
- Final success rate: 100%

### Test Scenario 2: Interactive Mode

**Purpose**: Test real installation for attendee hands-on

**Steps**:
```bash
# New directory
mkdir interactive-test && cd interactive-test

# Run interactive mode
npx @flowforge/installer

# Select features manually:
# ✓ Time Tracking
# ✓ Git Hooks  
# ✓ Testing Framework
# ○ Documentation (skip for demo)
# ✓ Project Management
# ○ Database Tools (skip for demo)
# ✓ API Designer
# ○ Architecture Tools (skip for demo)
```

**Expected Results**:
✅ **Real Installation**: Actual files and directories created  
✅ **Working Commands**: `/flowforge:session:start` functional  
✅ **Git Integration**: Hooks installed and working  
✅ **Configuration Files**: `.flowforge/` directory with proper config  

### Test Scenario 3: Error Simulation

**Purpose**: Demonstrate robust error handling and rollback

**Steps**:
```bash
# Create problematic environment
mkdir error-test && cd error-test

# Run with simulated failure
npx @flowforge/installer --demo --simulate-failure

# Or manually trigger permission error
sudo mkdir restricted && chmod 000 restricted
npx @flowforge/installer --target-dir=restricted/
```

**Expected Results**:
✅ **Error Detection**: Clear error message displayed  
✅ **Rollback Triggered**: "Rolling back installation..." message  
✅ **Clean State**: No partial installation artifacts  
✅ **Recovery Instructions**: User guidance provided  

## Performance Testing

### Load Testing
```bash
# Test multiple concurrent installations
for i in {1..5}; do
  mkdir test-$i && cd test-$i
  npx @flowforge/installer --demo &
  cd ..
done
wait

# Verify all completed successfully
```

### Memory Usage
```bash
# Monitor during installation
npx @flowforge/installer --demo &
PID=$!
while kill -0 $PID 2>/dev/null; do
  ps -p $PID -o pid,ppid,%mem,%cpu,cmd
  sleep 1
done
```

**Performance Targets**:
- **Memory Usage**: <200MB peak
- **CPU Usage**: <50% sustained
- **Installation Time**: 120-180 seconds (demo mode)
- **Disk Usage**: <50MB final footprint

## Integration Testing

### NPX Package Distribution
```bash
# Test package discovery
npm view @flowforge/installer

# Test version resolution
npx @flowforge/installer --version

# Test direct execution
npx @flowforge/installer --help
```

### Git Integration
```bash
# After installation, verify hooks
cd flowforge-project
git init
git add .
git commit -m "test"  # Should trigger FlowForge hooks

# Verify commands work
ls -la .git/hooks/  # Should show FlowForge hooks
./run_ff_command.sh flowforge:session:start
```

### Cross-Platform Testing
```bash
# macOS (primary target)
uname -a  # Darwin
npx @flowforge/installer --demo

# Linux (secondary target)  
uname -a  # Linux
npx @flowforge/installer --demo

# Windows (should gracefully fail)
npx @flowforge/installer --demo
# Expected: "Unsupported platform: win32" error
```

## Demo Day Preparation

### 30 Minutes Before Demo

**Master Checklist**:
- [ ] **Environment verified** on presentation machine
- [ ] **NPX package accessible** and latest version
- [ ] **Demo project directory** cleaned and ready
- [ ] **Network connection** stable and tested
- [ ] **Screen sharing** configured and tested
- [ ] **Terminal settings** optimized (font size, colors)
- [ ] **Backup demo recordings** ready (if needed)

### 15 Minutes Before Demo

**Final Verification**:
```bash
# Quick smoke test
cd /tmp && rm -rf final-test && mkdir final-test && cd final-test
npx @flowforge/installer --demo
# Should complete in 2-3 minutes without issues
```

**Terminal Preparation**:
```bash
# Optimize for presentation
export PS1="$ "  # Clean prompt
clear
cd ~
mkdir demo-live && cd demo-live
```

## Demo Script & Talking Points

### Opening (30 seconds)
> "Today we're showcasing FlowForge's new zero-friction installation experience. With a single NPX command, developers can get a complete productivity environment in under 3 minutes."

### Environment Detection (45 seconds)
> "First, FlowForge intelligently detects your development environment. It checks for Node.js, Git, shell configuration, and optional tools like Docker and Python. This ensures compatibility before installation begins."

### Feature Selection (60 seconds)
> "Next, you can customize your FlowForge installation. We have 8 core components: time tracking, git hooks, testing framework, documentation tools, project management, database utilities, API designer, and architecture tools. For today's demo, we're selecting our recommended developer setup."

### Installation Progress (90 seconds)
> "Now watch the magic happen. FlowForge installs each component with real-time progress tracking. The installer is smart enough to handle dependencies and can rollback if anything goes wrong. Notice the beautiful progress animations and clear status messages."

### Success & Statistics (30 seconds)
> "Installation complete! FlowForge shows you exactly what was installed, how long it took, and how much disk space is used. You now have a fully configured development environment with time tracking, automated git hooks, and all the productivity tools you need."

### Live Demo (60 seconds)
> "Let's see it in action. We'll create a new project and show you how FlowForge manages your development workflow automatically."

## Troubleshooting Guide

### Common Issues

**Issue**: NPX package not found
```bash
# Solution: Clear NPM cache
npm cache clean --force
npx clear-npx-cache
npx @flowforge/installer --version
```

**Issue**: Permission denied errors
```bash
# Solution: Check directory permissions
ls -la $(dirname $(pwd))
chmod 755 .
```

**Issue**: Installation hangs
```bash
# Solution: Check network and kill
ps aux | grep installer
kill -9 <PID>
rm -rf .flowforge-install-*
```

**Issue**: Demo mode not working
```bash
# Solution: Force demo mode
npx @flowforge/installer --demo --force --verbose
```

### Emergency Backup Plans

**Plan A: Pre-recorded Demo**
- Have screen recording of successful installation
- 3-minute video showing complete flow
- Narrate live over recording

**Plan B: Static Screenshots**
- Key screens captured as slides
- Step through manually with explanations
- Focus on features and benefits

**Plan C: Code Walkthrough**
- Show installation wizard source code
- Explain architecture and design decisions
- Discuss testing approach and coverage

### Recovery Procedures

**Network Issues**:
```bash
# Use local package if available
npm pack @flowforge/installer
npx ./flowforge-installer-*.tgz --demo
```

**System Issues**:
```bash
# Switch to backup machine
# Run minimal installation
git clone https://github.com/JustCode-CruzAlex/FlowForge
cd FlowForge
./scripts/install-flowforge-portable.sh
```

## Post-Demo Testing

### Attendee Hands-On Session

**Guided Installation**:
```bash
# Provide to each attendee
mkdir flowforge-workshop && cd flowforge-workshop
npx @flowforge/installer --interactive

# Let them customize feature selection
# Verify successful installations
# Answer questions and debug issues
```

**Verification Script**:
```bash
#!/bin/bash
echo "FlowForge Installation Verification"
echo "=================================="

# Check directory structure
if [ -d ".flowforge" ]; then
    echo "✅ Configuration directory found"
else
    echo "❌ Configuration directory missing"
fi

# Check commands
if [ -f "run_ff_command.sh" ]; then
    echo "✅ Command runner found"
else
    echo "❌ Command runner missing"
fi

# Check git hooks
if [ -d ".git/hooks" ] && [ -f ".git/hooks/pre-commit" ]; then
    echo "✅ Git hooks installed"
else
    echo "⚠️  Git hooks not found (may not be git repo)"
fi

echo "Installation verification complete"
```

## Success Metrics

### Demo Success Criteria
- **✅ Installation Time**: <180 seconds
- **✅ Success Rate**: 100% for demo mode
- **✅ Visual Quality**: Smooth animations, clear progress
- **✅ Error Handling**: Graceful failure and recovery
- **✅ User Experience**: Intuitive and engaging

### Attendee Experience Metrics
- **✅ Setup Time**: <5 minutes per developer
- **✅ Success Rate**: >80% successful installations
- **✅ Feature Adoption**: >60% enable time tracking
- **✅ Engagement**: Questions and positive feedback
- **✅ Next Steps**: Interest in production deployment

## Quality Assurance Checklist

### Pre-Demo QA (Complete 1 hour before)
- [ ] **Full installation test** completed successfully
- [ ] **Demo mode timing** verified (2-3 minutes)
- [ ] **Visual effects** working on presentation setup
- [ ] **Error scenarios** tested and recovery confirmed
- [ ] **Cross-platform support** verified for attendee machines
- [ ] **Network dependencies** tested and cached locally
- [ ] **Backup plans** prepared and accessible
- [ ] **Troubleshooting guide** reviewed and ready

### During Demo QA
- [ ] **Monitor performance** during live demo
- [ ] **Watch for errors** and be ready with quick fixes
- [ ] **Track timing** to stay on schedule
- [ ] **Note audience questions** for post-demo discussion
- [ ] **Verify attendee success** during hands-on session

### Post-Demo QA
- [ ] **Collect feedback** from all 6 developers
- [ ] **Document issues** encountered during demo
- [ ] **Verify installations** are fully functional
- [ ] **Plan follow-up** for any unresolved issues
- [ ] **Update documentation** based on learnings

---

## Emergency Contacts

**Technical Issues**: Development team lead  
**Demo Coordination**: Project manager  
**Backup Demo**: Secondary presenter  

**Remember**: The goal is showcasing FlowForge's value, not perfect execution. Focus on the benefits and vision even if minor technical issues arise.

**Good luck with the demo! 🚀**