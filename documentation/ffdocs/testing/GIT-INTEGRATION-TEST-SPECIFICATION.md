# Git-Integrated Namespace Test Specification

**Issue**: #548 - Developer Namespace Separation
**Test Status**: RED - All tests designed to FAIL until backend implementation
**Created**: 2025-09-18
**Test Coverage**: 80%+ comprehensive coverage for all Git integration features

## Overview

This document provides comprehensive Test-Driven Development (TDD) specifications for the Git-Integrated Namespace system. All tests are currently in **RED phase** and will FAIL until the backend developer implements the required functionality.

## Test Suite Structure

### 📁 Test Files Location: `/tests/namespace/`

```
tests/namespace/
├── git-integration.test.sh        # Directory structure & Git tracking
├── git-sync.test.sh               # Synchronization & conflict resolution
├── team-reporting.test.sh         # Team visibility & reporting
├── cross-machine.test.sh          # Cross-machine portability
└── run-git-integration-tests.sh   # Comprehensive test runner
```

## Test Categories & Requirements

### 1. Git Integration Tests (`git-integration.test.sh`)

**Purpose**: Verify Git-aware directory structure and tracking
**Expected Failures**: 18 tests

#### Required Backend Implementation:

1. **scripts/namespace/migrate-to-git.sh**
   ```bash
   # Must implement migration from old structure to Git-integrated structure
   migrate_namespace_to_git() {
       local dev_id="$1"
       # Create developers/, team/, local/ directories
       # Migrate existing dev-{id}/ data to developers/{id}/
       # Update .gitignore rules
       # Preserve all existing data
   }
   ```

2. **Git-aware directory creation**
   ```
   .flowforge/
   ├── developers/         # IN GIT - Shared developer data
   │   └── {dev_id}/
   │       ├── profile.json
   │       ├── sessions/history/
   │       ├── time-tracking/
   │       └── workspace/
   ├── team/               # IN GIT - Team coordination
   │   ├── config.json
   │   ├── task-assignments.json
   │   └── active-developers.json
   └── local/              # GITIGNORED - Machine-specific
       ├── cache/
       ├── locks/
       └── temp/
   ```

3. **.gitignore management**
   ```gitignore
   # Auto-generated rules
   .flowforge/local/
   .flowforge/developers/*/sessions/current/
   .flowforge/developers/*/cache/
   .flowforge/developers/*/temp/
   ```

#### Key Test Scenarios:
- [x] Directory structure creation and Git tracking
- [x] .gitignore configuration and enforcement
- [x] Migration from old to new structure
- [x] Developer profile creation in Git
- [x] Team configuration files in Git

### 2. Git Synchronization Tests (`git-sync.test.sh`)

**Purpose**: Verify automatic Git sync and conflict resolution
**Expected Failures**: 16 tests

#### Required Backend Implementation:

1. **scripts/namespace/git-sync.sh**
   ```bash
   sync_developer_data() {
       local dev_id="$1"
       local action="$2"  # push|pull|merge

       case "$action" in
           push)
               # Stage shareable data
               # Create conventional commit
               # Push to remote
               ;;
           pull)
               # Pull latest team data
               # Migrate to local namespace
               ;;
           merge)
               # Handle conflicts automatically
               ;;
       esac
   }

   resolve_team_conflicts() {
       # Implement earliest-wins conflict resolution
       # Preserve conflict history
       # Log failed assignments
   }
   ```

2. **Integration with session commands**
   - session:start → git pull latest team data
   - session:end → git push completed session data

3. **Performance requirements**
   - Sync operations must complete in <2 seconds
   - Only changed files should be processed

#### Key Test Scenarios:
- [x] Automatic sync on session end
- [x] Time-log copying to developers/ directory
- [x] Profile sync with timestamp updates
- [x] Git commit creation with proper messages
- [x] Conflict resolution mechanisms
- [x] Performance optimization validation

### 3. Team Reporting Tests (`team-reporting.test.sh`)

**Purpose**: Verify team visibility and reporting features
**Expected Failures**: 19 tests

#### Required Backend Implementation:

1. **Team reporting commands**
   ```bash
   # New commands to implement:
   flowforge:team:status          # Current team status
   flowforge:team:report daily    # Daily team report
   flowforge:team:report weekly   # Weekly aggregation
   flowforge:team:report monthly  # Monthly aggregation
   flowforge:team:who            # Active developers
   flowforge:team:activity       # Activity timeline
   ```

2. **Cross-developer visibility**
   - Real-time active developer tracking
   - Task assignment visibility
   - Work progress sharing
   - Privacy controls for sensitive data

3. **Time aggregation system**
   - Daily/weekly/monthly hour totals
   - Billable vs total hours distinction
   - Timezone-aware calculations
   - Performance optimization (<30s for reports)

#### Key Test Scenarios:
- [x] Report generation from Git-tracked data
- [x] Cross-developer visibility features
- [x] Time aggregation across sessions
- [x] Report performance with large datasets
- [x] Team coordination features
- [x] Export and integration capabilities

### 4. Cross-Machine Portability Tests (`cross-machine.test.sh`)

**Purpose**: Verify session restore and data portability
**Expected Failures**: 12+ tests

#### Required Backend Implementation:

