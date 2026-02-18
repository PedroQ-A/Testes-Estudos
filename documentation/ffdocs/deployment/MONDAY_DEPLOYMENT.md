# 🚀 FlowForge Monday Deployment Guide
## Emergency Team Deployment - 6 Developers

**Date**: Monday, 2025-09-01  
**Version**: 2.0.3-fixed  
**Priority**: CRITICAL  
**Time Window**: 9:00 AM - 10:00 AM

---

## 🚨 CRITICAL: The 91-File Issue is FIXED!

### What Was Wrong
- Old installer copied ALL FlowForge files (91+ files)
- FF-on-FF detection wasn't working
- Missing .gitignore patterns caused commit pollution

### What's Fixed (v2.0.3)
- ✅ Smart FF-on-FF detection (exits gracefully)
- ✅ Team mode installs only 15 essential files
- ✅ Auto-configures .gitignore properly
- ✅ Package size reduced from MB to 164KB

---

## 📦 Deployment Package Contents

```
flowforge-team-v2.0.3-20250901.tar.gz (164KB)
├── deploy.sh                              # One-click installer
├── install-flowforge-portable-v2.0.3.sh   # Fixed installer
├── validate.sh                            # Health checker
├── run_ff_command.sh                      # Command runner
├── commands/flowforge/                    # Essential commands only (4)
├── scripts/                               # Minimal scripts (2)
├── .flowforge/RULES.md                    # Development rules
├── gitignore-template.txt                 # GitIgnore patterns
└── README-TEAM.md                         # Team documentation
```

---

## 🎯 Deployment Steps for Each Developer

### Step 1: Create Deployment Package (Team Lead)
```bash
# Run once on FlowForge source
cd /path/to/FlowForge
./scripts/team-deployment-monday.sh

# Package created at:
# deployments/flowforge-team-v2.0.3-20250901.tar.gz
```

### Step 2: Distribute to 6 Developers
```bash
# Option A: Via shared drive
cp deployments/flowforge-team-v2.0.3-*.tar.gz /shared/drive/

# Option B: Via SCP
for dev in dev1 dev2 dev3 dev4 dev5 dev6; do
    scp deployments/flowforge-team-v2.0.3-*.tar.gz $dev@machine:/tmp/
done

# Option C: Via Slack/Email
# Share the 164KB package file directly
```

### Step 3: Each Developer Installs (5 minutes)
```bash
# 1. Extract package
cd /tmp
tar xzf flowforge-team-v2.0.3-*.tar.gz

# 2. Navigate to Vue2 project
cd /path/to/vue2-project

# 3. Run deployment
bash /tmp/flowforge-team-deploy-*/flowforge-team/deploy.sh

# 4. Verify installation
bash /tmp/flowforge-team-deploy-*/flowforge-team/validate.sh
```

### Step 4: Start Using FlowForge
```bash
# Begin work session
./run_ff_command.sh flowforge:session:start

# Get help
./run_ff_command.sh flowforge:help
```

---

## ⚠️ IMPORTANT: Deployment Scenarios

### Scenario 1: Vue2 Project Developer (CORRECT)
```bash
cd /path/to/vue2-project
bash /path/to/deploy.sh
# ✅ Installs minimal FlowForge
# ✅ No commits needed
```

### Scenario 2: FlowForge Developer (WRONG!)
```bash
cd /path/to/FlowForge  # The FF source itself
bash /path/to/deploy.sh
# ❌ ERROR: FF-on-FF detected!
# ❌ Installation blocked
# ✅ No files created
```

### Scenario 3: Fixing 91-File Issue
If a developer already has the 91-file problem:
```bash
# 1. Reset the unwanted files
git reset HEAD -- commands/ .flowforge/ run_ff_command.sh

# 2. Update .gitignore
cat /path/to/gitignore-template.txt >> .gitignore

# 3. Clean up
rm -rf commands/flowforge .flowforge run_ff_command.sh

# 4. Install fresh with v2.0.3
bash /path/to/deploy.sh
```

---

## 🏥 Health Checks

### Pre-Deployment Check (Team Lead)
```bash
# On FlowForge source
./scripts/health-check.sh

Expected output:
✅ FlowForge SOURCE directory detected
✅ FF-on-FF mode (if using FF to develop FF)
```

### Post-Deployment Check (Each Developer)
```bash
# In Vue2 project after installation
./scripts/health-check.sh

Expected output:
✅ FlowForge INSTALLED - Version: 2.0.3
✅ Installation mode: team
✅ GitIgnore configured for FlowForge
✅ No uncommitted FlowForge files
```

---

## 🔧 Troubleshooting Guide

### Issue: "91 files to commit"
**Cause**: Used old installer  
**Fix**: Use v2.0.3 installer with `--mode=team`

### Issue: "You're trying to install FlowForge on itself!"
**Cause**: Running team installer on FF source  
**Fix**: This is correct behavior - FF developers don't need it

### Issue: "Command not found"
**Cause**: Not using relative path  
**Fix**: Always use `./run_ff_command.sh`

### Issue: "Permission denied"
**Cause**: Scripts not executable  
**Fix**: `chmod +x run_ff_command.sh`

---

## 📊 Success Metrics

### Before v2.0.3
- ❌ 91 files to commit
- ❌ MB-sized packages
- ❌ FF-on-FF confusion
- ❌ Manual .gitignore setup

### After v2.0.3
- ✅ 0 files to commit (all ignored)
- ✅ 164KB packages
- ✅ Smart FF-on-FF detection
- ✅ Automatic .gitignore setup

---

## 📞 Support Window

**Monday 9:00-10:00 AM**: Deployment support window
- Slack: #flowforge-deployment
- Lead: [Your Name]
- Backup: [Backup Name]

### Quick Fixes Channel
```bash
# Join support channel
/join #flowforge-deployment

# Common commands
!health    - Run health check
!validate  - Validate installation
!reset     - Reset instructions
!help      - Get help
```

---

## ✅ Deployment Checklist

### Team Lead (Before Monday)
- [ ] Run `team-deployment-monday.sh`
- [ ] Test package on clean environment
- [ ] Verify package size (<200KB)
- [ ] Share package with team
- [ ] Schedule support window

### Each Developer (Monday Morning)
- [ ] Download package
- [ ] Navigate to Vue2 project
- [ ] Run `deploy.sh`
- [ ] Run `validate.sh`
- [ ] Test with `flowforge:session:start`
- [ ] Join support channel if issues

---

## 🎉 Expected Outcome

By 10:00 AM Monday:
- 6 developers have FlowForge installed
- 0 Git commits needed
- All using v2.0.3 with team mode
- No 91-file issues
- Ready for productive development

---

## 📝 Notes

1. **FF-on-FF Protection**: The installer now detects and prevents installation on FlowForge itself
2. **Team Mode**: Installs only essential files (15 vs 91)
3. **GitIgnore**: Automatically configured to prevent commits
4. **Validation**: Built-in health checks ensure proper setup
5. **Support**: 1-hour window for any issues

---

**Document Version**: 1.0  
**Last Updated**: 2025-09-01  
**Author**: FlowForge Team  
**Status**: READY FOR DEPLOYMENT