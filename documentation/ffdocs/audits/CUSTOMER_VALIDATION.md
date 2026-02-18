
# FlowForge StatusLine Customer Validation Checklist

## Quick Validation Steps

### 1. Installation Verification
```bash
# Check all required files exist
ls -la .claude/statusline.py
ls -la .claude/statusline_cache.py
ls -la .claude/statusline_data_loader.py
ls -la .claude/statusline_helpers.py
ls -la .claude/context_usage_calculator.py
```

### 2. Basic Execution Test
```bash
# Test basic execution
echo '{"model": {"display_name": "Test Model"}}' | python .claude/statusline.py
# Expected: Should output "[FlowForge] | ..." without errors
```

### 3. Visual Elements Test
```bash
# Test with milestone data
mkdir -p .flowforge
echo '{"current_milestone": {"name": "Test v1.0", "completed": 3, "total": 8}}' > .flowforge/tasks.json
echo '{"model": {"display_name": "Claude 3.5 Sonnet"}}' | python .claude/statusline.py
# Expected: Should show progress bars, icons (🎯, 🌿, 🧠), and proper formatting
```

### 4. Branch Integration Test
```bash
# Test with feature branch
git checkout -b feature/123-test-validation
echo '{"model": {"display_name": "Claude"}}' | python .claude/statusline.py
# Expected: Should show branch name with 🌿 icon
```

### 5. Context Calculation Test
```bash
# Create test transcript
echo '{"content": "This is a test message with some content to calculate context usage."}' > test_transcript.jsonl
echo '{"model": {"display_name": "Claude"}, "transcript_path": "test_transcript.jsonl"}' | python .claude/statusline.py
# Expected: Should show context percentage with 🧠 icon
```

## Validation Criteria

### ✅ Must Have:
- [ ] Executes without Python errors
- [ ] Shows "[FlowForge]" indicator
- [ ] Displays project/milestone name
- [ ] Contains visual icons: 🎯, 🌿, 🧠
- [ ] Proper time formatting (e.g., "2h 15m", not "135m")
- [ ] Unicode progress bars work (█ and ░ characters)

### ✅ Should Have (if data available):
- [ ] Milestone progress (X/Y tasks)
- [ ] Context percentage
- [ ] Branch name display
- [ ] Session timing (if active)
- [ ] Model name display

### ✅ Edge Cases:
- [ ] Works without GitHub token
- [ ] Handles missing milestone data gracefully
- [ ] Doesn't crash on corrupted JSON
- [ ] Executes in reasonable time (< 5 seconds)

## Troubleshooting

### Common Issues:
1. **ImportError**: Ensure all .claude/*.py files are present
2. **No output**: Check if running from project root directory
3. **Encoding errors**: Ensure terminal supports Unicode characters
4. **Slow execution**: Check transcript file size, consider cleanup

### Support:
- Check logs in ~/.cache/flowforge/ directory
- Run with debugging: `python -u .claude/statusline.py`
- Validate JSON files: `python -m json.tool .flowforge/tasks.json`
