# ADR-0004: Multi-Layer Resilience Strategy

## Status
Accepted

## Context

FlowForge's core mission is encapsulated in the principle **"TIME = MONEY"** - ensuring that every minute of developer work is tracked, aggregated, and billable. Any failure in the time aggregation system directly translates to:

- **Revenue Loss**: Untracked time cannot be billed to clients
- **Developer Payment Loss**: Developers don't get paid for work that isn't tracked
- **Compliance Failures**: Missing audit trails for client billing
- **Team Management Breakdown**: Managers cannot track project progress or resource allocation

### The High Stakes of Time Tracking Reliability

#### Business Impact Analysis
A single aggregation failure can have cascading effects:

1. **Individual Developer Impact**: A developer working 8 hours with a failed aggregation loses 8 billable hours
2. **Team Impact**: A 5-developer team with aggregation failures loses 40+ billable hours per day
3. **Project Impact**: Critical project deadlines missed due to invisible work progress
4. **Client Impact**: Inaccurate billing leads to client disputes and contract issues
5. **Company Impact**: Systematic aggregation failures can threaten company viability

#### Current Industry Standards
Most time tracking solutions accept 95-98% reliability, but this is insufficient for FlowForge:
- **95% reliability** = 1.2 hours of lost time per day per developer
- **98% reliability** = 24 minutes of lost time per day per developer  
- **99% reliability** = 7.2 minutes of lost time per day per developer
- **FlowForge Target: 99.99%** = 4.3 seconds of lost time per day per developer

### Failure Mode Analysis

#### Single Point of Failure Risks
FlowForge v1.x had multiple single points of failure:

1. **Git Hook Failures**:
   - Network connectivity issues during commit
   - Disk space exhaustion preventing file writes
   - Process crashes due to memory issues
   - Permission problems accessing time tracking files

2. **File System Failures**:
   - Corrupted JSON files causing parsing errors
   - Concurrent write conflicts in multi-user scenarios
   - Backup drive failures losing historical data
   - Operating system crashes during aggregation

3. **Human Error Failures**:
   - Developers forgetting to commit time tracking data
   - Accidental deletion of time tracking files  
   - Misconfigured git hooks preventing aggregation
   - Manual aggregation processes skipped or executed incorrectly

4. **Infrastructure Failures**:
   - Network outages preventing GitHub sync
   - CI/CD pipeline failures missing aggregation validation
   - Server crashes losing in-progress aggregation data
   - Database corruption in provider integrations

### Reliability Requirements

#### Quantitative Requirements
- **Availability**: 99.99% uptime (52.6 minutes downtime per year)
- **Data Loss**: < 0.01% of time entries lost (1 in 10,000)
- **Recovery Time**: < 5 minutes to restore from any failure
- **Data Accuracy**: 100% accuracy in time aggregation (no false billing)

#### Qualitative Requirements
- **Developer Friction**: Zero additional workflow steps for developers
- **Manager Confidence**: Team managers trust billing reports completely
- **Client Satisfaction**: No billing disputes due to time tracking issues
- **Audit Compliance**: Complete audit trail for all time tracking operations

## Decision

Implement a **Multi-Layer Resilience Strategy** with four independent layers of protection, ensuring that aggregation succeeds even when multiple systems fail simultaneously.

### Four-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Multi-Layer Resilience Architecture         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Git Hook System (Primary - 99% of operations)    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ pre-commit hook → aggregate → validate → commit    │   │
│  │ • Zero friction for developers                     │   │
│  │ • Automatic on every git commit                    │   │  
│  │ • < 500ms execution time                           │   │
│  │ • Built-in retry mechanism                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼ (on failure)                   │
│  Layer 2: Background Daemon (Secondary - failure recovery) │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ daemon process → file watcher → queue → retry      │   │
│  │ • Runs continuously in background                  │   │
│  │ • Processes failed aggregations                    │   │
│  │ • Watches for file changes                         │   │
│  │ • Exponential backoff retry                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼ (on persistent failure)        │
│  Layer 3: CI/CD Recovery (Organizational backup)           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ GitHub Actions → scan → reconcile → notify         │   │
│  │ • Runs every 4 hours and on push                   │   │
│  │ • Detects missing aggregations                     │   │
│  │ • Generates recovery aggregations                  │   │
│  │ • Alerts team to systematic issues                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼ (emergency scenarios)          │
│  Layer 4: Manual Recovery (Disaster scenarios)             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ flowforge:time:reconcile → audit → repair → verify │   │
│  │ • Manual command-line tools                        │   │
│  │ • Complete data reconstruction                      │   │
│  │ • Audit and compliance reporting                   │   │
│  │ • Emergency recovery procedures                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Layer Design Principles

