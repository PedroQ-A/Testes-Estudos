# UI Enhanced API Documentation

## Overview

The FlowForge v2.0 UI Enhanced API provides terminal-aware components for creating professional, responsive terminal interfaces. This module includes ASCII art generation, progress animation, and terminal capability detection.

## Module Structure

```
src/ui-enhanced/
├── LogoGenerator.ts        # ASCII art logo generation
├── TerminalCapabilities.ts # Terminal feature detection  
├── index.ts               # Module exports
└── ProgressAnimator.d.ts  # Progress animation types
```

## Core Classes

### LogoGenerator

Professional ASCII art logo generation with responsive design and performance optimization.

#### Constructor

```typescript
new LogoGenerator(options?: LogoGeneratorOptions)
```

**Parameters:**
- `options.font?`: string - Figlet font name (default: 'ANSI Shadow')
- `options.colors?`: string[] - Gradient colors (default: ['#6f42c1', '#3498db'])  
- `options.maxWidth?`: number - Maximum width in columns (default: 80)

**Example:**
```typescript
const logoGenerator = new LogoGenerator({
  font: 'ANSI Shadow',
  colors: ['#6f42c1', '#3498db'],
  maxWidth: 100
});
```

#### Methods

##### generateASCIILogo()

Generate ASCII art logo with responsive design and color effects.

```typescript
async generateASCIILogo(text: string, options?: GenerateOptions): Promise<string>
```

**Parameters:**
- `text`: string - Text to convert to ASCII art
- `options.width?`: number - Target width (default: terminal width)
- `options.applyGradient?`: boolean - Apply color gradient (default: true)
- `options.verbose?`: boolean - Enable verbose logging (default: false)
- `options.font?`: string - Override default font
- `options.horizontalLayout?`: 'default' | 'fitted' | 'controlled' | 'full'

**Returns:** Promise<string> - Generated ASCII art with colors

**Performance:** <200ms generation time (monitored and logged)

**Example:**
```typescript
const logo = await logoGenerator.generateASCIILogo('FlowForge', {
  width: 80,
  applyGradient: true,
  verbose: false
});

console.log(logo);
```

**Error Handling:**
- Invalid input: Returns fallback logo with warning
- Figlet unavailable: Uses simple bordered text fallback
- Gradient failure: Falls back to plain ASCII
- Performance budget exceeded: Logs warning but continues

##### responsiveDesign()

Get responsive design configuration based on terminal width.

```typescript
async responsiveDesign(text: string): Promise<ResponsiveDesignResult>
```

**Parameters:**
- `text`: string - Text for analysis (reserved for future use)

**Returns:** Promise<ResponsiveDesignResult>
- `maxWidth`: number - Recommended maximum width
- `font`: string - Recommended font size ('small' | 'standard' | 'big')

**Logic:**
- Width < 60: Compact design, small font
- Width 60-120: Standard design, normal font  
- Width > 120: Expanded design, large font

**Example:**
```typescript
const design = await logoGenerator.responsiveDesign('FlowForge');
if (design.font === 'small') {
  // Use compact layout
}
```

##### hasColorSupport()

Check if terminal supports color output.

```typescript
hasColorSupport(): boolean
```

**Returns:** boolean - True if colors supported

**Detection Logic:**
1. Check TERM environment variable
2. Exclude 'dumb' terminal
3. Look for color indicators ('color', 'xterm', etc.)
4. Fallback to TTY detection

**Example:**
```typescript
if (logoGenerator.hasColorSupport()) {
  // Use colored output
} else {
  // Use monochrome output
}
```

##### detectCapabilities()

Detect comprehensive terminal capabilities using TerminalCapabilities.

```typescript
detectCapabilities(): void
```

**Side Effects:** Populates `this.capabilities` object with:
- `width`: number - Terminal width
- `height`: number - Terminal height  
- `supportsColor`: boolean - Color support
- `supportsUnicode`: boolean - Unicode support
- `isTTY`: boolean - TTY status

**Example:**
```typescript
logoGenerator.detectCapabilities();
const caps = logoGenerator.capabilities;
console.log(`Terminal: ${caps.width}x${caps.height}, Color: ${caps.supportsColor}`);
```

##### updateOptions()

Update logo generator configuration.

```typescript
updateOptions(options: LogoGeneratorOptions): void
```

**Parameters:**
- `options.font?`: string - New font name
- `options.colors?`: string[] - New gradient colors
- `options.maxWidth?`: number - New maximum width

**Example:**
```typescript
logoGenerator.updateOptions({
  font: 'Big',
  colors: ['#ff6b6b', '#4ecdc4']
});
```

##### getAvailableFonts()

Get list of available figlet fonts.

