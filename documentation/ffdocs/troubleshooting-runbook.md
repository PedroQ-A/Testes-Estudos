# FlowForge v2.0 Troubleshooting Runbook

## Overview

This runbook provides systematic troubleshooting procedures for FlowForge v2.0's Hybrid Time Aggregation System. Since FlowForge's core mission is ensuring **TIME = MONEY**, any system issue directly impacts billing accuracy and developer productivity.

**Emergency Principle**: If time tracking stops working, developers stop getting paid. All issues are urgent.

## Emergency Response Procedures

### Critical: Complete Time Tracking Failure

**Symptoms**: No time tracking working across entire team
```bash
flowforge:time:status
# ERROR: Time tracking system unavailable
```

**Immediate Response (< 5 minutes)**:
```bash
# 1. Enable emergency manual tracking
flowforge:emergency:enable-manual-tracking

# 2. Notify team to use manual backup
echo "URGENT: Use manual time tracking until system restored" | \
  slack-cli --channel "#development" --urgent

# 3. Assess system status
flowforge:health:emergency-assessment

# 4. If critical: Escalate to emergency support
if [ $? -ne 0 ]; then
    curl -X POST "https://api.flowforge.dev/emergency" \
         -d "team=YOUR_TEAM&issue=complete_tracking_failure"
fi
```

### Critical: Billing Data Corruption

**Symptoms**: Reports showing impossible data (negative hours, future dates, etc.)
```bash
flowforge:billing:validate --comprehensive
# ERROR: Data integrity failures detected
```

**Immediate Response (< 2 minutes)**:
```bash
# 1. Stop all aggregation processes
flowforge:daemon:stop --emergency
systemctl stop flowforge-aggregation

# 2. Prevent further data corruption
chmod -w .flowforge/team/summaries/*.json

# 3. Restore from last known good backup
flowforge:recovery:restore --last-known-good --verify

# 4. Escalate immediately
curl -X POST "https://api.flowforge.dev/emergency" \
     -d "team=YOUR_TEAM&issue=data_corruption&severity=critical"
```

## Diagnostic Tools and Commands

### System Health Assessment

```bash
# Comprehensive system health check
flowforge:health:check --comprehensive

# Expected Output:
# FlowForge v2.0 System Health Report
# ===================================
# 
# 🟢 Core System:
# ✅ FlowForge v2.0.0 installed
# ✅ Git integration working
# ✅ File permissions correct
# ✅ Disk space sufficient (23% used)
# 
# 🟢 Time Tracking:
# ✅ User data directory accessible
# ✅ Current session tracking active
# ✅ JSON schemas valid
# ✅ Backup systems operational
# 
# 🟢 Aggregation System:
# ✅ Layer 1 (Git hooks): 99.2% success rate
# ✅ Layer 2 (Daemon): Running, 0 items in queue
# ✅ Layer 3 (CI/CD): Last run successful (2h ago)
# ✅ Layer 4 (Manual): Tools available
# 
# 🟡 Team Integration:
# ⚠️  2/5 team members active today
# ⚠️  Team summaries 15 minutes behind
# ✅ Privacy protection active
# ✅ Provider integrations working
```

### Layer-Specific Diagnostics

```bash
# Check each resilience layer individually
flowforge:layers:diagnose --all

# Layer 1 Diagnostics (Git Hooks):
flowforge:layers:diagnose --layer 1
# ✅ Git hooks installed correctly
# ✅ Pre-commit hook executable
# ⚠️  Hook execution time: 750ms (>500ms target)
# ✅ Error handling working
# ✅ Queue interface functional

# Layer 2 Diagnostics (Background Daemon):
flowforge:layers:diagnose --layer 2
# ✅ Daemon process running (PID: 12345)
# ✅ File watcher operational
# ✅ Queue processing active
# ⚠️  3 failed items in retry queue
# ✅ Health metrics updating

# Layer 3 Diagnostics (CI/CD):
flowforge:layers:diagnose --layer 3
# ✅ GitHub Actions workflow enabled
# ✅ Last run: 2 hours ago (successful)
# ⚠️  Detection sensitivity: 95% (target: >98%)
# ✅ Recovery procedures tested

# Layer 4 Diagnostics (Manual Tools):
flowforge:layers:diagnose --layer 4
# ✅ All recovery commands available
# ✅ Backup data accessible
# ✅ Manual procedures documented
# ✅ Emergency escalation configured
```

### Data Integrity Diagnostics