#### Layer 1: Git Hook System (Primary Layer)
**Design Goal**: Handle 99% of all aggregations with zero developer friction

```bash
# Enhanced git hook with comprehensive error handling
#!/bin/bash
# .flowforge/hooks/pre-commit-aggregate.sh

# Reliability features:
# - Atomic operations with temporary files
# - Lock file management to prevent conflicts  
# - Multiple retry attempts with exponential backoff
# - Comprehensive error logging
# - Graceful degradation (never block commits)
# - Performance optimization (< 500ms execution)

set -euo pipefail

readonly HOOK_VERSION="2.0.0"
readonly MAX_RETRIES=3
readonly TIMEOUT_SECONDS=10
readonly LOCK_FILE="/tmp/flowforge-aggregate.lock"

# If aggregation fails, queue for daemon and continue commit
aggregate_with_resilience() {
    local attempts=0
    
    while [ $attempts -lt $MAX_RETRIES ]; do
        if timeout $TIMEOUT_SECONDS perform_aggregation; then
            log "SUCCESS: Aggregation completed in Layer 1"
            return 0
        fi
        
        ((attempts++))
        log "WARNING: Attempt $attempts failed, retrying..."
        sleep $((attempts * attempts))  # Exponential backoff
    done
    
    # All retries failed - queue for daemon but don't block commit
    queue_for_layer2
    log "INFO: Aggregation queued for Layer 2 processing"
    return 0  # Never block commits
}
```

#### Layer 2: Background Daemon (Recovery Layer)
**Design Goal**: Process all failed aggregations from Layer 1 with intelligent retry logic

```python
class FlowForgeResilienceDaemon:
    """
    Background daemon that ensures 100% aggregation completion.
    Processes Layer 1 failures with intelligent retry and escalation.
    """
    
    def __init__(self):
        self.retry_policy = {
            "initial_delay": 60,        # 1 minute initial retry
            "max_delay": 3600,          # 1 hour maximum retry interval
            "exponential_base": 2,      # Double delay each retry
            "max_attempts": 10          # Maximum retry attempts
        }
        
    def process_failed_aggregation(self, task: FailedAggregation):
        """Process a failed aggregation with intelligent retry."""
        
        for attempt in range(1, self.retry_policy["max_attempts"] + 1):
            try:
                # Attempt aggregation with enhanced error handling
                result = self.enhanced_aggregation(task)
                
                if result.success:
                    self.log_success(task, attempt)
                    return True
                    
            except Exception as e:
                delay = min(
                    self.retry_policy["initial_delay"] * (self.retry_policy["exponential_base"] ** (attempt - 1)),
                    self.retry_policy["max_delay"]
                )
                
                self.log_retry(task, attempt, delay, e)
                time.sleep(delay)
        
        # All retries failed - escalate to Layer 3
        self.escalate_to_layer3(task)
        return False
```

#### Layer 3: CI/CD Recovery (Organizational Layer)
**Design Goal**: Detect and repair systematic aggregation failures across the entire team

```yaml
# .github/workflows/time-aggregation-recovery.yml
name: Time Aggregation Recovery

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours
  workflow_dispatch:       # Manual trigger for emergencies

jobs:
  detect-and-recover:
    runs-on: ubuntu-latest
    steps:
      - name: Detect Missing Aggregations
        run: |
          # Scan for time tracking data that hasn't been aggregated
          python3 .flowforge/scripts/detect-missing-aggregations.py \
            --lookback-hours 72 \
            --output missing-aggregations.json
            
      - name: Generate Recovery Aggregations
        if: success()
        run: |
          # Reconstruct missing aggregations from git history
          python3 .flowforge/scripts/recover-aggregations.py \
            --input missing-aggregations.json \
            --validate-integrity \
            --create-audit-trail
            
      - name: Validate Recovery Integrity  
        run: |
          # Ensure recovered data matches original time tracking
          python3 .flowforge/scripts/validate-recovery.py \
            --tolerance 0.001 \
            --comprehensive-check
            
      - name: Alert on Systematic Failures
        if: failure()
        run: |
          # Create GitHub issue for systematic problems
          gh issue create \
            --title "Time Aggregation Recovery Required" \
            --body-file recovery-report.md \
            --label "critical,billing,time-tracking" \
            --assignee "@flowforge/time-tracking-team"
```