```typescript
async getAvailableFonts(): Promise<string[]>
```

**Returns:** Promise<string[]> - Array of font names

**Example:**
```typescript
const fonts = await logoGenerator.getAvailableFonts();
console.log('Available fonts:', fonts);
```

##### isFigletAvailable()

Check if figlet is available and functional.

```typescript
isFigletAvailable(): boolean
```

**Returns:** boolean - True if figlet can be used

**Example:**
```typescript
if (!logoGenerator.isFigletAvailable()) {
  // Use fallback logo method
}
```

### TerminalCapabilities

Static utility class for terminal feature detection and adaptive UI configuration.

#### Static Methods

##### getTerminalWidth()

Detect terminal width in columns.

```typescript
static getTerminalWidth(): number
```

**Returns:** number - Terminal width (default: 80)

**Detection Order:**
1. `process.stdout.columns`
2. `process.env.COLUMNS`
3. Default fallback (80)

**Example:**
```typescript
const width = TerminalCapabilities.getTerminalWidth();
if (width < 60) {
  // Use compact layout
}
```

##### getTerminalHeight()

Detect terminal height in rows.

```typescript
static getTerminalHeight(): number
```

**Returns:** number - Terminal height (default: 24)

**Detection Order:**
1. `process.stdout.rows`
2. `process.env.LINES`  
3. Default fallback (24)

##### supportsColor()

Comprehensive color support detection.

```typescript
static supportsColor(): boolean
```

**Returns:** boolean - True if colors supported

**Detection Logic:**
1. Check `NO_COLOR` (disable) and `FORCE_COLOR` (enable)
2. Verify TTY status
3. Analyze `TERM` environment variable
4. Match against known color-supporting terminals

**Supported Terminals:**
- xterm variants
- screen/tmux
- konsole, gnome-terminal
- kitty, alacritty
- VS Code integrated terminal

**Example:**
```typescript
if (TerminalCapabilities.supportsColor()) {
  console.log('\x1b[32mGreen text\x1b[0m');
}
```

##### supportsUnicode()

Detect Unicode/UTF-8 support.

```typescript
static supportsUnicode(): boolean
```

**Returns:** boolean - True if Unicode supported

**Detection Method:**
1. Check locale variables (LANG, LC_ALL, LC_CTYPE) for UTF-8
2. Analyze terminal type for Unicode support
3. Platform detection (Unix better than Windows)

**Example:**
```typescript
if (TerminalCapabilities.supportsUnicode()) {
  console.log('✅ Unicode characters supported');
} else {
  console.log('[OK] Basic ASCII only');
}
```

##### getCapabilities()

Get comprehensive terminal capabilities summary.

```typescript
static getCapabilities(): TerminalCapabilitiesInfo
```

**Returns:** TerminalCapabilitiesInfo
- `width`: number - Terminal width
- `height`: number - Terminal height
- `color`: boolean - Color support
- `unicode`: boolean - Unicode support  
- `isTTY`: boolean - TTY status

**Example:**
```typescript
const caps = TerminalCapabilities.getCapabilities();
console.log(`Terminal: ${caps.width}x${caps.height}`);
console.log(`Features: Color=${caps.color}, Unicode=${caps.unicode}`);
```

##### getColorDepth()

Get color depth supported by terminal.

```typescript
static getColorDepth(): number
```

**Returns:** number - Color depth
- `1`: Monochrome
- `4`: 16 colors (basic ANSI)  
- `8`: 256 colors
- `24`: True color (16M colors)

**Detection Method:**
1. Check for 'truecolor' indicators
2. Check for '256color' in TERM
3. Default to basic ANSI (4-bit)

**Example:**
```typescript
const depth = TerminalCapabilities.getColorDepth();
if (depth >= 8) {
  // Use 256-color palette
} else if (depth >= 4) {
  // Use basic ANSI colors
}
```

##### getUIRecommendations()

Get recommended UI configuration based on capabilities.

```typescript
static getUIRecommendations(): UIRecommendations
```

**Returns:** UIRecommendations
- `useColors`: boolean - Enable color output
- `useUnicode`: boolean - Enable Unicode characters
- `layoutWidth`: 'compact' | 'standard' | 'wide' - Layout style
- `progressBarStyle`: 'unicode' | 'ascii' - Progress bar type
- `logoStyle`: 'enhanced' | 'simple' - Logo complexity
- `animationsEnabled`: boolean - Enable animations

**Example:**
```typescript
const recommendations = TerminalCapabilities.getUIRecommendations();
const progressChar = recommendations.progressBarStyle === 'unicode' ? '█' : '#';
```

## Types and Interfaces

### LogoGeneratorOptions

