# FlowForge v1.x to v2.0 Migration Guide

## Overview

This guide provides comprehensive instructions for migrating from FlowForge v1.x to the new v2.0 Hybrid Time Aggregation System. The migration preserves all historical time tracking data while upgrading to the new privacy-preserving, multi-layer resilient architecture.

**CRITICAL**: This migration directly impacts billing data. Follow all steps carefully to ensure zero data loss.

## Pre-Migration Checklist

### 1. Backup Everything
```bash
# Create complete backup of current FlowForge data
mkdir -p ~/flowforge-v1-backup/$(date +%Y%m%d)
cp -r .flowforge ~/flowforge-v1-backup/$(date +%Y%m%d)/
cp .task-times.json ~/flowforge-v1-backup/$(date +%Y%m%d)/ 2>/dev/null || true
cp *.md ~/flowforge-v1-backup/$(date +%Y%m%d)/ 2>/dev/null || true

# Verify backup integrity
cd ~/flowforge-v1-backup/$(date +%Y%m%d)/
find . -name "*.json" -exec jq empty {} \; && echo "✅ JSON files valid"
```

### 2. Audit Current Data
```bash
# Generate v1.x final report
flowforge:tasks --status
flowforge:report:generate --type final_v1_audit --output v1-final-audit.md

# Document active sessions
flowforge:session:status --detailed > pre-migration-sessions.log

# Calculate total billable hours for verification
jq -r '.[] | select(.status == "completed") | .total_time' .task-times.json | \
  awk '{sum += $1} END {print "Total v1.x billable hours:", sum}'
```

### 3. Environment Verification
```bash
# Check system requirements
node --version    # Requires Node.js 18+
git --version     # Requires Git 2.30+
jq --version      # Requires jq 1.6+

# Check disk space (v2.0 needs ~200MB additional)
df -h .

# Verify write permissions
touch .flowforge-migration-test && rm .flowforge-migration-test || echo "❌ Permission issue"
```

### 4. Team Coordination
- [ ] Notify all team members of migration window
- [ ] Ensure all active sessions are ended (`flowforge:session:end`)
- [ ] Confirm all recent work is committed to git
- [ ] Schedule 30-minute maintenance window

## Migration Process

### Step 1: Download FlowForge v2.0

```bash
# Download v2.0 migration tools
curl -sSL https://get.flowforge.dev/v2.0/migrate.sh -o migrate-to-v2.sh
chmod +x migrate-to-v2.sh

# Verify migration script integrity
sha256sum migrate-to-v2.sh
# Expected: a1b2c3d4e5f6... (check against official documentation)
```

### Step 2: Run Migration Analysis

```bash
# Analyze current installation for migration compatibility
./migrate-to-v2.sh --analyze

# Expected output:
# ✅ FlowForge v1.x detected (version 1.3.71)
# ✅ Time tracking data found (.task-times.json)
# ✅ Historical data: 245 tasks, 1,234.5 hours
# ⚠️  Markdown reports found (will be converted to JSON)
# ⚠️  YAML config found (will be converted to JSON)
# ✅ Git repository detected
# ✅ System requirements met
# 
# Migration Ready: YES
# Estimated time: 5-10 minutes
# Data to migrate: 12.3 MB
```

### Step 3: Execute Migration

```bash
# Run the migration (with dry-run first)
./migrate-to-v2.sh --dry-run

# Review dry-run output, then run actual migration
./migrate-to-v2.sh --migrate --preserve-originals

# Migration output:
# [2025-09-05 10:00:00] Starting FlowForge v1.x to v2.0 migration
# [2025-09-05 10:00:01] ✅ Backing up v1.x data to .flowforge-v1-backup/
# [2025-09-05 10:00:02] ✅ Creating v2.0 directory structure
# [2025-09-05 10:00:03] 🔄 Migrating .task-times.json to user data format
# [2025-09-05 10:00:04] 🔄 Converting markdown reports to JSON format
# [2025-09-05 10:00:05] 🔄 Converting YAML configuration to JSON format
# [2025-09-05 10:00:06] 🔄 Installing v2.0 git hooks
# [2025-09-05 10:00:07] 🔄 Setting up background daemon
# [2025-09-05 10:00:08] ✅ Validating migrated data integrity
# [2025-09-05 10:00:09] ✅ Generating migration report
# [2025-09-05 10:00:10] ✅ Migration completed successfully!
```

### Step 4: Verify Migration

```bash
# Verify v2.0 installation
flowforge:version:check
# Expected: FlowForge v2.0.0 - Hybrid Time Aggregation System

# Verify migrated data integrity
flowforge:data:validate --comprehensive
# Expected: ✅ All documents valid, 0 errors found

# Compare pre/post migration totals
jq -r '.content.summary.total_billable_hours' .flowforge/user/$(whoami)/time/current.json
# Should match v1.x total from Step 2 audit

# Test aggregation system
flowforge:time:aggregate --test
# Expected: ✅ Aggregation successful, team summaries generated
```

## Post-Migration Configuration

### Step 1: Configure Privacy Settings

