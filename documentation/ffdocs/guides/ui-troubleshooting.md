# FlowForge UI Enhanced Troubleshooting Guide

## Quick Diagnostic Commands

### Check Terminal Capabilities
```bash
# Get comprehensive terminal info
node -e "const {TerminalCapabilities} = require('./dist/ui-enhanced'); console.log(JSON.stringify(TerminalCapabilities.getCapabilities(), null, 2));"

# Check specific capabilities
node -e "const {TerminalCapabilities} = require('./dist/ui-enhanced'); console.log('Color:', TerminalCapabilities.supportsColor()); console.log('Unicode:', TerminalCapabilities.supportsUnicode()); console.log('Width:', TerminalCapabilities.getTerminalWidth());"

# Get UI recommendations
node -e "const {TerminalCapabilities} = require('./dist/ui-enhanced'); console.log(JSON.stringify(TerminalCapabilities.getUIRecommendations(), null, 2));"
```

### Test Logo Generation
```bash
# Basic logo test
node -e "const {LogoGenerator} = require('./dist/ui-enhanced'); const lg = new LogoGenerator(); lg.generateASCIILogo('Test').then(console.log).catch(console.error);"

# Test with specific width
node -e "const {LogoGenerator} = require('./dist/ui-enhanced'); const lg = new LogoGenerator(); lg.generateASCIILogo('Test', {width: 60}).then(console.log);"

# Test figlet availability
node -e "const {LogoGenerator} = require('./dist/ui-enhanced'); const lg = new LogoGenerator(); console.log('Figlet available:', lg.isFigletAvailable());"
```

## Common Issues and Solutions

### 1. Logo Not Displaying Correctly

#### Symptoms
- No logo appears
- Plain text instead of ASCII art
- Garbled characters

#### Diagnosis
```bash
# Check figlet availability
node -e "try { const figlet = require('figlet'); console.log('Figlet OK'); } catch(e) { console.log('Figlet missing:', e.message); }"

# Test direct figlet
node -e "const figlet = require('figlet'); console.log(figlet.textSync('Test'));"
```

#### Solutions

**Missing figlet dependency:**
```bash
npm install figlet @types/figlet
# or
npm install
```

**Figlet working but logo not showing:**
```typescript
// Check LogoGenerator initialization
const logoGenerator = new LogoGenerator();
console.log('Figlet available:', logoGenerator.isFigletAvailable());

// Test with fallback
const logo = await logoGenerator.generateASCIILogo('Test');
console.log('Logo length:', logo.length);
```

**Terminal encoding issues:**
```bash
# Check locale
echo $LANG
echo $LC_ALL

# Set UTF-8 if needed
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
```

### 2. Colors Not Working

#### Symptoms  
- No colors in output
- Colors appear as escape sequences
- Black and white only

#### Diagnosis
```bash
# Check color support
node -e "const {TerminalCapabilities} = require('./dist/ui-enhanced'); console.log('Color support:', TerminalCapabilities.supportsColor()); console.log('Color depth:', TerminalCapabilities.getColorDepth());"

# Environment variables
echo "TERM: $TERM"
echo "FORCE_COLOR: $FORCE_COLOR" 
echo "NO_COLOR: $NO_COLOR"
echo "COLORTERM: $COLORTERM"
```

#### Solutions

**Force color output:**
```bash
export FORCE_COLOR=1
export TERM=xterm-256color
```

**Check terminal type:**
```bash
# Set appropriate TERM
export TERM=xterm-256color    # Most terminals
export TERM=screen-256color   # Screen/tmux
export TERM=xterm-color       # Basic color
```

**Test gradient-string:**
```bash
node -e "const gradient = require('gradient-string'); console.log(gradient(['#6f42c1', '#3498db'])('Hello World'));"
```

**Disable colors if needed:**
```bash
export NO_COLOR=1
```

### 3. Layout/Size Issues

#### Symptoms
- Logo too wide for terminal
- Text wrapping incorrectly
- Layout looks broken

#### Diagnosis
```bash
# Check terminal dimensions
echo "Columns: $(tput cols)"
echo "Lines: $(tput lines)"
node -e "console.log('stdout.columns:', process.stdout.columns);"

# Test with different widths
COLUMNS=40 node -e "const {LogoGenerator} = require('./dist/ui-enhanced'); const lg = new LogoGenerator(); lg.generateASCIILogo('Test').then(console.log);"
```

#### Solutions

**Override terminal width:**
```bash
export COLUMNS=80
export LINES=24
```

**Test responsive design:**
```typescript
const logoGenerator = new LogoGenerator();
const design = await logoGenerator.responsiveDesign('FlowForge');
console.log('Recommended:', design);

const logo = await logoGenerator.generateASCIILogo('FlowForge', {
  width: design.maxWidth
});
```

**Force specific width:**
```typescript
const logo = await logoGenerator.generateASCIILogo('FlowForge', {
  width: 60 // Force narrow layout
});
```

