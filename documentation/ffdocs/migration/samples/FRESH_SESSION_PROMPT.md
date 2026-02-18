# Fresh Session Prompt for Ticket #244

## Copy this entire prompt for the new session:

---

I need to continue working on ticket #244 - Migration tool for v1.x to v2.0. 

Please start the session with:
```bash
./run_ff_command.sh flowforge:session:start 244
```

Then review the ticket comment which documents what's already implemented and what remains.

## Key Context:
- We've moved COMPLETELY to JSON-based architecture - NO .md files for control/tracking
- User-isolated storage is already implemented (Issue #239)
- Provider bridge with task ordering is ready
- Some migration scripts exist but need enhancement

## What I Need You To Do:

1. **Create the migration command** at `/commands/flowforge/migrate/v2.md` with:
   - Dry-run mode for preview
   - Execute mode for actual migration
   - Validate mode for verification
   - Backup and rollback capabilities

2. **Implement MD file processors** to convert:
   - SESSIONS.md → sessions/*.json
   - SCHEDULE.md → milestones in tasks.json
   - Remove next-session.md (replaced by provider bridge)

3. **Extract user data** from MD files:
   - Identify all developers
   - Create `.flowforge/user/{username}/` directories
   - Split time tracking by user
   - Apply privacy protection

4. **Add validation**:
   - 100% billing accuracy check
   - Mathematical verification
   - Audit report generation

5. **Follow TDD approach** (Rule #3):
   - Write tests FIRST
   - 80%+ coverage required
   - Test all edge cases

## Important Files to Check:
- `src/core/user-isolated-storage.js` - Already handles user directories
- `scripts/migrate-md-to-json.sh` - Has basic migration logic
- `scripts/provider-bridge.js` - Provider operations
- `.flowforge/tasks.json` - Target structure

## Success Criteria:
- All MD tracking files migrated to JSON
- Zero data loss (100% preservation)
- User directories created and populated
- Privacy rules applied
- Full audit trail
- Rollback capability
- <30 minutes for 10,000 entries

Please implement this following FlowForge rules, especially:
- Rule #3: TDD (tests first)
- Rule #35: Use FlowForge agents when available
- Rule #2: Present 3 options before implementing

The ticket has a 3-hour estimate, with ~1 hour already spent on infrastructure, leaving ~2 hours for completion.

---

## End of prompt