```bash
# Set privacy preferences (user-specific)
flowforge:privacy:configure

# Interactive configuration:
# Privacy Level: [conservative|balanced|transparent] balanced
# Share daily totals? [y/n] y
# Share session count? [y/n] n
# Time rounding: [5|15|30|60 minutes] 15
# Configuration saved to .flowforge/user/$(whoami)/config.json
```

### Step 2: Configure Team Aggregation

```bash
# Configure team aggregation settings (one-time, team lead only)
flowforge:team:configure

# Interactive configuration:
# Team name: Development Team
# Aggregation interval: [1|5|15 minutes] 5
# Backup retention: [30|60|90 days] 90
# Enable CI/CD recovery? [y/n] y
# Configuration saved to .flowforge/team/config.json
```

### Step 3: Set Up Provider Integrations

```bash
# Configure GitHub integration (if previously used)
flowforge:providers:configure github
# GitHub repository: company/project
# Sync issues: [y/n] y
# Sync pull requests: [y/n] y
# Token source: [environment|file] environment

# Configure additional providers as needed
flowforge:providers:configure notion  # Optional
flowforge:providers:configure slack   # Optional

# Test all configured providers
flowforge:providers:test-connection
```

### Step 4: Initialize Background Services

```bash
# Start background daemon (Linux/macOS)
flowforge:daemon:start

# Verify daemon status
flowforge:daemon:status
# Expected: ✅ Daemon running (PID: 12345), queue empty, health: good

# Enable daemon auto-start
flowforge:daemon:enable-autostart
```

## Team Migration Coordination

### For Team Leaders

```bash
# Generate team migration status
flowforge:team:migration-status

# Expected output:
# Team Migration Status
# =====================
# Total developers: 5
# Migrated to v2.0: 3
# Still on v1.x: 2 (alice, bob)
# Aggregation ready: No (waiting for alice, bob)
# 
# Next steps:
# 1. Coordinate with alice and bob for migration
# 2. Once all migrated, enable team aggregation
# 3. Set up team billing reports
```

### For Team Members

```bash
# Check if team aggregation is ready
flowforge:team:status

# Join team aggregation (after individual migration)
flowforge:team:join
# This enables your time data to be aggregated into team reports
```

## Verification and Testing

### Data Integrity Verification

```bash
# Comprehensive data integrity check
flowforge:migration:verify --detailed

# Expected output:
# FlowForge v2.0 Migration Verification
# ===================================
# 
# Historical Data:
# ✅ 245 tasks migrated successfully
# ✅ 1,234.5 hours preserved (100% accuracy)
# ✅ 156 days of history maintained
# ✅ All issue references preserved
# 
# Data Structure:
# ✅ User data isolated (.flowforge/user/username/)
# ✅ Team summaries created (.flowforge/team/summaries/)
# ✅ JSON schemas valid for all documents
# ✅ Privacy settings applied correctly
# 
# System Integration:
# ✅ Git hooks installed and working
# ✅ Background daemon running
# ✅ Provider integrations functional
# ✅ Aggregation pipeline operational
# 
# Overall Status: ✅ MIGRATION SUCCESSFUL
```

### Functionality Testing

```bash
# Test basic time tracking workflow
flowforge:session:start 999 "Test v2.0 functionality"
# Work for a few minutes
flowforge:session:end "Migration testing complete"

# Verify data flows correctly
flowforge:time:status
flowforge:team:summary --latest

# Test privacy preservation
flowforge:privacy:preview --show-shared-data
# Should show aggregated data only, no private details

# Test resilience layers
flowforge:resilience:test --all-layers
# Expected: ✅ All 4 resilience layers functional
```

## Troubleshooting Common Issues

### Issue 1: Migration Script Fails

**Symptoms**: Migration script exits with error
```bash
ERROR: Migration failed at step 3 (converting markdown reports)
```

**Solution**:
```bash
# Check for corrupted markdown files
find . -name "*.md" -exec head -1 {} \; -exec echo {} \;

# Remove or fix corrupted files
mv corrupted-report.md corrupted-report.md.backup

# Re-run migration
./migrate-to-v2.sh --migrate --skip-step 3 --manual-markdown-conversion
```

### Issue 2: Data Totals Don't Match

**Symptoms**: v2.0 total hours differ from v1.x
```bash
v1.x total: 1,234.5 hours
v2.0 total: 1,231.2 hours (missing 3.3 hours)
```

**Solution**:
```bash
# Generate detailed migration audit
flowforge:migration:audit --missing-data

# Check for orphaned sessions
grep -r "status.*active" ~/flowforge-v1-backup/$(date +%Y%m%d)/.task-times.json

# Manually recover missing sessions
flowforge:migration:recover --from-backup ~/flowforge-v1-backup/$(date +%Y%m%d)/
```

### Issue 3: Team Aggregation Not Working

**Symptoms**: Team summaries empty or not generating
```bash
flowforge:team:summary
ERROR: No team data available
```