### 4. Performance Issues

#### Symptoms
- Slow logo generation (>200ms)
- High memory usage
- UI freezes or hangs

#### Diagnosis
```bash
# Test performance with timing
node -e "const {LogoGenerator} = require('./dist/ui-enhanced'); const lg = new LogoGenerator(); const start = Date.now(); lg.generateASCIILogo('FlowForge', {verbose: true}).then(() => console.log('Duration:', Date.now() - start, 'ms'));"

# Memory usage
node -e "const {LogoGenerator} = require('./dist/ui-enhanced'); const used = process.memoryUsage(); console.log('Memory before:', used.heapUsed / 1024 / 1024, 'MB'); const lg = new LogoGenerator(); setTimeout(() => { const after = process.memoryUsage(); console.log('Memory after:', after.heapUsed / 1024 / 1024, 'MB'); }, 1000);"
```

#### Solutions

**Disable gradients for performance:**
```typescript
const logo = await logoGenerator.generateASCIILogo('FlowForge', {
  applyGradient: false
});
```

**Use simpler fonts:**
```typescript  
const logoGenerator = new LogoGenerator({
  font: 'small'  // Faster than 'ANSI Shadow'
});
```

**Reduce width for performance:**
```typescript
const logoGenerator = new LogoGenerator({
  maxWidth: 60  // Smaller = faster
});
```

### 5. CI/CD Integration Issues

#### Symptoms
- Installation fails in CI/CD
- Colors appear in logs when they shouldn't
- TTY-related errors

#### Diagnosis
```bash
# Check CI environment
echo "CI: $CI"
echo "TTY stdin: $(tty < /dev/stdin || echo 'not a tty')"
echo "TTY stdout: $(tty > /dev/stdout || echo 'not a tty')"

node -e "console.log('stdin.isTTY:', process.stdin.isTTY); console.log('stdout.isTTY:', process.stdout.isTTY);"
```

#### Solutions

**Force non-interactive mode:**
```bash
export NO_COLOR=1
export CI=true
```

**Check TTY handling:**
```typescript
const capabilities = TerminalCapabilities.getCapabilities();
if (!capabilities.isTTY) {
  // Use plain text only
  const logo = await logoGenerator.generateASCIILogo('FlowForge', {
    applyGradient: false
  });
}
```

**CI-specific configuration:**
```yaml
# .github/workflows/test.yml
env:
  NO_COLOR: 1
  TERM: dumb
```

### 6. Font Issues

#### Symptoms
- "Font not found" errors
- Inconsistent logo appearance
- Fallback fonts not working

#### Diagnosis
```bash
# List available fonts
node -e "const figlet = require('figlet'); figlet.fonts((err, fonts) => { if(err) console.error(err); else console.log(fonts.slice(0, 10)); });"

# Test specific font
node -e "const figlet = require('figlet'); try { console.log(figlet.textSync('Test', {font: 'ANSI Shadow'})); } catch(e) { console.error('Font error:', e.message); }"
```

#### Solutions

**Use safe fonts:**
```typescript
const logoGenerator = new LogoGenerator({
  font: 'Standard'  // Always available
});

// Or check availability first
const fonts = await logoGenerator.getAvailableFonts();
console.log('Available fonts:', fonts.slice(0, 5));
```

**Handle font errors:**
```typescript
try {
  const logo = await logoGenerator.generateASCIILogo('FlowForge', {
    font: 'ANSI Shadow'
  });
} catch (error) {
  // Will automatically fallback to simple text
  console.log('Using fallback logo');
}
```

## Environment-Specific Troubleshooting

### Windows Terminal

```bash
# Check Windows Terminal capabilities
echo "TERM: $TERM"
echo "WT_SESSION: $WT_SESSION"  # Windows Terminal indicator

# Common Windows issues
export TERM=xterm-256color
export FORCE_COLOR=1
```

### VS Code Integrated Terminal

```bash
# VS Code detection
echo "VSCODE_INJECTION: $VSCODE_INJECTION"
echo "TERM_PROGRAM: $TERM_PROGRAM"

# VS Code usually supports colors
node -e "const {TerminalCapabilities} = require('./dist/ui-enhanced'); console.log('IDE detected:', TerminalCapabilities.isIDETerminal());"
```

### SSH/Remote Terminals

```bash
# Check SSH environment
echo "SSH_CLIENT: $SSH_CLIENT"
echo "SSH_TTY: $SSH_TTY"

# Often need to force settings
export TERM=xterm-256color
export LANG=en_US.UTF-8
```

### Docker Containers

```bash
# Docker typically has limited terminal
docker run -it --rm node:alpine sh -c "echo TERM: \$TERM"

# Set appropriate environment  
docker run -e TERM=xterm-256color -e NO_COLOR=0 ...
```

## Debug Mode

### Enable Debug Logging

