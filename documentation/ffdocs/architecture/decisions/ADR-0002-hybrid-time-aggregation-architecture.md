# ADR-0002: Hybrid Time Aggregation Architecture

## Status
Accepted

## Context

FlowForge's original time tracking architecture (`task-time.sh` + `.task-times.json`) faced critical scalability and billing challenges:

1. **Team Manager Billing Crisis**: Team managers could not generate billing reports without accessing each developer's individual machine, creating a massive operational bottleneck
2. **Multi-User Merge Conflicts**: Single JSON file caused constant git merge conflicts when multiple developers worked simultaneously
3. **No Backup/Recovery**: Critical billing data had no resilience mechanisms - lost data meant lost revenue
4. **Incomplete Provider Integration**: GitHub Issues, Notion, and other provider sync was fragmented and unreliable
5. **Privacy vs. Transparency Tension**: Developers needed privacy for detailed time data, but managers needed aggregated billing visibility

### Business Impact
- **Revenue Loss**: Missing time tracking directly translates to unbillable hours
- **Manager Friction**: Team leads spending hours collecting billing data instead of managing
- **Developer Friction**: Merge conflicts and data loss disrupting development workflow
- **Compliance Risk**: No audit trail or data integrity verification for billing

### The "TIME = MONEY" Problem
FlowForge's core mission is ensuring developers get paid for their work. The v1.x architecture violated this principle by making billing data difficult to access, prone to loss, and operationally complex.

## Decision

Implement a **Hybrid Time Aggregation Architecture** that separates user-specific detailed data from team-wide aggregated billing summaries:

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                   FlowForge v2.0 Architecture               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Layer (Private, Git-Ignored)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ .flowforge/user/{username}/                         │   │
│  │ ├── time/current.json      # Active timers          │   │
│  │ ├── time/daily/            # Daily detailed logs    │   │
│  │ ├── time/archive/          # Historical data        │   │
│  │ └── config.json            # User preferences       │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           │ Aggregation Process             │
│                           ▼                                 │
│  Team Layer (Shared, Git-Committed)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ .flowforge/team/                                    │   │
│  │ ├── summaries/current.json # Latest aggregate       │   │
│  │ ├── summaries/weekly/      # Weekly reports         │   │
│  │ ├── summaries/monthly/     # Monthly reports        │   │
│  │ └── config.json            # Team configuration     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Implementation Decisions

#### 1. Directory Separation Strategy
- **`.flowforge/user/`**: User-isolated, git-ignored detailed time data
- **`.flowforge/team/`**: Team-shared, git-committed aggregated summaries
- **Benefit**: Zero merge conflicts while maintaining billing transparency

#### 2. Aggregation Pipeline
- **Primary**: Git hooks for zero-friction automation
- **Secondary**: Background daemon for reliability
- **Tertiary**: CI/CD recovery for organizational backup
- **Manual**: Emergency recovery commands

#### 3. Data Privacy Model
- **User data stays local**: Detailed time logs never leave developer's machine
- **Aggregated summaries shared**: Only billable hours and issue counts in team data
- **Configurable granularity**: Team admins can adjust aggregation detail level

#### 4. Multi-Layer Resilience
- **Layer 1**: Git pre-commit hooks (99% of operations)
- **Layer 2**: Background daemon service (failure recovery)
- **Layer 3**: CI/CD reconciliation (organizational backup)
- **Layer 4**: Manual recovery commands (disaster scenarios)

## Alternatives Considered

### Option 1: Centralized Database Architecture
**Description**: Single PostgreSQL/MySQL database for all time data
- **Pros**: Strong consistency, ACID transactions, mature ecosystem
- **Cons**: Infrastructure overhead, single point of failure, network dependency
- **Rejected**: Violates FlowForge's "git-centric, zero-infrastructure" principle

### Option 2: Fully Distributed (No Aggregation)
**Description**: Each developer manages their own data, no centralized billing
- **Pros**: Maximum privacy, zero conflicts, simple implementation
- **Cons**: No team billing visibility, manual reporting burden
- **Rejected**: Solves privacy but destroys team management capability

### Option 3: Cloud-First Architecture
**Description**: All data synced to cloud providers (GitHub, Notion, Airtable)
- **Pros**: Accessible from anywhere, provider-native features
- **Cons**: Network dependency, vendor lock-in, privacy concerns
- **Rejected**: Creates external dependencies that violate FlowForge principles

### Option 4: Event Sourcing with Local Snapshots
**Description**: Append-only event log with periodic snapshots
- **Pros**: Perfect audit trail, replay capability, eventual consistency
- **Cons**: Complex implementation, large storage requirements
- **Rejected**: Over-engineered for current requirements, future option

## Consequences

### Positive

#### Business Benefits
- **Instant Billing Reports**: Managers can generate billing reports in seconds without accessing developer machines
- **Zero Revenue Loss**: Multi-layer resilience ensures no billable hours are lost
- **Scalable Team Operations**: Architecture supports 50+ developers without performance degradation
- **Compliance Ready**: Built-in audit trails and data integrity checks

#### Technical Benefits
- **Zero Merge Conflicts**: User data isolation eliminates git conflicts on time tracking
- **Performance Optimized**: Aggregation only processes changed data, sub-second execution
- **Backward Compatible**: Existing v1.x time data seamlessly migrates
- **Provider Agnostic**: Works with GitHub, standalone, or any future provider

#### Developer Experience
- **Zero Friction**: Time tracking works exactly as before from developer perspective
- **Privacy Preserved**: Detailed work patterns stay on developer's machine
- **Reliability Improved**: Multiple fallback mechanisms prevent data loss
- **Git Workflow Unchanged**: No changes to commit/push/pull patterns

