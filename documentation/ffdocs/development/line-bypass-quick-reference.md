# FlowForge Line-Level Bypass - Quick Reference

## Syntax
```javascript
// @flowforge-bypass: rule8 - Reason here (minimum 10 characters)
```

## Placement Options
```javascript
// Option 1: Same line
console.log('debug'); // @flowforge-bypass: rule8 - Temporary debug for issue #456

// Option 2: Previous line
// @flowforge-bypass: rule8 - Error already handled by upstream service
console.log('fallback');
```

## Supported Rules
- **Rule #8**: Code Quality Standards (console.log, empty catch blocks)

## Cannot Bypass (Security Restrictions)
- **Rule #5**: Task management requirements
- **Rule #18**: Git flow compliance 
- **Rule #12**: Task approval requirements
- **Rule #33**: Professional output standards

## Requirements
✅ Must specify correct rule number  
✅ Must include dash separator (` - `)  
✅ Reason must be 10+ characters  
✅ Must be same line or immediately previous line

## Examples

### Logger Utility
```javascript
// @flowforge-bypass: rule8 - Logger utility needs console.log for output functionality
console.log('INFO:', message);
```

### Development Debug
```javascript
console.log(userData); // @flowforge-bypass: rule8 - Temporary debug for production issue #789
```

### Empty Catch Block
```javascript
try {
  riskyOperation();
} catch (e) { // @flowforge-bypass: rule8 - Errors logged by riskyOperation internally
  // Handled upstream
}
```

## Invalid Examples
```javascript
// ❌ Too short reason
console.log('test'); // @flowforge-bypass: rule8 - debug

// ❌ Missing dash
console.log('test'); // @flowforge-bypass: rule8 reason here

// ❌ Wrong rule number
console.log('test'); // @flowforge-bypass: rule9 - This is rule 8 violation

// ❌ Too far away
// @flowforge-bypass: rule8 - Valid reason but too far

console.log('test'); // This will fail - bypass too far away
```

## Audit Trail
All bypasses logged to `.flowforge/audit/rule-bypasses.log`:
```
[2025-09-06 10:30:15] LINE-BYPASS Rule #8 bypassed in logger.js:42 - Reason: Logger utility needs console.log for output functionality
```

## When to Use
- **Logger utilities** that need console.log by design
- **Temporary debugging** for specific issues
- **Legacy integration** where upstream handles errors
- **Development tools** that require console output

## When NOT to Use
- **Regular development** - fix the underlying issue instead
- **Avoiding tests** - write proper tests
- **Lazy debugging** - use proper debugging tools
- **Production shortcuts** - follow proper practices

## Best Practices
1. **Be specific** with reasons
2. **Reference tickets** when applicable  
3. **Review regularly** and clean up
4. **Code review** all bypasses
5. **Temporary use** - plan for cleanup

## Related Commands
```bash
# Check rule compliance
/flowforge:dev:checkrules

# View bypass log
cat .flowforge/audit/rule-bypasses.log

# Emergency commit-level bypass (if line-level insufficient)
git commit -m "fix: emergency [skip-rules]"
```

---
**Remember**: Line-level bypass provides surgical precision. Use commit-level bypass only for broader emergencies.