# ETACalculator API Reference

## Overview

The ETACalculator is the core calculation engine for the dual ETA feature in FlowForge statusline. It provides accurate time-to-completion estimates for individual tickets and project milestones by combining initial estimates, actual time tracking data, and historical velocity adjustments.

## Class: ETACalculator

### Constructor

```python
ETACalculator(
    time_tracking_path: str = ".flowforge/billing/time-tracking.json",
    velocity_history_path: str = ".flowforge/billing/velocity-history.json"
)
```

**Parameters:**
- `time_tracking_path` (str): Path to FlowForge time tracking data file
- `velocity_history_path` (str): Path to historical velocity data file

**Example:**
```python
from eta_calculator import ETACalculator

# Default initialization (uses FlowForge standard paths)
calculator = ETACalculator()

# Custom paths
calculator = ETACalculator(
    time_tracking_path="custom/time-tracking.json",
    velocity_history_path="custom/velocity.json"
)
```

### Core Methods

#### calculate_ticket_eta()

Calculate remaining time for a specific GitHub issue.

```python
calculate_ticket_eta(issue_number: str) -> float
```

**Parameters:**
- `issue_number` (str): GitHub issue number as string

**Returns:**
- `float`: Remaining hours (0.0 if overrun or completed)

**Raises:**
- `ValueError`: If issue number is invalid or no estimate found

**Algorithm:**
1. Parse original estimate from issue description
2. Get time already spent from time tracking
3. Calculate raw remaining time (estimate - spent)
4. Apply velocity adjustment based on historical data
5. Return adjusted remaining time (minimum 0.0)

**Example:**
```python
calculator = ETACalculator()

try:
    remaining = calculator.calculate_ticket_eta("142")
    print(f"Issue #142 has {remaining:.1f} hours remaining")
except ValueError as e:
    print(f"Cannot calculate ETA: {e}")

# Example outputs:
# "Issue #142 has 4.5 hours remaining"
# "Issue #142 has 0.0 hours remaining" (overrun case)
```

#### calculate_milestone_eta()

Calculate total remaining time for all open issues in a milestone.

```python
calculate_milestone_eta(milestone_name: str) -> float
```

**Parameters:**
- `milestone_name` (str): Name of the GitHub milestone

**Returns:**
- `float`: Total remaining hours for all open issues in milestone

**Algorithm:**
1. Fetch all issues associated with milestone
2. Filter to only open issues
3. Calculate remaining time for each issue
4. Sum all remaining times
5. Skip issues without estimates (with warning)

**Example:**
```python
calculator = ETACalculator()

# Calculate total milestone time
total_remaining = calculator.calculate_milestone_eta("v2.0 Launch")
print(f"Milestone 'v2.0 Launch' needs {total_remaining:.1f} hours")

# Example output:
# "Milestone 'v2.0 Launch' needs 24.5 hours"
```

#### calculate_milestone_eta_concurrent()

Calculate milestone ETA considering concurrent work by multiple developers.

```python
calculate_milestone_eta_concurrent(milestone_name: str) -> float
```

**Parameters:**
- `milestone_name` (str): Name of the GitHub milestone

**Returns:**
- `float`: Adjusted ETA considering team parallelization

**Algorithm:**
1. Calculate base milestone ETA (sequential work)
2. Get current team size
3. Apply Amdahl's law for parallel work (70% parallelizable)
4. Add coordination overhead (10%)
5. Return adjusted timeline

**Example:**
```python
calculator = ETACalculator()

# Sequential timeline
sequential = calculator.calculate_milestone_eta("v2.0")
print(f"Sequential: {sequential:.1f} hours")

# Concurrent timeline (3 developers)
concurrent = calculator.calculate_milestone_eta_concurrent("v2.0")
print(f"With 3 devs: {concurrent:.1f} hours")

# Example output:
# "Sequential: 40.0 hours"
# "With 3 devs: 18.3 hours"  # Faster with parallelization
```

### Data Access Methods

#### get_time_spent()