#### Layer 4: Manual Recovery (Emergency Layer)  
**Design Goal**: Provide comprehensive manual tools for disaster recovery scenarios

```bash
# Emergency recovery command suite
flowforge:recovery:assess    # Assess extent of data loss
flowforge:recovery:reconstruct # Reconstruct from all available sources
flowforge:recovery:validate  # Validate reconstructed data integrity
flowforge:recovery:audit     # Generate audit report for compliance
flowforge:recovery:deploy    # Deploy recovered data safely
```

### Failure Escalation Logic

```python
class ResilienceOrchestrator:
    """
    Coordinates failure escalation across all four layers.
    Ensures no aggregation is ever lost.
    """
    
    def handle_aggregation_request(self, user_data: UserTimeData):
        # Layer 1: Primary git hook attempt
        if self.layer1_git_hook(user_data):
            return AggregationResult.SUCCESS_LAYER1
            
        # Layer 2: Daemon processing attempt  
        if self.layer2_daemon_queue(user_data):
            return AggregationResult.SUCCESS_LAYER2
            
        # Layer 3: CI/CD recovery attempt
        if self.layer3_cicd_recovery(user_data):
            return AggregationResult.SUCCESS_LAYER3
            
        # Layer 4: Manual recovery required
        self.layer4_manual_escalation(user_data)
        return AggregationResult.MANUAL_INTERVENTION_REQUIRED
```

## Alternatives Considered

### Option 1: Single Layer with High Reliability  
**Description**: Invest heavily in making git hooks 99.99% reliable
- **Pros**: Simple architecture, single point of maintenance, lower complexity
- **Cons**: Still has single point of failure, 99.99% insufficient for critical billing
- **Rejected**: Cannot achieve required reliability with single layer

### Option 2: Dual Layer (Hook + Daemon)
**Description**: Git hooks with daemon backup only  
- **Pros**: Simpler than 4-layer, covers most failure scenarios
- **Cons**: No protection against systematic failures, no disaster recovery
- **Rejected**: Insufficient protection for enterprise deployment

### Option 3: Cloud-First Resilience
**Description**: Primary resilience through cloud provider redundancy
- **Pros**: Leverages cloud reliability, managed infrastructure
- **Cons**: Network dependency, vendor lock-in, violates FlowForge principles
- **Rejected**: Creates external dependencies counter to FlowForge philosophy

### Option 4: Database-Backed Resilience
**Description**: All time data backed by PostgreSQL with replication
- **Pros**: ACID guarantees, mature replication, proven reliability
- **Cons**: Infrastructure overhead, complexity, not git-centric
- **Rejected**: Too heavy for FlowForge's lightweight philosophy

### Option 5: Blockchain-Based Immutability
**Description**: Time tracking entries as blockchain transactions
- **Pros**: Immutable audit trail, distributed redundancy
- **Cons**: Performance issues, environmental concerns, overkill
- **Rejected**: Over-engineered solution with poor performance characteristics

## Consequences

### Positive

#### Business Benefits
- **Revenue Protection**: 99.99% reliability prevents revenue loss from tracking failures
- **Risk Mitigation**: Multiple failure modes covered, no single points of failure
- **Audit Compliance**: Complete audit trail across all recovery layers
- **Manager Confidence**: Team managers can trust billing data completeness
- **Client Satisfaction**: No billing disputes due to tracking system failures

#### Technical Benefits  
- **Graceful Degradation**: System never blocks development workflow
- **Automatic Recovery**: Most failures resolve without human intervention
- **Performance Optimization**: Each layer optimized for its specific use case
- **Comprehensive Monitoring**: Health checks and alerting across all layers
- **Data Integrity**: Multiple validation points ensure data accuracy

#### Operational Benefits
- **Reduced Support Burden**: Automatic recovery reduces support tickets
- **Clear Escalation Path**: Defined procedures for each failure scenario
- **Proactive Monitoring**: Issues detected and resolved before user impact
- **Documentation**: Comprehensive runbooks for all recovery scenarios

### Negative

#### Implementation Complexity
- **Multi-System Coordination**: Four different systems must work together
- **Testing Complexity**: Must test all failure scenarios and layer interactions
- **Deployment Complexity**: Multiple components to deploy and configure
- **Debugging Difficulty**: Issues may span multiple layers requiring specialized knowledge

#### Operational Overhead
- **Monitoring Requirements**: Four separate systems need health monitoring
- **Maintenance Burden**: Updates must be coordinated across all layers  
- **Resource Usage**: Background daemon and CI/CD jobs consume resources
- **Documentation Maintenance**: Complex system requires extensive documentation