```typescript
// Create logger with debug level
const logger = createLogger();
logger.level = 'debug';

// Enable verbose mode
const logo = await logoGenerator.generateASCIILogo('FlowForge', {
  verbose: true
});
```

### Environment Debug Variables

```bash
# Enable debug output
export DEBUG=flowforge:ui*
export NODE_ENV=development
export FLOWFORGE_DEBUG=1

# Run with debug info
node --trace-warnings your-script.js
```

## Performance Profiling

### Memory Profiling

```bash
# Profile memory usage
node --inspect your-script.js
# Then connect Chrome DevTools

# Or use built-in profiling
node -e "
const {LogoGenerator} = require('./dist/ui-enhanced');
const v8 = require('v8');

console.log('Heap before:', v8.getHeapStatistics().used_heap_size / 1024 / 1024, 'MB');

const lg = new LogoGenerator();
lg.generateASCIILogo('FlowForge').then(() => {
  console.log('Heap after:', v8.getHeapStatistics().used_heap_size / 1024 / 1024, 'MB');
});
"
```

### Performance Timing

```bash
# Detailed timing
node -e "
const {LogoGenerator} = require('./dist/ui-enhanced');
const {performance} = require('perf_hooks');

const lg = new LogoGenerator();

const start = performance.now();
lg.generateASCIILogo('FlowForge').then(() => {
  const end = performance.now();
  console.log('Generation time:', (end - start).toFixed(2), 'ms');
});
"
```

## Recovery Procedures

### Reset to Defaults

```bash
# Clear environment overrides
unset FORCE_COLOR NO_COLOR TERM COLUMNS LINES LANG LC_ALL

# Restore default terminal  
export TERM=xterm

# Test basic functionality
node -e "const {LogoGenerator} = require('./dist/ui-enhanced'); const lg = new LogoGenerator(); lg.generateASCIILogo('Test').then(console.log);"
```

### Fallback Mode

```typescript
// Force fallback mode
const logoGenerator = new LogoGenerator();

// Disable all enhancements
const simpleLogo = await logoGenerator.generateASCIILogo('FlowForge', {
  applyGradient: false,
  width: 60
});

// Or create manual fallback
function createFallback(text: string): string {
  const border = '═'.repeat(text.length + 4);
  return `╔${border}╗\n║  ${text}  ║\n╚${border}╝`;
}
```

### Emergency Disable

```bash
# Completely disable UI enhancements
export FLOWFORGE_UI_DISABLE=1
export NO_COLOR=1
export TERM=dumb

# Or modify package.json to remove figlet
npm uninstall figlet gradient-string
```

## Support Information

### Collect Debug Information

```bash
#!/bin/bash
# debug-info.sh - Collect environment information

echo "=== FlowForge UI Enhanced Debug Info ==="
echo "Date: $(date)"
echo "Platform: $(uname -a)"
echo

echo "=== Environment ==="
echo "TERM: $TERM"
echo "COLUMNS: $COLUMNS"
echo "LINES: $LINES" 
echo "LANG: $LANG"
echo "LC_ALL: $LC_ALL"
echo "FORCE_COLOR: $FORCE_COLOR"
echo "NO_COLOR: $NO_COLOR"
echo "CI: $CI"
echo

echo "=== Terminal Capabilities ==="
node -e "
try {
  const {TerminalCapabilities} = require('./dist/ui-enhanced');
  console.log(JSON.stringify(TerminalCapabilities.getCapabilities(), null, 2));
} catch(e) {
  console.error('Error:', e.message);
}
" 2>&1

echo
echo "=== Logo Generator Test ==="
node -e "
try {
  const {LogoGenerator} = require('./dist/ui-enhanced');
  const lg = new LogoGenerator();
  console.log('Figlet available:', lg.isFigletAvailable());
  lg.generateASCIILogo('Test').then(logo => {
    console.log('Logo length:', logo.length);
    console.log('First line:', logo.split('\\n')[0]);
  }).catch(console.error);
} catch(e) {
  console.error('Error:', e.message);
}
" 2>&1

echo
echo "=== Dependencies ==="
npm ls figlet gradient-string 2>&1 || echo "Dependencies check failed"
```

### Create Issue Template

When creating a support issue, include:

1. **Environment**: Platform, terminal, Node.js version
2. **Command**: Exact command that failed
3. **Expected**: What you expected to happen
4. **Actual**: What actually happened
5. **Debug Info**: Output from debug-info.sh script
6. **Screenshots**: If visual issues

### Contact Information

- **GitHub Issues**: [FlowForge Issues](https://github.com/JustCode-CruzAlex/FlowForge/issues)
- **Label**: Use `ui-enhanced` label for UI-related issues
- **Priority**: Use `bug` for broken functionality, `enhancement` for improvements

---

**This troubleshooting guide covers 95% of common UI Enhanced issues. For unusual problems, collect debug information and create a detailed GitHub issue.**