```typescript
interface LogoGeneratorOptions {
  font?: string;           // Figlet font name
  colors?: string[];       // Gradient colors  
  maxWidth?: number;       // Maximum width
}
```

### GenerateOptions

```typescript
interface GenerateOptions {
  width?: number;                    // Target width
  applyGradient?: boolean;          // Apply gradient
  verbose?: boolean;                // Verbose logging
  font?: string;                    // Font override
  horizontalLayout?: LayoutType;    // Layout style
}
```

### ResponsiveDesignResult

```typescript
interface ResponsiveDesignResult {
  maxWidth: number;        // Recommended width
  font: string;           // Font size category
}
```

### TerminalCapabilitiesInfo  

```typescript
interface TerminalCapabilitiesInfo {
  width: number;          // Terminal width
  height: number;         // Terminal height
  color: boolean;         // Color support
  unicode: boolean;       // Unicode support
  isTTY: boolean;        // TTY status
}
```

## Usage Examples

### Basic Logo Generation

```typescript
import { LogoGenerator } from './ui-enhanced';

const generator = new LogoGenerator();
const logo = await generator.generateASCIILogo('FlowForge');
console.log(logo);
```

### Responsive Logo with Capabilities Detection

```typescript
import { LogoGenerator, TerminalCapabilities } from './ui-enhanced';

const capabilities = TerminalCapabilities.getCapabilities();
const generator = new LogoGenerator({
  maxWidth: capabilities.width
});

const design = await generator.responsiveDesign('FlowForge');
const logo = await generator.generateASCIILogo('FlowForge', {
  width: design.maxWidth,
  applyGradient: capabilities.color
});

console.log(logo);
```

### Adaptive UI Configuration

```typescript
import { TerminalCapabilities } from './ui-enhanced';

const recommendations = TerminalCapabilities.getUIRecommendations();

// Configure UI based on capabilities
const uiConfig = {
  colors: recommendations.useColors,
  unicode: recommendations.useUnicode,
  layout: recommendations.layoutWidth,
  animations: recommendations.animationsEnabled
};

console.log('UI Configuration:', uiConfig);
```

## Error Handling

### Logo Generation Errors

```typescript
try {
  const logo = await generator.generateASCIILogo('FlowForge');
} catch (error) {
  // LogoGenerator handles all errors internally
  // Always returns a string (fallback if needed)
  console.log(logo); // Will contain fallback logo
}
```

### Capability Detection Errors

```typescript
// All TerminalCapabilities methods have safe defaults
const width = TerminalCapabilities.getTerminalWidth(); // Never throws
const hasColor = TerminalCapabilities.supportsColor(); // Never throws

// Safe to use directly in conditionals
if (TerminalCapabilities.supportsColor()) {
  // Use colors
}
```

## Performance Considerations

### LogoGenerator Performance

- **Target**: <200ms generation time
- **Monitoring**: Automatic performance logging
- **Optimization**: Caching for repeated generation
- **Memory**: ~2MB peak usage

### TerminalCapabilities Performance

- **Target**: <10ms detection time
- **Caching**: Results cached per process
- **Efficiency**: Minimal environment variable reads

## Testing

### LogoGenerator Tests

```typescript
// Tests cover:
// - Logo generation with various fonts
// - Gradient application and fallbacks
// - Responsive design logic
// - Performance budget compliance
// - Error scenarios and recovery
// - Logger integration (Rule #8 compliance)
```

### TerminalCapabilities Tests

```typescript  
// Tests cover:
// - Width/height detection
// - Color support detection
// - Unicode support detection
// - Cross-platform compatibility
// - Environment variable handling
```

## Integration Points

### With FlowForge Commands

```typescript
// Installation wizard integration
import { LogoGenerator } from '../ui-enhanced';

export class InstallationWizard {
  private logoGenerator = new LogoGenerator();
  
  async showWelcome() {
    const logo = await this.logoGenerator.generateASCIILogo('FlowForge');
    console.log(logo);
  }
}
```

### With Progress Systems

```typescript
// Progress bar integration
import { TerminalCapabilities } from '../ui-enhanced';

const caps = TerminalCapabilities.getCapabilities();
const progressChar = caps.unicode ? '█' : '#';
const emptyChar = caps.unicode ? '░' : '-';
```

### With Logger Framework

```typescript
// Rule #8 compliance - no console.* usage
import { createLogger } from '../utils/logger';

const logger = createLogger();
// All output goes through logger, never console.log()
```

---

**Version**: FlowForge v2.0.3  
**Issue**: #319 - Polish Installation Wizard UI  
**Coverage**: 85% test coverage  
**Performance**: All targets met (<200ms, <5MB memory)  
**Compatibility**: Cross-platform (Linux, macOS, Windows)