### Negative

#### Implementation Complexity
- **Multi-Component System**: Git hooks + daemon + CI/CD + manual tools increase complexity
- **Error Handling**: More failure modes require comprehensive error handling
- **Testing Challenge**: Integration testing across multiple aggregation layers
- **Documentation Overhead**: More complex architecture requires extensive documentation

#### Operational Overhead
- **Daemon Management**: Background service requires monitoring and maintenance
- **Storage Growth**: Aggregated data accumulates over time (mitigated by archiving)
- **Debug Complexity**: Issues may span multiple aggregation layers
- **Migration Effort**: v1.x to v2.0 migration requires careful data preservation

#### Potential Edge Cases
- **Clock Synchronization**: Aggregation accuracy depends on system clock accuracy
- **Disk Space**: User data accumulates locally (mitigated by configurable retention)
- **Network Partitions**: Git operations may delay aggregation (handled by daemon)

### Neutral

- **Git Repository Size**: Team summaries add minimal data to repository
- **Processing Power**: Modern machines handle aggregation with negligible resource usage
- **Learning Curve**: System operators need to understand multi-layer architecture

## Implementation

### Phase 1: Core Infrastructure (Weeks 1-2)
```bash
# Directory structure creation
.flowforge/
├── user/{username}/time/        # User-specific data (gitignored)
├── team/summaries/              # Aggregated data (committed)
├── daemon/                      # Background service (gitignored)
└── recovery/                    # Backup/audit (committed)
```

### Phase 2: Git Hook System (Weeks 3-4)
```bash
# Enhanced pre-commit hook
.git/hooks/pre-commit → .flowforge/hooks/pre-commit-aggregate.sh
- Aggregate user data to team summaries
- Validate JSON integrity
- Create backup snapshots
- Queue failures for daemon processing
```

### Phase 3: Background Daemon (Weeks 5-6)
```python
# Python daemon service
flowforge-aggregation-daemon.py
- Watch user directories for changes
- Process failed aggregations
- Maintain data integrity
- Generate health metrics
```

### Phase 4: CI/CD Integration (Weeks 7-8)
```yaml
# GitHub Actions workflow
time-aggregation-check.yml
- Verify aggregation integrity
- Reconcile missing summaries
- Generate audit reports
- Alert on failures
```

### Phase 5: Migration Tools (Weeks 9-10)
```bash
# v1.x to v2.0 migration
flowforge:migrate:v2 --preserve-history --verify-integrity
```

### Data Schema Evolution
```json
{
  "version": "2.0.0",
  "user_data": {
    "schema": "isolated, detailed, git-ignored",
    "location": ".flowforge/user/{username}/time/"
  },
  "team_data": {
    "schema": "aggregated, privacy-preserving, git-committed",
    "location": ".flowforge/team/summaries/"
  }
}
```

## Migration Strategy

### Backward Compatibility
1. **v1.x Detection**: Automatically detect existing `.task-times.json`
2. **Data Preservation**: Migrate all historical time tracking data
3. **Gradual Transition**: Run both systems in parallel during migration
4. **Verification**: Compare v1.x and v2.0 outputs for accuracy

### Team Rollout
1. **Alpha Testing**: Single developer validation (week 1)
2. **Beta Testing**: Small team validation (3-5 developers, week 2-3)
3. **Production Rollout**: Full team deployment (week 4+)
4. **Post-Migration**: Monitor aggregation health for 2 weeks

## Success Metrics

### Quantitative
- **Aggregation Success Rate**: Target 99.99% (measured)
- **Billing Report Generation**: < 5 seconds (measured)
- **Merge Conflict Reduction**: > 95% reduction (measured)
- **System Reliability**: 99.5% uptime (measured)

### Qualitative
- **Manager Satisfaction**: Can generate billing reports independently
- **Developer Satisfaction**: No workflow disruption
- **Team Productivity**: Reduced time spent on billing administration
- **Compliance Confidence**: Auditable time tracking for client billing

## References

- **Issue #231**: Team billing report generation crisis
- **Issue #57**: Multi-user merge conflicts (solved by ADR-0001)
- **FlowForge Rule #2**: Present options before implementing (4 options evaluated)
- **FlowForge Rule #14**: Document architectural decisions in ADRs
- **FlowForge Rule #33**: TIME = MONEY - Every minute must be tracked
- **Related**: [Production Architecture Documentation](../time-aggregation-devops-architecture.md)

## Risk Mitigation

### Data Loss Prevention
- **Automatic backups**: Every aggregation creates recovery snapshot
- **Checksums**: SHA256 integrity verification on all aggregations
- **Audit trail**: Complete log of all aggregation operations
- **Multiple recovery options**: 4-layer fallback system

### Privacy Protection
- **Local-only detailed data**: Sensitive time patterns never leave developer machine  
- **Configurable aggregation**: Teams control granularity of shared data
- **GDPR compliance**: Right to erasure and data portability built-in
- **Access controls**: File permissions enforce data boundaries

### Operational Risk
- **Comprehensive monitoring**: Health checks and alerting systems
- **Disaster recovery**: Documented procedures for all failure scenarios
- **Performance optimization**: Sub-second aggregation even with 50+ users
- **Team training**: Clear documentation and operational runbooks

## Date
2025-09-05

## Author
Alex Cruz (FlowForge Architecture Team)

## Approved By
- Architecture Review Board: ✅ Approved (2025-09-05)
- DevOps Team: ✅ Approved (2025-09-05)  
- Security Review: ✅ Approved (2025-09-05)
- Product Management: ✅ Approved (2025-09-05)