Get actual time spent on an issue from FlowForge time tracking.

```python
get_time_spent(issue_number: str) -> float
```

**Parameters:**
- `issue_number` (str): GitHub issue number as string

**Returns:**
- `float`: Hours spent on the issue (0.0 if no data)

**Data Source:** `.flowforge/billing/time-tracking.json`

**Example:**
```python
calculator = ETACalculator()

# Get time spent on issue
spent = calculator.get_time_spent("142")
print(f"Time spent on #142: {spent:.1f} hours")

# Example output:
# "Time spent on #142: 3.5 hours"
```

#### get_estimate()

Get the original estimate for an issue using EstimateParser.

```python
get_estimate(issue_number: str) -> Optional[float]
```

**Parameters:**
- `issue_number` (str): GitHub issue number as string

**Returns:**
- `Optional[float]`: Estimated hours, or None if no estimate found

**Data Source:** GitHub issue description parsed by EstimateParser

**Example:**
```python
calculator = ETACalculator()

estimate = calculator.get_estimate("142")
if estimate:
    print(f"Issue #142 estimated at {estimate:.1f} hours")
else:
    print("No estimate found for issue #142")

# Example output:
# "Issue #142 estimated at 8.0 hours"
```

### Velocity Methods

#### apply_velocity()

Apply velocity adjustment to an estimate based on historical team performance.

```python
apply_velocity(
    estimate: float,
    velocity: Optional[float] = None,
    issue_context: Optional[Dict[str, Any]] = None
) -> float
```

**Parameters:**
- `estimate` (float): Original estimate in hours
- `velocity` (Optional[float]): Velocity factor (defaults to team velocity)
- `issue_context` (Optional[Dict]): Issue metadata for context-based adjustments

**Returns:**
- `float`: Adjusted estimate based on velocity and context

**Velocity Scale:**
- `1.0`: Perfect estimate accuracy
- `< 1.0`: Team is slower than estimates (takes longer)
- `> 1.0`: Team is faster than estimates (takes less time)

**Context Adjustments:**
- **Bug fixes**: +20% overhead (bugs take longer)
- **Complex bugs**: +50% overhead
- **Simple features**: -20% time (often overestimated)

**Example:**
```python
calculator = ETACalculator()

# Basic velocity adjustment
original = 8.0
adjusted = calculator.apply_velocity(original, velocity=0.8)
print(f"8h with 0.8 velocity = {adjusted:.1f}h")  # 10.0h

# Context-aware adjustment
bug_context = {"type": "bug", "complexity": "high"}
bug_adjusted = calculator.apply_velocity(
    original,
    velocity=0.8,
    issue_context=bug_context
)
print(f"Complex bug: {bug_adjusted:.1f}h")  # 15.0h (8 / 0.8 * 1.5)
```

#### get_velocity()

Get current team velocity based on historical completion data.

```python
get_velocity(issue_number: Optional[str] = None) -> float
```

**Parameters:**
- `issue_number` (Optional[str]): Issue number for context-specific velocity

**Returns:**
- `float`: Current team velocity factor

**Calculation:**
```
velocity = average(estimated_time / actual_time) for completed issues
```

**Example:**
```python
calculator = ETACalculator()

# Get team velocity
velocity = calculator.get_velocity()
print(f"Team velocity: {velocity:.2f}")

# Interpretation:
# 1.00 = Perfect estimation
# 0.80 = Team takes 25% longer than estimates
# 1.25 = Team finishes 20% faster than estimates
```

#### calculate_velocity()

Calculate team velocity from historical completion data.

```python
calculate_velocity() -> float
```

**Returns:**
- `float`: Calculated velocity based on completion history

**Algorithm:**
1. Load completion history from velocity file
2. Calculate velocity for each completed issue: `estimated / actual`
3. Return average velocity across all historical data
4. Fall back to default velocity (1.0) if no history

**Example:**
```python
calculator = ETACalculator()

# Force recalculation of velocity
new_velocity = calculator.calculate_velocity()
print(f"Recalculated velocity: {new_velocity:.2f}")
```

