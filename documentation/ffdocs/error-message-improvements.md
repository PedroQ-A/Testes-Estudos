# Error Message Improvements - UnifiedTimeManager

## Summary
Improved error message specificity across all UnifiedTimeManager modules to make them more actionable and helpful for debugging. Each error now includes:
- Specific context about what went wrong
- The actual values that were received
- Expected formats or values
- Recovery suggestions and next steps

## Files Modified

### 1. UnifiedTimeManager.ts
- **Session not found errors**: Now show available sessions (first 10) and suggest actions
- **Billing lookup errors**: Include list of available sessions and guidance

### 2. UnifiedTimeManagerFeatures.ts
- **Invalid feature ID**: Shows the invalid value, expected formats, and examples
- **Timer already running**: Shows when the timer started and how to restart or pause
- **No active timer**: Explains possible reasons and suggests starting a new timer
- **Resume errors**: Provides clear next steps for creating new timers

### 3. UnifiedTimeManagerBugs.ts
- **Invalid bug ID**: Shows expected formats with examples like 'bug-fix-123'
- **Parent session not found**: Lists available sessions and guides to start parent first
- **Max nesting depth**: Shows current depth, parent ID, and suggests solutions
- **Timer errors**: Similar improvements to feature timers with bug-specific context

### 4. UnifiedTimeManagerSessions.ts
- **No backup directory**: Shows the expected path and how to create backups
- **No backup files**: Explains the expected file format and creation process

### 5. UnifiedTimeManagerUtilities.ts
- **Validation errors**: Shows error count and first few errors with option for full details
- **Backup/restore errors**: Provides specific paths and instructions

### 6. UnifiedTimeManagerHelpers.ts
- **Session type validation**: Shows the invalid type and expected values
- **Start time validation**: Indicates possible data corruption and recovery options
- **Depth validation**: Explains valid ranges and possible causes
- **Duration validation**: Mentions possible causes like system time changes

## Examples of Improved Error Messages

### Before
```
'Invalid feature ID format'
'Session not found'
'No active timer found'
'Maximum nesting depth exceeded'
```

### After
```
Invalid feature ID format: 'invalid_format'. Expected format: 'feature-123', 'issue-456', or '#789'. Feature IDs should start with 'feature-', 'issue-', or '#' followed by numbers.

Session not found: 'fake-session'. Active sessions: [feature-100, bug-200, feature-123...]. Use getSession() with an existing session ID or start a new session first.

No active timer found for feature: 'feature-999'. Either the timer was never started, already stopped at 2025-08-31T05:00:00.000Z, or the session has expired. Use startFeatureTimer('feature-999') to begin tracking.

Maximum nesting depth (3) exceeded. Current depth: 3, Parent: 'bug-level-2'. Consider flattening the bug hierarchy or increasing maxNestingDepth in configuration.
```

## Testing
Created comprehensive test suite in `tests/sidetracking/improved-error-messages.test.ts` that validates:
- All error messages include specific context
- Recovery suggestions are provided
- Available options are listed where relevant
- Error messages are actionable for developers

All 11 tests pass, confirming the improvements are working correctly.

## Benefits
1. **Faster debugging**: Developers can immediately see what went wrong
2. **Self-documenting**: Error messages explain the system's expectations
3. **Actionable**: Each error provides clear next steps
4. **Context-aware**: Shows relevant system state (available sessions, current values)
5. **Professional**: No generic errors - everything is specific and helpful