#### Risk Factors
- **Over-Engineering Risk**: System may be more complex than needed for small teams
- **Dependency Risk**: Failure in resilience systems could cascade
- **Performance Risk**: Multiple layers could impact commit performance
- **Configuration Risk**: Complex configuration increases misconfiguration chances

### Neutral

- **Storage Requirements**: Additional storage for redundancy and audit trails
- **Network Usage**: CI/CD recovery generates additional network traffic
- **Learning Curve**: Operations team must understand multi-layer architecture

## Implementation

### Phase 1: Enhanced Git Hook System (Weeks 1-3)
```bash
# Production-grade git hook implementation
.flowforge/hooks/pre-commit-aggregate.sh
- Atomic operations with file locking
- Comprehensive error handling and logging
- Multiple retry attempts with exponential backoff
- Performance optimization (< 500ms target)
- Queue interface for Layer 2 escalation
```

### Phase 2: Background Daemon Service (Weeks 4-6)  
```python
# Resilient daemon implementation
.flowforge/scripts/aggregation-daemon.py
- File system event monitoring
- Intelligent retry policies
- Health check and metrics reporting
- Layer 3 escalation interface
- Comprehensive logging and alerting
```

### Phase 3: CI/CD Recovery System (Weeks 7-9)
```yaml  
# GitHub Actions recovery workflows
.github/workflows/
- time-aggregation-check.yml    # Regular integrity checks
- time-aggregation-recovery.yml # Automatic recovery
- time-aggregation-audit.yml    # Compliance reporting
```

### Phase 4: Manual Recovery Tools (Weeks 10-12)
```bash
# Emergency recovery command suite
commands/flowforge/recovery/
- assess.md      # Data loss assessment
- reconstruct.md # Data reconstruction  
- validate.md    # Integrity validation
- audit.md       # Compliance reporting
- deploy.md      # Safe deployment
```

### Phase 5: Integration Testing (Weeks 13-14)
```python
# Comprehensive resilience testing
tests/resilience/
- test_layer_failures.py     # Individual layer failure tests
- test_cascade_failures.py   # Multiple simultaneous failures  
- test_recovery_accuracy.py  # Data integrity during recovery
- test_performance_impact.py # Performance under failure conditions
```

### Resilience Metrics Framework
```python
class ResilienceMetrics:
    """Track resilience performance across all layers."""
    
    def __init__(self):
        self.metrics = {
            "layer1_success_rate": 0.0,
            "layer2_recovery_rate": 0.0, 
            "layer3_detection_rate": 0.0,
            "layer4_manual_interventions": 0,
            "total_reliability": 0.0,
            "mean_recovery_time": 0.0,
            "data_loss_incidents": 0
        }
    
    def calculate_overall_reliability(self) -> float:
        """Calculate compound reliability across all layers."""
        p1 = self.metrics["layer1_success_rate"]
        p2 = self.metrics["layer2_recovery_rate"] 
        p3 = self.metrics["layer3_detection_rate"]
        
        # Compound probability: P(success) = 1 - P(all_fail)
        p_all_fail = (1 - p1) * (1 - p2) * (1 - p3)
        return 1.0 - p_all_fail
```

## Operational Procedures

### Daily Operations
```bash
# Morning health check (5 minutes)
flowforge:health:check --all-layers
flowforge:metrics:report --daily
flowforge:queue:status --pending-items

# Expected output: All layers healthy, <1% items in queue
```

### Incident Response Procedures

#### Layer 1 Failures (Git Hook Issues)
```bash
# Diagnosis
flowforge:layer1:diagnose --last-24h
tail -f .flowforge/hooks/logs/aggregation.log

# Resolution  
flowforge:layer1:repair --fix-permissions --update-hooks
flowforge:layer1:test --dry-run
```

#### Layer 2 Failures (Daemon Issues)
```bash
# Diagnosis
systemctl status flowforge-aggregation
journalctl -u flowforge-aggregation --since "1 hour ago"

# Resolution
systemctl restart flowforge-aggregation
flowforge:daemon:recover --process-backlog
```

#### Layer 3 Failures (CI/CD Issues)
```bash  
# Diagnosis
gh run list --workflow=time-aggregation-check.yml
gh run view [RUN_ID] --log

# Resolution
gh workflow run time-aggregation-recovery.yml
flowforge:cicd:manual-trigger --comprehensive-scan
```

#### Layer 4 Escalation (Manual Recovery)
```bash
# Emergency procedures
flowforge:recovery:assess --full-audit
flowforge:recovery:reconstruct --from-git-history --validate
flowforge:recovery:deploy --verify-integrity --create-backup
```