### Data Management Methods

#### get_completion_history()

Get historical completion data for velocity calculations.

```python
get_completion_history() -> List[Dict[str, float]]
```

**Returns:**
- `List[Dict]`: List of completion records

**Data Structure:**
```python
[
    {
        "issue_number": "142",
        "estimated": 8.0,
        "actual": 10.5,
        "velocity": 0.76,
        "completed_date": "2024-09-15",
        "issue_type": "feature",
        "complexity": "medium"
    }
]
```

**Example:**
```python
calculator = ETACalculator()

history = calculator.get_completion_history()
print(f"Found {len(history)} completed issues")

for record in history[-5:]:  # Last 5 completed
    issue = record["issue_number"]
    velocity = record["velocity"]
    print(f"Issue #{issue}: velocity {velocity:.2f}")
```

#### get_milestone_issues()

Get all issues associated with a milestone.

```python
get_milestone_issues(milestone_name: str) -> List[Dict[str, Any]]
```

**Parameters:**
- `milestone_name` (str): Name of the milestone

**Returns:**
- `List[Dict]`: List of issue data dictionaries

**Issue Data Structure:**
```python
{
    "number": 142,
    "title": "Implement dual ETA feature",
    "state": "open",
    "milestone": "v2.0 Launch",
    "assignee": "developer1",
    "labels": ["enhancement", "statusline"]
}
```

**Example:**
```python
calculator = ETACalculator()

issues = calculator.get_milestone_issues("v2.0 Launch")
open_issues = [i for i in issues if i["state"] == "open"]
print(f"Milestone has {len(open_issues)} open issues")
```

#### get_team_size()

Get current team size for concurrent work calculations.

```python
get_team_size() -> int
```

**Returns:**
- `int`: Number of active developers on the project

**Default:** 1 (single developer)

**Configuration:**
```python
# Override team size
calculator.team_size = 3

# Or configure in team settings
team_size = calculator.get_team_size()
```

## Utility Functions

### format_eta()

Format hours into human-readable time strings.

```python
format_eta(hours: float) -> str
```

**Parameters:**
- `hours` (float): Number of hours (can be fractional or negative)

**Returns:**
- `str`: Formatted time string

**Format Rules:**
- **Work day**: 8 hours
- **Work week**: 5 days (40 hours)
- **Precision**: Minutes shown only for sub-day estimates
- **Overrun**: Negative hours shown as "Overrun by X"

**Examples:**
```python
from eta_calculator import format_eta

# Basic formatting
print(format_eta(2.5))    # "2h 30m"
print(format_eta(8.0))    # "1d"
print(format_eta(26.0))   # "3d 2h"
print(format_eta(45.0))   # "1w 1d"

# Edge cases
print(format_eta(0))      # "0m"
print(format_eta(-2.5))   # "Overrun by 2h 30m"

# Complex times
print(format_eta(168))    # "4w 1d"  (4 * 40 + 8)
print(format_eta(0.25))   # "15m"
```

## Standalone Functions

For convenience, key functionality is available as standalone functions:

### calculate_ticket_eta()

```python
calculate_ticket_eta(issue_number: str) -> float
```

Standalone wrapper for ticket ETA calculation.

**Example:**
```python
from eta_calculator import calculate_ticket_eta

remaining = calculate_ticket_eta("142")
print(f"Remaining: {remaining} hours")
```

### calculate_milestone_eta()

```python
calculate_milestone_eta(milestone_name: str) -> float
```

Standalone wrapper for milestone ETA calculation.

### get_time_spent()

```python
get_time_spent(issue_number: str) -> float
```

Standalone wrapper for time spent retrieval.

### apply_velocity()

```python
apply_velocity(estimate: float, issue_context: Optional[Dict] = None) -> float
```

Standalone wrapper for velocity adjustment.

## Error Handling

### Exception Types

#### ValueError
**Raised when:**
- Invalid issue number provided
- No estimate found for issue
- Invalid velocity value (≤ 0)