```bash
# Comprehensive data integrity check
flowforge:data:integrity --deep-scan

# Data Integrity Report
# =====================
# 
# 📊 User Data:
# • Files scanned: 1,247
# • JSON validity: 100%
# • Schema compliance: 100%
# • Checksum verification: ✅ All valid
# • Backup consistency: ✅ Verified
# 
# 📊 Team Data:
# • Aggregation files: 89
# • Mathematical consistency: ✅ Verified
# • Cross-reference accuracy: 99.98% (2 minor discrepancies)
# • Privacy compliance: ✅ No violations detected
# 
# 📊 System Data:
# • Configuration files: ✅ Valid
# • Schema versions: ✅ Current (v2.0.0)
# • Audit logs: ✅ Complete, no gaps
# • Recovery data: ✅ Available and tested
# 
# ⚠️  Issues Found:
# 1. Minor: User alice has 0.02 hour rounding discrepancy
# 2. Minor: Team summary for 2025-09-03 has stale timestamp
# 
# 🔧 Auto-Fixes Available:
# flowforge:data:fix --issue 1 --issue 2
```

## Common Issues and Solutions

### Issue 1: Time Tracking Not Working

#### Symptoms
```bash
flowforge:session:start 123 "Test work"
# ERROR: Unable to start time tracking session
```

#### Diagnosis Steps

**Step 1: Check Basic System Health**
```bash
# Verify FlowForge installation
flowforge:version:check
# Expected: FlowForge v2.0.0 - Hybrid Time Aggregation System

# Check user data directory
ls -la .flowforge/user/$(whoami)/
# Expected: time/, config.json, and other directories

# Verify permissions
flowforge:permissions:check
# Expected: All permissions correct
```

**Step 2: Check Active Sessions**
```bash
# Look for conflicting active sessions
flowforge:session:list --active
# If multiple active: Use flowforge:session:end --session-id XXX

# Check for corrupted session data
flowforge:session:validate --current
# If corrupted: flowforge:session:recover
```

**Step 3: Check System Resources**
```bash
# Check disk space
df -h .flowforge/
# Must have >100MB available

# Check file locks
lsof .flowforge/user/$(whoami)/time/current.json
# Should show no locked files

# Check process conflicts
ps aux | grep flowforge
# Should show daemon process only
```

#### Solutions

**Solution A: Permission Issues**
```bash
# Fix file permissions
flowforge:permissions:repair

# Recreate user directory if needed
flowforge:user:reinitialize --preserve-data
```

**Solution B: Corrupted Session Data**
```bash
# Recover from backup
flowforge:session:recover --from-backup

# If no backup, create clean session
flowforge:session:create --clean-slate
```

**Solution C: System Resource Issues**
```bash
# Clean up disk space
flowforge:maintenance:cleanup --free-space 500M

# Kill conflicting processes
flowforge:processes:cleanup --force
```

### Issue 2: Team Aggregation Failing

#### Symptoms
```bash
flowforge:team:summary --current-week
# ERROR: No aggregated data available
# Last successful aggregation: 6 hours ago
```

#### Diagnosis Steps

**Step 1: Check Aggregation Layers**
```bash
# Test each layer individually
flowforge:aggregation:test --layer 1
# Expected: Git hook aggregation succeeds

flowforge:aggregation:test --layer 2  
# Expected: Daemon aggregation succeeds

flowforge:aggregation:test --layer 3
# Expected: CI/CD detection works

flowforge:aggregation:test --layer 4
# Expected: Manual tools available
```

**Step 2: Check Data Flow**
```bash
# Verify user data exists
find .flowforge/user/ -name "current.json" -exec jq -c '.summary.total_hours' {} \;
# Should show non-zero hours for active users

# Check aggregation queue
ls -la .flowforge/daemon/queue/
# Should be empty or processing

# Check failed aggregations
ls -la .flowforge/daemon/failed/
# Should be empty
```

**Step 3: Check Team Configuration**
```bash
# Validate team config
flowforge:team:config --validate
# Expected: All configuration valid

# Check team membership
flowforge:team:members --status
# All members should show "active" status
```

#### Solutions

**Solution A: Layer 1 (Git Hook) Failure**
```bash
# Reinstall git hooks
flowforge:hooks:reinstall --force

# Test hook manually
.git/hooks/pre-commit
# Should complete without errors

# Check hook execution time
time .git/hooks/pre-commit
# Should complete in <500ms
```

