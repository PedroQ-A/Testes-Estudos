# Dual ETA Integration Documentation

## Overview

The FlowForge statusline now displays dual ETAs showing both individual ticket progress and overall milestone completion time. This provides developers with comprehensive time awareness at a glance.

## Implementation Details

### Integration Points

1. **In `statusline.py`:**
   - Import `ETACalculator` and `EstimateParser` with graceful fallback
   - Initialize ETA calculator in `__init__()` method
   - Calculate dual ETAs in `generate_status_line()` method
   - Format display in `_format_eta_component()` method

2. **ETA Calculation Flow:**
   ```python
   # Ticket ETA (if issue number available)
   ticket_eta_hours = eta_calculator.calculate_ticket_eta(issue_num)
   ticket_eta = format_eta(ticket_eta_hours)

   # Milestone ETA (if milestone name available)
   milestone_eta_hours = eta_calculator.calculate_milestone_eta(milestone_name)
   milestone_eta = format_eta(milestone_eta_hours)
   ```

3. **Display Formats:**
   - **Full format (wide terminals):** `⏰ 2h 30m on #423 | 10h milestone`
   - **Compact format (narrow terminals):** `⏰ #423: 2h 30m/10h`
   - **Overrun format:** `⏰ Overrun on #423 | 8h milestone`

## Display Logic

### Format Selection
- **Terminal width > 120 columns:** Full format
- **Terminal width ≤ 120 columns:** Compact format

### Fallback Behavior
1. **ETA calculation fails:** Falls back to milestone due date
2. **No ETAs available:** Shows original time_remaining format
3. **Import failures:** Graceful degradation without dual ETAs

### Example Outputs

#### Successful Dual ETA Display
```
[FlowForge] | 🎯 FlowForge v2.0 Launch (8/12) [██████░░░░] 67% | ⏰ 4h 30m on #422 | 3d 4h milestone | 🌿 feature/422-integration | Session: 2h 15m | Opus 4.1 | ● Active
```

#### Compact Format
```
[FlowForge] | 🎯 v2.1-milestone (5/10) [█████░░░░░] 50% | ⏰ #423: 1d/3d 2h | 🌿 feature/423-work | Session: 1h 30m | Opus 4.1
```

#### Overrun Scenario
```
[FlowForge] | 🎯 Sprint 42 (9/10) [█████████░] 90% | ⏰ Overrun on #456 | 2h milestone | 🌿 feature/456-fix | Opus 4.1 | ● Active
```

## Technical Implementation

### Error Handling
- **Import failures:** Graceful fallback to original ETA display
- **Calculation errors:** Falls back to milestone due date
- **Missing data:** Shows appropriate partial information

### Performance Considerations
- **ETA calculation caching:** Utilizes velocity cache in ETACalculator
- **Conditional imports:** Only imports ETA modules when available
- **Graceful degradation:** No performance impact when modules unavailable

### Integration Requirements
- **ETACalculator module:** For ticket and milestone calculations
- **EstimateParser module:** For parsing issue estimates
- **Time tracking data:** `.flowforge/billing/time-tracking.json`
- **Velocity history:** `.flowforge/billing/velocity-history.json`

## Testing Coverage

### Test Suite: `test_dual_eta_integration.py`
- **Expected use cases:** Full and compact format display
- **Edge cases:** Zero ETAs, calculation failures, missing data
- **Failure cases:** Import errors, corrupted data, API failures
- **Format variations:** Terminal width-based format selection

### Test Results
- **12 test cases:** All passing
- **Coverage areas:** Integration, formatting, error handling, fallbacks

## Benefits

1. **Developer Awareness:** Clear visibility of both immediate and long-term progress
2. **Time Management:** Better planning with dual time perspectives
3. **Milestone Tracking:** Comprehensive project timeline awareness
4. **Professional Display:** Clean, informative statusline integration

## Future Enhancements

- **Concurrent team calculations:** Account for multiple developers
- **Velocity adjustments:** Historical performance-based estimates
- **Smart formatting:** Dynamic format based on remaining time ranges
- **Progress indicators:** Visual ETA progress bars

---

**Implementation Status:** ✅ Complete and tested
**Version:** FlowForge 2.0
**Author:** FlowForge Backend Team