### Disaster Recovery Scenarios

#### Scenario 1: Complete System Failure
```bash
#!/bin/bash
# Complete disaster recovery procedure

# 1. Assess damage extent
flowforge:recovery:assess --comprehensive > damage-report.json

# 2. Reconstruct from all available sources
flowforge:recovery:reconstruct \
  --from-git-history \
  --from-backups \
  --from-user-machines \
  --validate-integrity

# 3. Verify reconstruction accuracy
flowforge:recovery:validate \
  --tolerance 0.001 \
  --comprehensive-check \
  --generate-audit-report

# 4. Deploy recovered data
flowforge:recovery:deploy \
  --staged-rollout \
  --monitor-health \
  --rollback-on-failure
```

## Performance and Reliability Targets

### Reliability Targets
- **Overall System**: 99.99% availability (4.38 minutes downtime/month)
- **Layer 1 (Git Hooks)**: 99.0% success rate
- **Layer 2 (Daemon)**: 99.9% recovery rate for Layer 1 failures  
- **Layer 3 (CI/CD)**: 99.99% detection rate for systematic issues
- **Layer 4 (Manual)**: 100% recovery capability for any data loss scenario

### Performance Targets
- **Layer 1 Execution**: < 500ms per aggregation
- **Layer 2 Recovery**: < 5 minutes from failure detection to recovery
- **Layer 3 Detection**: < 4 hours to detect systematic failures
- **Layer 4 Recovery**: < 2 hours for complete manual recovery

### Data Integrity Targets
- **Aggregation Accuracy**: 100% accuracy (no false billing data)
- **Data Loss**: < 0.01% of time entries lost permanently
- **Audit Completeness**: 100% of operations logged for compliance
- **Recovery Validation**: 99.99% accuracy in recovered data

## Success Metrics

### Quantitative Metrics
- **Compound Reliability**: Achieve 99.99% overall reliability within 3 months
- **Revenue Protection**: Zero revenue loss due to tracking system failures  
- **Recovery Performance**: 95% of failures resolved automatically within 5 minutes
- **Manual Interventions**: < 1 manual recovery per month per 50 developers

### Qualitative Metrics  
- **Developer Satisfaction**: No workflow disruption due to resilience measures
- **Manager Confidence**: Team managers trust billing data without verification
- **Client Satisfaction**: Zero billing disputes due to tracking system issues
- **Compliance Success**: 100% pass rate for audit compliance reviews

### Leading Indicators
- **Layer Health**: All layers report healthy status 99.9% of time
- **Queue Backlog**: < 1% of aggregations queued for Layer 2 processing
- **Alert Frequency**: < 1 critical alert per week across all layers
- **Recovery Testing**: All disaster recovery procedures tested monthly

## References

- **ADR-0002**: Hybrid Time Aggregation Architecture (foundational architecture)
- **ADR-0003**: Privacy-Preserving Billing Reports (data requirements)
- **FlowForge Rule #33**: TIME = MONEY (business driver)
- **Issue #231**: Team billing report generation (reliability requirements)
- **Site Reliability Engineering**: Google's approach to multi-layer resilience
- **Chaos Engineering Principles**: Netflix's approach to failure testing

## Risk Mitigation

### Technical Risk Mitigation
- **Comprehensive Testing**: All failure scenarios tested in staging environment
- **Performance Monitoring**: Real-time monitoring of all layer performance
- **Rollback Procedures**: Ability to rollback to previous reliable state
- **Circuit Breakers**: Automatic isolation of failing components

### Operational Risk Mitigation
- **Team Training**: Operations team trained on all recovery procedures
- **Documentation**: Comprehensive runbooks for all failure scenarios  
- **Regular Drills**: Monthly disaster recovery drills to test procedures
- **Vendor Independence**: No single vendor dependencies for critical functions

### Business Risk Mitigation
- **Gradual Rollout**: Phase resilience features in gradually to identify issues
- **Client Communication**: Transparent communication about reliability improvements
- **SLA Management**: Clear service level agreements for time tracking reliability
- **Insurance**: Consider cyber insurance for data loss scenarios beyond technical control

## Date
2025-09-05

## Author  
Alex Cruz (FlowForge Architecture Team)

## Approved By
- Architecture Review Board: ✅ Approved (2025-09-05)
- DevOps Team: ✅ Approved (2025-09-05)
- Site Reliability Engineering: ✅ Approved (2025-09-05)
- Product Management: ✅ Approved (2025-09-05)