**Solution B: Layer 2 (Daemon) Issues**
```bash
# Check daemon status
systemctl status flowforge-aggregation
# Should show "active (running)"

# If not running, start daemon
systemctl start flowforge-aggregation

# Check daemon logs
journalctl -u flowforge-aggregation --since "1 hour ago"
# Look for error patterns

# Restart daemon if needed
flowforge:daemon:restart --clean-start
```

**Solution C: Team Configuration Issues**
```bash
# Reset team configuration
flowforge:team:configure --reset --preserve-data

# Re-invite team members if needed
flowforge:team:invite --reinvite-all

# Force complete re-aggregation
flowforge:aggregation:rebuild --comprehensive
```

### Issue 3: Privacy Settings Too Restrictive

#### Symptoms
```bash
flowforge:billing:generate --week current
# WARNING: Insufficient data for billing report
# Only 15% of expected billable hours visible
```

#### Diagnosis Steps

**Step 1: Check Privacy Settings**
```bash
# Audit all team member privacy settings
flowforge:privacy:audit --team-wide

# Privacy Audit Results:
# =====================
# 
# alice: Conservative (shares daily totals only)
# bob: Balanced (normal sharing)
# charlie: Conservative (shares daily totals only)  
# diana: Custom (no time data sharing)
# eve: Balanced (normal sharing)
# 
# Impact on billing:
# • Missing 67% of detailed time data
# • Cannot generate accurate client invoices
# • Budget tracking incomplete
```

**Step 2: Check Business Requirements**
```bash
# Review billing requirements
flowforge:billing:requirements --check

# Required for billing:
# ✅ Daily billable hours totals
# ❌ Issue-level time breakdown (67% missing)  
# ❌ Project time allocation (67% missing)
# ✅ Team productivity metrics
# ❌ Client-specific hour tracking (67% missing)
```

#### Solutions

**Solution A: Team Privacy Education**
```bash
# Generate privacy impact report
flowforge:privacy:impact-report --billing-focused

# Schedule team meeting to discuss:
# • Business need for billing data
# • What data is actually shared vs. private
# • Individual privacy controls available
# • Impact on team revenue/compensation
```

**Solution B: Adjust Default Team Settings**
```bash
# Update team default privacy level (requires team lead)
flowforge:team:privacy --set-default balanced

# Allow individual overrides
flowforge:team:privacy --allow-individual-overrides

# Set minimum privacy level for billing
flowforge:team:privacy --minimum-for-billing
```

**Solution C: Custom Privacy Profiles**
```bash
# Create billing-compatible privacy profile
flowforge:privacy:profile --create billing-safe

# Billing-Safe Profile:
# • Share daily billable hours: YES
# • Share issue-level totals: YES
# • Share exact timestamps: NO  
# • Share break patterns: NO
# • Share productivity details: NO

# Recommend profile to team members
flowforge:privacy:recommend --profile billing-safe --to-team
```

### Issue 4: Performance Degradation

#### Symptoms
```bash
# Git commits taking too long
time git commit -m "Test commit"
# real: 15.234s (should be <1s with aggregation)
```

#### Diagnosis Steps

**Step 1: Performance Profiling**
```bash
# Profile git hook performance
flowforge:performance:profile --git-hooks

# Git Hook Performance Analysis:
# ==============================
# 
# Total execution time: 15.2s
# Breakdown:
# • User data reading: 0.1s
# • JSON parsing: 0.3s  
# • Aggregation logic: 14.2s ❌ (should be <0.2s)
# • Team data writing: 0.4s
# • Validation: 0.2s
# 
# Issue: Aggregation logic performance degradation
# Likely cause: Large data set or inefficient processing
```

**Step 2: Data Volume Analysis**
```bash
# Check data volume
flowforge:data:analyze --volume

# Data Volume Report:
# ==================
# 
# User Data:
# • Total files: 15,247 (❌ very high)
# • Total size: 1.2GB (❌ should be <100MB)
# • Largest file: 45MB (❌ should be <1MB)
# • Oldest data: 2 years (may need archiving)
# 
# Team Data:
# • Aggregation files: 2,341 (❌ high)
# • Processing each commit: 2,341 files (❌ inefficient)
```

**Step 3: Resource Usage Analysis**
```bash
# Monitor resource usage during aggregation
flowforge:performance:monitor --during-aggregation

# Resource Usage During Aggregation:
# ==================================
# 
# CPU: 98% (single core maxed out)
# Memory: 1.8GB (❌ should be <100MB)  
# Disk I/O: 450 IOPS (❌ should be <50)
# Network: 0 (good - no external calls)
# 
# Issue: Memory usage indicates inefficient processing
```