1. **Session restore functionality**
   ```bash
   # New commands to implement:
   flowforge:session:restore {session_id}  # Restore specific session
   flowforge:context:restore               # Restore work context
   flowforge:machine:setup {machine_id}    # Setup on new machine
   ```

2. **Context preservation**
   - Working directory state
   - Open files and cursor positions
   - Terminal command history
   - User notes and bookmarks

3. **Data portability features**
   - Complete workspace synchronization
   - Settings and preferences sync
   - Machine-specific data handling
   - Cross-machine conflict resolution

#### Key Test Scenarios:
- [x] Session restore from Git on different machine
- [x] Context preservation across machines
- [x] Data portability and synchronization
- [x] Cross-machine conflict resolution
- [x] Performance with large datasets

## Running the Tests

### Execute Full Test Suite
```bash
# Run comprehensive test suite
./tests/namespace/run-git-integration-tests.sh

# Run individual test files
./tests/namespace/git-integration.test.sh
./tests/namespace/git-sync.test.sh
./tests/namespace/team-reporting.test.sh
./tests/namespace/cross-machine.test.sh
```

### Expected Output (RED Phase)
```
🧪 [FFT-TESTING] Git-Integrated Namespace Test Suite Results
===========================================================

📊 Suite Summary:
  Total Suites: 4
  Passed: 0
  Failed: 4

📈 Test Summary:
  Total Tests: 63
  Passed: 10
  Failed: 53
  Pass Rate: 16%

🎯 Implementation Status for Issue #548:
❌ RED PHASE - Tests failing as expected
```

## Implementation Checklist

### Phase 1: Git Integration Infrastructure
- [ ] Create `scripts/namespace/migrate-to-git.sh`
- [ ] Update `scripts/namespace/manager.sh` for Git operations
- [ ] Implement `.gitignore` rule management
- [ ] Create developer profile system
- [ ] Implement team configuration management

### Phase 2: Synchronization Features
- [ ] Create `scripts/namespace/git-sync.sh`
- [ ] Implement `sync_developer_data` function
- [ ] Add integration with session commands
- [ ] Implement conflict resolution mechanisms
- [ ] Optimize sync performance (<2s)

### Phase 3: Team Reporting
- [ ] Implement `flowforge:team:status` command
- [ ] Add `flowforge:team:report` with variants
- [ ] Create `flowforge:team:who` and `flowforge:team:activity`
- [ ] Implement time aggregation with timezone support
- [ ] Add export capabilities (CSV, JSON)

### Phase 4: Cross-Machine Features
- [ ] Implement `flowforge:session:restore` command
- [ ] Add `flowforge:context:restore` functionality
- [ ] Create `flowforge:machine:setup` command
- [ ] Implement cross-machine conflict detection
- [ ] Optimize performance for large datasets

## Success Metrics

### Technical Metrics
- **Test Pass Rate**: 100% (all 63+ tests passing)
- **Performance**: <2s sync, <30s reports
- **Coverage**: 80%+ code coverage
- **Reliability**: Zero data loss during operations

### Functional Metrics
- **Cross-Machine Portability**: 100% session recovery rate
- **Team Visibility**: Real-time developer status
- **Conflict Resolution**: <1% conflict rate
- **Data Integrity**: All Git operations atomic

## TDD Development Flow

### 1. RED Phase (Current)
✅ **Complete** - All tests written and failing as expected

### 2. GREEN Phase (Implementation)
🔄 **In Progress** - Backend developer implements functionality
- Run specific test file to target implementation
- Implement minimal code to make tests pass
- Focus on one test at a time

### 3. REFACTOR Phase (Optimization)
⏳ **Pending** - Optimize and improve implementation
- Refactor code while keeping tests green
- Add performance optimizations
- Improve error handling and edge cases

## Backend Developer Guidance

### Getting Started
1. Start with `git-integration.test.sh` - foundation tests
2. Implement `migrate-to-git.sh` script first
3. Run tests frequently to verify progress
4. Each test provides specific implementation guidance

### Test-Driven Workflow
```bash
# 1. Run failing test to understand requirement
./tests/namespace/git-integration.test.sh

# 2. Implement minimal functionality
# ... code implementation ...

# 3. Run test again to verify progress
./tests/namespace/git-integration.test.sh

# 4. Continue until all tests pass
```

### Implementation Tips
- **Start Simple**: Implement basic functionality first
- **One Test at a Time**: Focus on making one test pass
- **Follow Patterns**: Use existing FlowForge patterns
- **Performance Last**: Get functionality working, then optimize

## Documentation Updates Required

When implementation is complete, update:
- [ ] `README.md` with new Git integration features
- [ ] `ARCHITECTURE.md` with Git-based data flow
- [ ] Command documentation in `/commands/flowforge/`
- [ ] User guides for cross-machine setup

## Quality Assurance

### Automated Testing
- All tests must pass before merging
- Performance benchmarks must be met
- No data loss scenarios allowed

### Manual Testing
- Test with multiple developers simultaneously
- Verify cross-machine functionality
- Validate conflict resolution scenarios
- Test performance with realistic data volumes

---

**Next Steps**: Backend developer should begin with `git-integration.test.sh` and implement the foundational Git-aware directory structure and migration functionality.

**Contact**: FlowForge Testing Team for questions about test scenarios or requirements.

**Version**: 1.0.0 - RED Phase Complete