**Solution**:
```bash
# Check team configuration
flowforge:team:diagnose

# Verify all team members migrated
flowforge:team:members --migration-status

# Force aggregation
flowforge:time:aggregate --force --comprehensive

# Check git hooks installation
ls -la .git/hooks/pre-commit
```

### Issue 4: Privacy Settings Too Restrictive

**Symptoms**: Team reports missing expected data
```bash
Team billing hours: 0 (expected ~40 hours/week)
```

**Solution**:
```bash
# Check privacy settings
flowforge:privacy:audit --show-settings

# Adjust privacy level
flowforge:privacy:configure --level balanced

# Regenerate aggregation with new settings
flowforge:time:aggregate --regenerate --apply-privacy-changes
```

## Rollback Procedure (Emergency Only)

If migration fails catastrophically, rollback to v1.x:

```bash
# EMERGENCY ROLLBACK - Use only if v2.0 migration fails completely

# 1. Stop v2.0 services
flowforge:daemon:stop
flowforge:system:disable

# 2. Restore v1.x backup
rm -rf .flowforge
cp -r ~/flowforge-v1-backup/$(date +%Y%m%d)/.flowforge .
cp ~/flowforge-v1-backup/$(date +%Y%m%d)/.task-times.json .

# 3. Reinstall v1.x
curl -sSL https://get.flowforge.dev/v1.x/install.sh | bash

# 4. Verify restoration
flowforge:tasks --status
flowforge:report:generate --verify

# 5. Report rollback
curl -X POST https://api.flowforge.dev/migration/rollback \
  -d "reason=migration_failure&version=v1.x_restored"
```

## Post-Migration Best Practices

### 1. Monitor System Health

```bash
# Daily health checks (first week after migration)
flowforge:health:check --comprehensive
flowforge:resilience:status --all-layers
flowforge:team:summary --validate

# Weekly data integrity checks
flowforge:data:validate --deep-scan
flowforge:privacy:audit --compliance-check
```

### 2. Team Training

```bash
# Generate team training materials
flowforge:docs:generate --topic migration_changes
flowforge:examples:generate --v2-workflows

# Schedule team training session covering:
# - New privacy controls
# - Team aggregation features  
# - Multi-layer resilience benefits
# - Updated command syntax
```

### 3. Performance Monitoring

```bash
# Monitor aggregation performance
flowforge:metrics:report --aggregation-timing
# Expected: < 500ms for git hook aggregation

# Monitor storage usage
du -sh .flowforge/
# Expected: Similar to v1.x, may be slightly larger initially

# Monitor daemon health
flowforge:daemon:metrics --weekly-report
```

## Success Criteria

Migration is considered successful when:

- [ ] ✅ 100% of historical time data preserved (verify with audit)
- [ ] ✅ All team members successfully migrated
- [ ] ✅ Team aggregation generating accurate reports
- [ ] ✅ Privacy settings configured and working
- [ ] ✅ All 4 resilience layers operational  
- [ ] ✅ Provider integrations functional
- [ ] ✅ Git workflow unchanged for developers
- [ ] ✅ Billing reports generation working
- [ ] ✅ No data corruption detected
- [ ] ✅ Performance meets or exceeds v1.x

## Support and Resources

### Documentation
- [FlowForge v2.0 User Guide](../user-guide.md)
- [Team Onboarding Guide](../team-onboarding-guide.md)
- [Troubleshooting Runbook](../troubleshooting-runbook.md)
- [Architecture Decision Records](../architecture/decisions/)

### Getting Help
- **Migration Issues**: `support+migration@flowforge.dev`
- **Data Recovery**: `support+recovery@flowforge.dev`
- **Community Support**: [GitHub Discussions](https://github.com/JustCode-CruzAlex/FlowForge/discussions)
- **Emergency Support**: `emergency@flowforge.dev` (data loss scenarios)

### Migration Checklist

Print and complete this checklist:

**Pre-Migration**
- [ ] Complete data backup
- [ ] Run migration analysis
- [ ] Coordinate with team
- [ ] Verify system requirements

**Migration**
- [ ] Run dry-run migration
- [ ] Execute actual migration
- [ ] Verify data integrity
- [ ] Test basic functionality

**Post-Migration**
- [ ] Configure privacy settings
- [ ] Set up team aggregation
- [ ] Configure provider integrations
- [ ] Initialize background services

**Verification**
- [ ] Run comprehensive verification
- [ ] Test all workflows
- [ ] Monitor for 48 hours
- [ ] Train team members

**Sign-off**
- [ ] Team lead approval: ________________
- [ ] Data integrity confirmed: ___________
- [ ] Migration date: ___________________

## Conclusion

The FlowForge v1.x to v2.0 migration brings significant improvements in reliability, privacy, and team collaboration while preserving all historical billing data. Following this guide ensures a smooth transition with zero data loss and minimal disruption to development workflows.

**Remember**: TIME = MONEY. The migration preserves every minute of tracked time while dramatically improving the system's ability to protect and aggregate that valuable billing data.

---
*FlowForge v2.0 Migration Guide*  
*Version 1.0 - Complete migration process*  
*Generated: 2025-09-05*