#### Solutions

**Solution A: Data Archiving**
```bash
# Archive old data
flowforge:maintenance:archive --older-than 90-days

# Archived Data Report:
# • Files archived: 12,847
# • Space freed: 987MB
# • Performance impact: Estimated 85% improvement
```

**Solution B: Optimize Aggregation Algorithm**
```bash
# Enable incremental aggregation
flowforge:aggregation:configure --incremental-mode

# Process only changed data instead of full dataset
flowforge:aggregation:configure --delta-processing

# Enable parallel processing  
flowforge:aggregation:configure --parallel-workers 4
```

**Solution C: Caching and Optimization**
```bash
# Enable aggregation caching
flowforge:cache:enable --aggregation-cache

# Optimize JSON processing
flowforge:optimization:enable --json-streaming

# Pre-compile aggregation rules
flowforge:aggregation:precompile --all-rules
```

### Issue 5: Provider Integration Failures

#### Symptoms
```bash
flowforge:providers:test-connection
# GitHub: ❌ Authentication failed
# Notion: ⚠️ Rate limited
# Slack: ✅ Connected
```

#### Diagnosis Steps

**Step 1: Check Provider Configuration**
```bash
# Validate all provider configurations
flowforge:providers:diagnose --all

# Provider Diagnosis Report:
# =========================
# 
# GitHub Provider:
# • Status: ❌ Failed
# • Error: Invalid token (expired)
# • Last successful sync: 3 days ago
# • Pending operations: 47 failed syncs
# 
# Notion Provider:
# • Status: ⚠️ Rate limited
# • Error: 429 Too Many Requests
# • Rate limit reset: 12 minutes
# • Queue backlog: 23 items
# 
# Slack Provider:
# • Status: ✅ Healthy
# • Last message: 5 minutes ago
# • Queue: Empty
```

**Step 2: Check API Limits and Quotas**
```bash
# Check rate limits for all providers
flowforge:providers:rate-limits --check-all

# Rate Limit Status:
# ==================
# 
# GitHub:
# • API calls used: 4,847 / 5,000 per hour
# • Reset time: 23 minutes
# • Status: Near limit ⚠️
# 
# Notion:  
# • API calls used: 1,000 / 1,000 per minute
# • Reset time: 45 seconds
# • Status: Rate limited ❌
```

#### Solutions

**Solution A: Authentication Issues**
```bash
# Refresh GitHub token
flowforge:providers:github --refresh-token

# Test authentication
flowforge:providers:github --test-auth
# Expected: ✅ Authentication successful

# Update token if refresh fails
flowforge:providers:configure github --new-token
```

**Solution B: Rate Limit Management**
```bash
# Enable intelligent rate limiting
flowforge:providers:rate-limiting --enable-smart-throttling

# Configure backoff strategies
flowforge:providers:configure --exponential-backoff

# Spread API calls over time
flowforge:providers:configure --distribute-api-calls
```

**Solution C: Provider-Specific Optimization**
```bash
# Optimize GitHub sync strategy
flowforge:providers:github --sync-strategy incremental

# Batch Notion operations  
flowforge:providers:notion --batch-operations

# Enable provider health monitoring
flowforge:providers:monitoring --enable-all
```

## Advanced Troubleshooting

### Memory and Performance Issues

#### Memory Leak Detection
```bash
# Monitor FlowForge memory usage over time
flowforge:performance:memory-monitor --duration 1h

# Memory usage pattern:
# 10:00: 45MB (normal)
# 10:15: 67MB (increasing)  
# 10:30: 89MB (leak suspected)
# 10:45: 112MB (leak confirmed)
# 11:00: 134MB (critical)

# Identify memory leak source
flowforge:performance:memory-profile --identify-leaks

# Memory leak in daemon aggregation process
# Recommended: Restart daemon every 6 hours
flowforge:daemon:configure --restart-interval 6h
```

#### CPU Performance Optimization
```bash
# Profile CPU usage during operations
flowforge:performance:cpu-profile --during-commit

# CPU hotspots identified:
# • JSON parsing: 45% of CPU time
# • File I/O: 30% of CPU time  
# • String processing: 15% of CPU time
# • Validation: 10% of CPU time

# Enable CPU optimizations
flowforge:optimization:enable --json-streaming --async-io
```

### Network and Connectivity Issues

