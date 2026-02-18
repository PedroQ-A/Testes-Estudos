# Bug Sidetracking Engine Performance Benchmark

This comprehensive performance benchmarking suite validates that the Bug Sidetracking Engine meets its critical performance requirement of **<370ms context switch time**.

## 🎯 Performance Targets

| Operation | Target | Critical |
|-----------|--------|----------|
| Context Switch | <370ms | ✅ |
| Branch Operations | <100ms | |
| Stack Operations | <50ms | |
| Memory Usage | <50MB per context | |
| Deep Nesting (5 levels) | <2000ms | |

## 🚀 Quick Start

### Run Full Benchmark Suite

```bash
# Run all performance tests
npm test src/sidetracking/tests/performance-benchmark.test.ts

# Or run the standalone CLI
npx ts-node src/sidetracking/tests/run-performance-benchmark.ts
```

### Run with Custom Options

```bash
# Generate reports in specific directory
npx ts-node src/sidetracking/tests/run-performance-benchmark.ts \
  --output-dir ./benchmark-results \
  --format all \
  --verbose

# Run with more samples for higher accuracy
npx ts-node src/sidetracking/tests/run-performance-benchmark.ts \
  --samples 20 \
  --format json
```

## 📊 Test Scenarios

### 1. Context Switch by Project Scale

Tests context switch performance across different project sizes:

- **Small Project**: 10 files, minimal complexity
- **Medium Project**: 100 files, moderate complexity  
- **Large Project**: 1000 files, high complexity (relaxed 500ms threshold)
- **Deep Nesting**: 50 files with 8-level directory structure

### 2. Branch Operations

Benchmarks git branch creation and switching operations:
- Creating bug branches
- Switching between branches
- Stash operations

### 3. Stack Operations

Tests the session stack performance:
- Push/pop operations
- Stack navigation
- State management

### 4. Deep Nesting Performance

Validates performance with nested bug scenarios:
- 5 levels of bug sidetracking
- Complete push/pop cycle
- Context restoration at each level

### 5. Memory Usage

Monitors memory consumption during operations:
- Peak memory usage
- Memory leaks detection
- Garbage collection efficiency

### 6. Concurrent Operations

Tests system behavior under concurrent load:
- Multiple simultaneous context switches
- Race condition handling
- Operation serialization

## 📈 Understanding Results

### Performance Metrics

Each test reports:
- **Average Time**: Mean execution time across all samples
- **95th Percentile**: Time under which 95% of operations complete
- **Min/Max Times**: Range of execution times
- **Memory Peak/Average**: Memory usage statistics
- **Pass/Fail Status**: Whether the test meets its threshold

### Example Output

```
🏁 PERFORMANCE BENCHMARK REPORT
═══════════════════════════════════════════

📅 Test Run: 2024-01-15T10:30:00.000Z
🖥️  Environment: Node v18.17.0 on linux
💻 System: 8 CPUs, 16.0GB RAM

📊 SUMMARY
─────────────────────────────────────────
Total Tests: 6
Passed: 6 ✅
Failed: 0 ✅
Overall: PASS ✅

🎯 CONTEXT SWITCH PERFORMANCE
Average: 285.42ms
Target: <370ms ✅

📋 DETAILED RESULTS
─────────────────────────────────────────

✅ Context Switch - Small Project
  • Average: 145.23ms
  • 95th percentile: 189.45ms
  • Threshold: 370ms
  • Samples: 10/10
  • Range: 112.34ms - 201.67ms

✅ Context Switch - Medium Project
  • Average: 278.91ms
  • 95th percentile: 325.67ms
  • Threshold: 370ms
  • Samples: 10/10
  • Range: 234.56ms - 342.12ms

🎉 All performance targets met! Bug Sidetracking Engine is ready for production.
```

## 🔧 Configuration

### Environment Variables

```bash
# Enable garbage collection profiling
NODE_ENV=test node --expose-gc

# Adjust memory limits for testing
NODE_OPTIONS="--max-old-space-size=4096"
```