**Example:**
```python
try:
    eta = calculator.calculate_ticket_eta("invalid")
except ValueError as e:
    print(f"Error: {e}")
    # Fallback to milestone ETA or default display
```

#### FileNotFoundError / IOError
**Raised when:**
- Time tracking file missing
- Velocity history file corrupted
- Cache directory not writable

**Handling:**
```python
try:
    time_spent = calculator.get_time_spent("142")
except (FileNotFoundError, IOError):
    time_spent = 0.0  # Fallback to no time spent
```

### Graceful Degradation

The ETACalculator is designed to degrade gracefully:

```python
# Missing estimate - returns None
estimate = calculator.get_estimate("no-estimate-issue")
if estimate is None:
    # Fall back to milestone ETA only
    display_milestone_eta_only()

# Missing time tracking - returns 0.0
time_spent = calculator.get_time_spent("new-issue")
# Calculation proceeds with full estimate remaining

# Invalid velocity - uses default
adjusted = calculator.apply_velocity(8.0, velocity=-1.0)
# Warning logged, default velocity (1.0) used
```

## Performance Considerations

### Caching Strategy

- **Velocity caching**: Team velocity cached until manually invalidated
- **Issue data caching**: GitHub API responses cached for 5 minutes
- **Calculation caching**: Recent ETA calculations cached for 1 minute

### Optimization Tips

```python
# Batch calculations for better performance
calculator = ETACalculator()

# Calculate multiple tickets efficiently
issues = ["142", "143", "144"]
etas = []
for issue in issues:
    try:
        eta = calculator.calculate_ticket_eta(issue)
        etas.append((issue, eta))
    except ValueError:
        continue

# Warm the velocity cache
velocity = calculator.get_velocity()  # Calculated once, then cached
```

### Performance Metrics

- **Target calculation time**: < 100ms per ticket ETA
- **Target milestone time**: < 500ms for milestones with 20+ issues
- **Cache hit rate**: > 80% for repeated calculations
- **Memory usage**: < 10MB for typical project data

## Integration Examples

### Statusline Integration

```python
class FlowForgeStatusLine:
    def __init__(self):
        try:
            from eta_calculator import ETACalculator
            self.eta_calculator = ETACalculator()
            self.eta_available = True
        except ImportError:
            self.eta_available = False

    def _format_eta_component(self, issue_number, milestone_name):
        if not self.eta_available:
            return self._format_legacy_time()

        try:
            # Calculate dual ETAs
            ticket_eta = self.eta_calculator.calculate_ticket_eta(issue_number)
            milestone_eta = self.eta_calculator.calculate_milestone_eta(milestone_name)

            # Format based on terminal width
            if self._terminal_width() > 120:
                return f"⏰ {format_eta(ticket_eta)} on #{issue_number} | {format_eta(milestone_eta)} milestone"
            else:
                return f"⏰ #{issue_number}: {format_eta(ticket_eta)}/{format_eta(milestone_eta)}"

        except Exception:
            # Fallback to legacy display
            return self._format_legacy_time()
```

### Command Line Tool

```python
#!/usr/bin/env python3
"""FlowForge ETA command line tool."""

import sys
from eta_calculator import ETACalculator, format_eta

def main():
    if len(sys.argv) < 2:
        print("Usage: ff-eta <issue_number> [milestone]")
        sys.exit(1)

    calculator = ETACalculator()
    issue_number = sys.argv[1]

    try:
        # Ticket ETA
        ticket_eta = calculator.calculate_ticket_eta(issue_number)
        print(f"Issue #{issue_number}: {format_eta(ticket_eta)} remaining")

        # Milestone ETA (if provided)
        if len(sys.argv) > 2:
            milestone = sys.argv[2]
            milestone_eta = calculator.calculate_milestone_eta(milestone)
            print(f"Milestone '{milestone}': {format_eta(milestone_eta)} total")

    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
```

---

**Version:** FlowForge 2.0
**Module:** eta_calculator.py
**Author:** FlowForge Development Team
**Last Updated:** 2024-09-15