#### Offline Mode Troubleshooting
```bash
# Test offline capability
flowforge:offline:test --simulate-network-failure

# Offline Test Results:
# • Time tracking: ✅ Works offline
# • Local aggregation: ✅ Works offline
# • Team sync: ⚠️ Queued for later
# • Provider sync: ⚠️ Queued for later
# • Billing reports: ✅ Works with local data

# Enable enhanced offline mode
flowforge:offline:configure --enhanced-mode
```

#### Network Connectivity Diagnosis
```bash
# Test network connectivity to all services
flowforge:network:diagnose --comprehensive

# Network Diagnosis:
# ==================
# 
# GitHub API (api.github.com):
# • DNS resolution: ✅ 140ms
# • TCP connection: ❌ Timeout after 30s
# • HTTPS handshake: ❌ Not tested (TCP failed)
# • Issue: Firewall or network routing
# 
# FlowForge Services (api.flowforge.dev):
# • DNS resolution: ✅ 89ms
# • TCP connection: ✅ 234ms  
# • HTTPS handshake: ✅ 456ms
# • API response: ✅ 789ms
```

### Data Recovery Procedures

#### Complete Data Recovery
```bash
# Assess data loss extent
flowforge:recovery:assess --comprehensive

# Data Loss Assessment:
# =====================
# 
# User Data:
# • alice: ✅ Complete (no loss)
# • bob: ⚠️ Missing last 2 days
# • charlie: ❌ Corrupted (needs recovery)
# 
# Team Data:
# • Current week: ⚠️ Incomplete
# • Last week: ✅ Complete
# • Historical: ✅ Complete
# 
# Recovery Options:
# 1. Restore from git history
# 2. Restore from automated backups
# 3. Reconstruct from individual user data
```

#### Step-by-Step Recovery Process
```bash
# Step 1: Stop all processing
flowforge:recovery:prepare --stop-all-processing

# Step 2: Assess recoverable data sources
flowforge:recovery:sources --scan-all

# Available Recovery Sources:
# • Git history: 247 commits with time data
# • Automated backups: 14 daily backups
# • User machine backups: 3 of 5 users have local backups
# • Provider caches: GitHub has 67% of data

# Step 3: Execute recovery
flowforge:recovery:execute --strategy comprehensive --verify

# Step 4: Validate recovered data
flowforge:recovery:validate --mathematical-consistency --business-rules

# Step 5: Resume normal operations
flowforge:recovery:resume --gradual-restart
```

## Monitoring and Alerting

### Health Monitoring Setup

```bash
# Configure comprehensive health monitoring
flowforge:monitoring:configure --comprehensive

# Monitoring Configuration:
# =========================
# 
# Health Checks (every 5 minutes):
# • Time tracking functionality
# • Aggregation system performance  
# • Data integrity validation
# • Privacy protection verification
# • Provider connectivity
# 
# Performance Metrics (every 1 minute):
# • Git hook execution time
# • Memory usage trends
# • Disk space utilization
# • Network latency to providers
# • Queue processing rates
# 
# Business Metrics (every 15 minutes):
# • Team productivity scores
# • Billing data completeness  
# • Sprint velocity tracking
# • Budget utilization rates
```

### Alert Configuration

```bash
# Set up critical alerts
flowforge:alerts:configure --critical-only

# Critical Alert Thresholds:
# ==========================
# 
# Data Loss Prevention:
# • Time tracking failure: Immediate alert
# • Data corruption detected: Immediate alert
# • Backup failure: Alert within 1 hour
# • Aggregation stopped: Alert within 15 minutes
# 
# Performance Issues:
# • Git commit >10s: Alert within 5 minutes
# • Memory usage >500MB: Alert within 10 minutes
# • Disk usage >90%: Alert within 30 minutes
# • Queue backlog >100 items: Alert within 15 minutes
# 
# Business Impact:
# • Revenue tracking stopped: Immediate alert
# • Client billing data incomplete: Alert within 1 hour
# • Team productivity <70%: Alert within 2 hours
```

### Automated Recovery Actions

```bash
# Configure automated recovery responses
flowforge:automation:recovery --configure

# Automated Recovery Actions:
# ===========================
# 
# Level 1 (Automatic):
# • Restart daemon on failure
# • Clear full disk space automatically
# • Retry failed aggregations
# • Reset stuck file locks
# 
# Level 2 (Semi-Automatic):
# • Restore from backup (requires confirmation)
# • Reset provider connections
# • Rebuild corrupted data structures
# • Escalate to human after 3 automatic attempts
# 
# Level 3 (Human Required):
# • Data integrity violations
# • Privacy policy breaches  
# • Security incidents
# • System architecture changes
```