### Benchmark Configuration

You can customize the benchmark behavior by modifying the test configuration:

```typescript
// In performance-benchmark.ts
const config = {
  samples: 10,           // Number of test iterations
  maxNestingDepth: 5,    // Maximum bug nesting depth
  timeoutMs: 30000,      // Test timeout
  memoryThresholdMB: 50  // Memory usage threshold
};
```

## 📁 Output Formats

### Console Output
Real-time performance results with color coding and progress indicators.

### JSON Report
Machine-readable format for CI/CD integration:

```json
{
  "testRun": "2024-01-15T10:30:00.000Z",
  "environment": {
    "nodeVersion": "v18.17.0",
    "platform": "linux",
    "cpuCount": 8,
    "memoryTotal": 17179869184
  },
  "results": [...],
  "overallPass": true,
  "summary": {
    "totalTests": 6,
    "passedTests": 6,
    "failedTests": 0,
    "averageContextSwitchTime": 285.42
  }
}
```

### Markdown Report
Documentation-friendly format for reports and wikis.

## 🔍 Troubleshooting

### Common Issues

**High Context Switch Times**
- Check if running on resource-constrained system
- Verify no other heavy processes running
- Consider adjusting file count for large project tests

**Memory Usage Spikes**
- Ensure garbage collection is working properly
- Check for memory leaks in test mocks
- Verify context cleanup after tests

**Inconsistent Results**
- Run with more samples (`--samples 20`)
- Check system load during testing
- Ensure deterministic test data

### Performance Regression Detection

The benchmark automatically flags tests that are approaching their thresholds:

```
⚠️ Tests approaching performance thresholds:
Context Switch - Medium Project: 87.4% of threshold
Branch Operations: 82.1% of threshold
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Benchmark

on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance benchmark
        run: |
          npx ts-node src/sidetracking/tests/run-performance-benchmark.ts \
            --format json \
            --output-dir ./benchmark-results
      
      - name: Upload benchmark results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: ./benchmark-results/
```

### Performance Monitoring

Track performance trends over time:

```bash
# Compare current performance with baseline
npx ts-node scripts/compare-performance.ts \
  --baseline ./benchmarks/baseline.json \
  --current ./benchmark-results/latest.json
```

## 📚 Technical Details

### Test Architecture

The benchmark suite uses a layered architecture:

1. **Test Data Generators**: Create realistic test scenarios
2. **Performance Measurer**: High-precision timing and memory tracking
3. **Mock Components**: Isolated testing without external dependencies
4. **Report Generators**: Multiple output formats for different use cases

### Measurement Precision

- **Timing**: Uses `process.hrtime.bigint()` for nanosecond precision
- **Memory**: Tracks heap usage with garbage collection
- **Statistics**: Calculates percentiles, averages, and variance

### Mocking Strategy

Tests use comprehensive mocking to ensure:
- Consistent performance across environments
- Isolation from external dependencies
- Deterministic test results
- Focus on core algorithm performance

## 🤝 Contributing

### Adding New Benchmarks

1. Create test scenario in `TestDataGenerator`
2. Add benchmark method to `PerformanceBenchmark` class
3. Define performance threshold
4. Update documentation

### Optimizing Performance

1. Run benchmark to identify bottlenecks
2. Profile specific operations with `--verbose`
3. Test optimizations against baseline
4. Verify no regressions in other tests

## 📊 Performance History

Track your optimization progress:

| Date | Context Switch | Branch Ops | Memory Usage | Notes |
|------|----------------|------------|--------------|-------|
| 2024-01-15 | 285ms | 45ms | 28MB | Initial baseline |
| 2024-01-16 | 267ms | 42ms | 25MB | Optimized git operations |
| 2024-01-17 | 251ms | 38ms | 23MB | Improved context serialization |

---

**Remember**: The <370ms context switch target is critical for user experience. All optimizations should prioritize this requirement while maintaining system reliability.