## Escalation Procedures

### Internal Escalation

**Level 1: Team Lead (0-30 minutes)**
- Time tracking issues affecting <3 developers
- Performance degradation <50%
- Non-critical data inconsistencies
- Provider sync delays <4 hours

**Level 2: Engineering Manager (30 minutes - 2 hours)**  
- Time tracking issues affecting >3 developers
- Performance degradation >50%
- Data integrity issues
- Provider integration failures

**Level 3: CTO/Emergency Response (>2 hours or critical)**
- Complete system failure
- Data corruption or loss
- Security breaches
- Revenue impact >$10,000

### External Escalation

```bash
# Contact FlowForge emergency support
curl -X POST "https://api.flowforge.dev/support/emergency" \
     -H "Authorization: Bearer $FLOWFORGE_SUPPORT_TOKEN" \
     -d '{
       "team": "your-team-name",
       "severity": "critical",
       "issue": "complete_time_tracking_failure",
       "impact": "4_developers_affected",
       "revenue_at_risk": "$5000_per_day",
       "contact": "emergency@yourcompany.com",
       "phone": "+1-555-123-4567"
     }'

# Response includes:
# • Incident ID for tracking
# • Initial response time estimate
# • Emergency mitigation steps
# • Escalation contact information
```

## Prevention and Maintenance

### Preventive Maintenance Schedule

**Daily (Automated)**:
```bash
# Health checks and basic maintenance
flowforge:maintenance:daily
```

**Weekly (Team Lead)**:
```bash
# Comprehensive system review
flowforge:maintenance:weekly --include-performance-review
```

**Monthly (Engineering Team)**:
```bash
# Deep system analysis and optimization
flowforge:maintenance:monthly --comprehensive-optimization
```

**Quarterly (Full Team)**:
```bash
# Major system review and planning
flowforge:maintenance:quarterly --strategic-review
```

### System Hardening

```bash
# Apply security and reliability hardening
flowforge:hardening:apply --security --reliability

# Hardening Applied:
# ==================
# 
# Security:
# • File permission restrictions
# • Network access controls
# • API token rotation schedule
# • Audit log encryption
# 
# Reliability:  
# • Automatic backup verification
# • Data redundancy checks
# • Health monitoring enhancement
# • Failure detection tuning
```

## Success Metrics

### Troubleshooting Effectiveness
- **Mean Time to Detection**: <5 minutes for critical issues
- **Mean Time to Resolution**: <30 minutes for 95% of issues
- **Prevention Rate**: >90% of issues caught before user impact
- **Escalation Rate**: <5% of issues require external support

### System Reliability
- **Uptime**: >99.99% availability
- **Data Integrity**: Zero data loss incidents  
- **Performance**: <1 second git commit time
- **Recovery**: <15 minutes maximum recovery time

## Resources and References

### Documentation Links
- [FlowForge v2.0 Architecture Overview](architecture/README.md)
- [Privacy Configuration Guide](privacy-configuration-guide.md)
- [Team Onboarding Guide](team-onboarding-guide.md)
- [Billing Reports Manual](billing-reports-manual.md)

### Emergency Contacts
- **FlowForge Support**: support@flowforge.dev
- **Emergency Hotline**: +1-800-FLOWFORGE
- **Community Support**: [Discord](https://discord.gg/flowforge)
- **Documentation**: [docs.flowforge.dev](https://docs.flowforge.dev)

### Tools and Commands Reference
```bash
# Essential troubleshooting commands
flowforge:health:check --comprehensive    # Full system health
flowforge:layers:diagnose --all          # Check all resilience layers  
flowforge:data:integrity --deep-scan     # Verify data integrity
flowforge:performance:profile --all      # Performance analysis
flowforge:recovery:assess --comprehensive # Data loss assessment
flowforge:providers:diagnose --all       # Provider integration check
```

## Conclusion

FlowForge v2.0's multi-layer resilience architecture provides exceptional reliability, but when issues do occur, systematic troubleshooting ensures rapid resolution. This runbook provides the procedures and tools needed to maintain the system's core promise: **TIME = MONEY** - every minute is tracked, protected, and billable.

**Remember**: The cost of lost time data far exceeds the effort of proper troubleshooting. When in doubt, escalate quickly and preserve data integrity above all else.

---
*FlowForge v2.0 Troubleshooting Runbook*  
*Version 1.0 - Complete system troubleshooting guide*  
*Generated: 2025-09-05*