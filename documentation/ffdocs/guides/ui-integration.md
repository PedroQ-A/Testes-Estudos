# FlowForge UI Enhanced Integration Guide

## Overview

This guide explains how to integrate and customize the FlowForge v2.0 UI Enhanced components in your applications and commands. The UI Enhanced module provides professional terminal interfaces with responsive design and graceful degradation.

## Quick Start

### Installation

The UI Enhanced module is included with FlowForge v2.0+:

```bash
npm install @justcode-cruzalex/flowforge@latest
```

### Basic Usage

```typescript
import { LogoGenerator, TerminalCapabilities } from '@justcode-cruzalex/flowforge/ui-enhanced';

// Detect terminal capabilities
const capabilities = TerminalCapabilities.getCapabilities();

// Create logo generator
const logoGenerator = new LogoGenerator({
  maxWidth: capabilities.width
});

// Generate responsive logo
const logo = await logoGenerator.generateASCIILogo('MyApp', {
  applyGradient: capabilities.color
});

console.log(logo);
```

## Integration Patterns

### 1. Command-Line Tools

#### FlowForge Command Integration

```typescript
// commands/mycommand.ts
import { LogoGenerator, TerminalCapabilities } from '../ui-enhanced';
import { createLogger } from '../utils/logger';

const logger = createLogger();

export class MyCommand {
  private logoGenerator: LogoGenerator;
  
  constructor() {
    this.logoGenerator = new LogoGenerator({
      colors: ['#6f42c1', '#3498db'], // FlowForge brand colors
      font: 'ANSI Shadow'
    });
  }
  
  async execute() {
    // Show branded header
    await this.showHeader();
    
    // Command logic here
    logger.info('Command executed successfully');
  }
  
  private async showHeader() {
    const capabilities = TerminalCapabilities.getCapabilities();
    
    if (capabilities.width >= 60) {
      const logo = await this.logoGenerator.generateASCIILogo('FlowForge');
      logger.info('\n' + logo + '\n');
    } else {
      logger.info('FlowForge v2.0\n');
    }
  }
}
```

#### Installation Wizard Integration

```typescript
// wizards/installation-wizard.ts
import { LogoGenerator, TerminalCapabilities } from '../ui-enhanced';
import inquirer from 'inquirer';

export class InstallationWizard {
  private logoGenerator: LogoGenerator;
  private capabilities: any;
  
  constructor() {
    this.capabilities = TerminalCapabilities.getCapabilities();
    this.logoGenerator = new LogoGenerator({
      maxWidth: this.capabilities.width
    });
  }
  
  async run() {
    await this.showWelcome();
    await this.collectInput();
    await this.showCompletion();
  }
  
  private async showWelcome() {
    console.clear();
    
    // Responsive welcome screen
    if (this.capabilities.width >= 80 && this.capabilities.color) {
      const logo = await this.logoGenerator.generateASCIILogo('FlowForge');
      console.log(logo);
      console.log('\n🚀 Welcome to FlowForge Installation Wizard\n');
    } else {
      console.log('FlowForge Installation Wizard');
      console.log('===========================\n');
    }
  }
  
  private async collectInput() {
    const questions = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: 'my-flowforge-project'
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose template:',
        choices: ['minimal', 'standard', 'full-featured']
      }
    ];
    
    return await inquirer.prompt(questions);
  }
  
  private async showCompletion() {
    if (this.capabilities.unicode && this.capabilities.color) {
      console.log('\n✅ Installation completed successfully!');
      console.log('🎉 Your project is ready to use.');
    } else {
      console.log('\n[OK] Installation completed successfully!');
      console.log('Your project is ready to use.');
    }
  }
}
```

### 2. Progress Indicators

#### Enhanced Progress Bars

```typescript
import { TerminalCapabilities } from '../ui-enhanced';

class EnhancedProgressBar {
  private capabilities: any;
  private width: number;
  
  constructor(width?: number) {
    this.capabilities = TerminalCapabilities.getCapabilities();
    this.width = width || Math.min(this.capabilities.width - 20, 50);
  }
  
  render(percentage: number, description?: string): string {
    const filled = Math.floor((percentage / 100) * this.width);
    const empty = this.width - filled;
    
    let fillChar = '#';
    let emptyChar = '-';
    
    if (this.capabilities.unicode) {
      fillChar = '█';
      emptyChar = '░';
    }
    
    const bar = fillChar.repeat(filled) + emptyChar.repeat(empty);
    const percent = `${percentage.toFixed(1)}%`.padStart(6);
    
    let result = `[${bar}] ${percent}`;
    
    if (description && this.capabilities.width > 80) {
      result += ` ${description}`;
    }
    
    // Add colors if supported
    if (this.capabilities.color && percentage === 100) {
      result = `\x1b[32m${result}\x1b[0m`; // Green for completion
    } else if (this.capabilities.color && percentage > 0) {
      result = `\x1b[36m${result}\x1b[0m`; // Cyan for progress
    }
    
    return result;
  }
}

// Usage
const progressBar = new EnhancedProgressBar();
console.log(progressBar.render(75, 'Installing dependencies...'));
```

#### Multi-Step Progress

```typescript
interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

class MultiStepProgress {
  private capabilities: any;
  private steps: ProgressStep[];
  
  constructor(steps: ProgressStep[]) {
    this.capabilities = TerminalCapabilities.getCapabilities();
    this.steps = steps;
  }
  
  render(): string {
    const lines: string[] = [];
    
    this.steps.forEach((step, index) => {
      let prefix = `${index + 1}.`;
      let status = '';
      
      if (this.capabilities.unicode) {
        prefix = step.completed ? '✅' : '⏳';
      } else {
        status = step.completed ? '[DONE]' : '[PENDING]';
      }
      
      let line = `${prefix} ${step.title}`;
      if (status) {
        line += ` ${status}`;
      }
      
      if (step.description && this.capabilities.width > 60) {
        line += `\n   ${step.description}`;
      }
      
      lines.push(line);
    });
    
    return lines.join('\n');
  }
  
  updateStep(id: string, completed: boolean, description?: string): void {
    const step = this.steps.find(s => s.id === id);
    if (step) {
      step.completed = completed;
      if (description) {
        step.description = description;
      }
    }
  }
}
```

### 3. Adaptive Layouts

#### Responsive Command Output

```typescript
class ResponsiveOutput {
  private capabilities: any;
  
  constructor() {
    this.capabilities = TerminalCapabilities.getCapabilities();
  }
  
  renderTable(data: any[], headers: string[]): string {
    const width = this.capabilities.width;
    
    if (width < 60) {
      // Compact vertical layout
      return this.renderVerticalTable(data, headers);
    } else if (width < 120) {
      // Standard horizontal table
      return this.renderHorizontalTable(data, headers);
    } else {
      // Extended table with more details
      return this.renderExtendedTable(data, headers);
    }
  }
  
  private renderVerticalTable(data: any[], headers: string[]): string {
    const lines: string[] = [];
    
    data.forEach((item, index) => {
      if (index > 0) lines.push('---');
      
      headers.forEach(header => {
        lines.push(`${header}: ${item[header] || 'N/A'}`);
      });
    });
    
    return lines.join('\n');
  }
  
  private renderHorizontalTable(data: any[], headers: string[]): string {
    // Standard table implementation
    const colWidth = Math.floor((this.capabilities.width - 5) / headers.length);
    
    const lines: string[] = [];
    
    // Header
    const headerLine = headers
      .map(h => h.padEnd(colWidth).substring(0, colWidth))
      .join(' | ');
    lines.push(headerLine);
    lines.push('-'.repeat(headerLine.length));
    
    // Data rows
    data.forEach(item => {
      const row = headers
        .map(h => String(item[h] || '').padEnd(colWidth).substring(0, colWidth))
        .join(' | ');
      lines.push(row);
    });
    
    return lines.join('\n');
  }
  
  private renderExtendedTable(data: any[], headers: string[]): string {
    // Extended table with more space and details
    return this.renderHorizontalTable(data, headers); // Enhanced version
  }
}
```

## Configuration Options

### Logo Customization

```typescript
// Brand colors
const logoGenerator = new LogoGenerator({
  colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'], // Custom gradient
  font: 'Big',                               // Large font
  maxWidth: 120                             // Wide layout
});

// Corporate theme
const corporateLogoGenerator = new LogoGenerator({
  colors: ['#2c3e50', '#3498db'], // Professional blue
  font: 'ANSI Shadow',            // Clean corporate font
  maxWidth: 80                    // Standard width
});

// Compact theme for narrow terminals
const compactLogoGenerator = new LogoGenerator({
  colors: ['#95a5a6'],  // Single color
  font: 'small',        // Small font
  maxWidth: 60          // Narrow width
});
```

### Environment-Based Configuration

```typescript
class UIConfig {
  static getConfiguration() {
    const capabilities = TerminalCapabilities.getCapabilities();
    const isCI = process.env.CI || process.env.CONTINUOUS_INTEGRATION;
    
    return {
      // Disable colors in CI unless forced
      useColors: capabilities.color && !isCI,
      
      // Disable animations in CI
      useAnimations: capabilities.isTTY && !isCI,
      
      // Use compact layout for narrow terminals
      layout: capabilities.width < 60 ? 'compact' : 
              capabilities.width > 120 ? 'extended' : 'standard',
      
      // Enable Unicode if supported and not in CI
      useUnicode: capabilities.unicode && !isCI,
      
      // Logo complexity based on context
      logoStyle: capabilities.color && capabilities.width > 80 && !isCI ? 
                'enhanced' : 'simple'
    };
  }
}

// Usage
const config = UIConfig.getConfiguration();
const logoGenerator = new LogoGenerator({
  colors: config.useColors ? ['#6f42c1', '#3498db'] : undefined,
  maxWidth: config.layout === 'compact' ? 60 : 
           config.layout === 'extended' ? 120 : 80
});
```

### Performance Configuration

```typescript
class PerformanceConfig {
  static getOptimizedOptions() {
    const capabilities = TerminalCapabilities.getCapabilities();
    
    return {
      // Disable gradients on slower terminals
      enableGradients: capabilities.color && capabilities.width <= 100,
      
      // Reduce complexity for very wide terminals
      maxComplexity: capabilities.width > 150 ? 'medium' : 'high',
      
      // Cache logos for repeated use
      enableCaching: true,
      
      // Verbose logging only in development
      verbose: process.env.NODE_ENV === 'development'
    };
  }
}
```

## Testing Integration

### Mocking for Tests

```typescript
// test/ui-enhanced.test.ts
import { LogoGenerator, TerminalCapabilities } from '../src/ui-enhanced';

describe('UI Integration', () => {
  beforeEach(() => {
    // Mock terminal capabilities
    jest.spyOn(TerminalCapabilities, 'getCapabilities').mockReturnValue({
      width: 80,
      height: 24,
      color: true,
      unicode: true,
      isTTY: true
    });
    
    // Mock process.stdout
    Object.defineProperty(process.stdout, 'columns', {
      value: 80,
      writable: true
    });
  });
  
  it('should adapt to terminal capabilities', async () => {
    const logoGenerator = new LogoGenerator();
    const capabilities = TerminalCapabilities.getCapabilities();
    
    const logo = await logoGenerator.generateASCIILogo('Test', {
      applyGradient: capabilities.color
    });
    
    expect(logo).toBeDefined();
    expect(typeof logo).toBe('string');
  });
});
```

### Testing Different Terminal Scenarios

```typescript
describe('Terminal Scenarios', () => {
  const scenarios = [
    {
      name: 'narrow terminal',
      width: 40,
      height: 20,
      color: false,
      unicode: false,
      isTTY: true
    },
    {
      name: 'standard terminal',
      width: 80,
      height: 24,
      color: true,
      unicode: true,
      isTTY: true
    },
    {
      name: 'wide terminal',
      width: 140,
      height: 40,
      color: true,
      unicode: true,
      isTTY: true
    },
    {
      name: 'CI environment',
      width: 80,
      height: 24,
      color: false,
      unicode: false,
      isTTY: false
    }
  ];
  
  scenarios.forEach(scenario => {
    it(`should work in ${scenario.name}`, async () => {
      jest.spyOn(TerminalCapabilities, 'getCapabilities').mockReturnValue(scenario);
      
      const logoGenerator = new LogoGenerator({
        maxWidth: scenario.width
      });
      
      const logo = await logoGenerator.generateASCIILogo('FlowForge');
      
      // Should always return a string
      expect(typeof logo).toBe('string');
      expect(logo.length).toBeGreaterThan(0);
      
      // Should respect width constraints
      const lines = logo.split('\n');
      lines.forEach(line => {
        // Allow for ANSI escape codes
        const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '');
        expect(cleanLine.length).toBeLessThanOrEqual(scenario.width);
      });
    });
  });
});
```

## Best Practices

### 1. Always Check Capabilities

```typescript
// Good: Check before using features
const capabilities = TerminalCapabilities.getCapabilities();
if (capabilities.color) {
  console.log('\x1b[32mSuccess!\x1b[0m');
} else {
  console.log('Success!');
}

// Bad: Assume color support
console.log('\x1b[32mSuccess!\x1b[0m'); // May not display correctly
```

### 2. Provide Fallbacks

```typescript
// Good: Multiple fallback levels
const capabilities = TerminalCapabilities.getCapabilities();

let statusChar: string;
if (capabilities.unicode) {
  statusChar = '✅'; // Unicode check mark
} else if (capabilities.color) {
  statusChar = '\x1b[32m[OK]\x1b[0m'; // Colored text
} else {
  statusChar = '[OK]'; // Plain text
}

// Bad: No fallback for unsupported terminals
const statusChar = '✅'; // Won't display on basic terminals
```

### 3. Respect Performance Budgets

```typescript
// Good: Monitor performance
const start = Date.now();
const logo = await logoGenerator.generateASCIILogo('FlowForge');
const duration = Date.now() - start;

if (duration > 200) {
  logger.warn(`Logo generation took ${duration}ms (budget: 200ms)`);
}

// Bad: No performance monitoring
const logo = await logoGenerator.generateASCIILogo('FlowForge');
```

### 4. Use Logger Framework

```typescript
import { createLogger } from '../utils/logger';

const logger = createLogger();

// Good: Use logger (Rule #8 compliant)
logger.info('Logo generated successfully');

// Bad: Direct console usage (violates Rule #8)
console.log('Logo generated successfully');
```

## Troubleshooting

### Common Issues

#### Logo Not Displaying

```typescript
// Check if figlet is available
const logoGenerator = new LogoGenerator();
if (!logoGenerator.isFigletAvailable()) {
  console.log('Figlet not available, using fallback');
  // Will automatically use fallback logo
}
```

#### Colors Not Working

```typescript
// Debug color support
const capabilities = TerminalCapabilities.getCapabilities();
console.log('Color support:', capabilities.color);
console.log('Terminal:', process.env.TERM);
console.log('Force color:', process.env.FORCE_COLOR);
console.log('No color:', process.env.NO_COLOR);
```

#### Performance Issues

```typescript
// Enable verbose logging to debug performance
const logoGenerator = new LogoGenerator();
const logo = await logoGenerator.generateASCIILogo('FlowForge', {
  verbose: true // Will log timing information
});
```

#### Layout Issues

```typescript
// Debug terminal dimensions
const capabilities = TerminalCapabilities.getCapabilities();
console.log(`Terminal size: ${capabilities.width}x${capabilities.height}`);

// Force specific width for testing
const logo = await logoGenerator.generateASCIILogo('FlowForge', {
  width: 60 // Override terminal width
});
```

### Environment Variables

Control UI behavior with environment variables:

```bash
# Force color output
export FORCE_COLOR=1

# Disable color output  
export NO_COLOR=1

# Override terminal type
export TERM=xterm-256color

# Override dimensions
export COLUMNS=80
export LINES=24
```

### Testing Commands

Test UI components manually:

```bash
# Test narrow terminal
COLUMNS=40 node -e "const {LogoGenerator} = require('./dist/ui-enhanced'); const lg = new LogoGenerator(); lg.generateASCIILogo('Test').then(console.log);"

# Test no color
NO_COLOR=1 node -e "const {LogoGenerator} = require('./dist/ui-enhanced'); const lg = new LogoGenerator(); lg.generateASCIILogo('Test').then(console.log);"

# Test capabilities
node -e "const {TerminalCapabilities} = require('./dist/ui-enhanced'); console.log(TerminalCapabilities.getCapabilities());"
```

## Migration Guide

### From v1.x UI Components

```typescript
// Old v1.x approach
console.log('FlowForge');
console.log('=========');

// New v2.0 approach
import { LogoGenerator } from '@justcode-cruzalex/flowforge/ui-enhanced';

const logoGenerator = new LogoGenerator();
const logo = await logoGenerator.generateASCIILogo('FlowForge');
console.log(logo);
```

### Updating Existing Commands

```typescript
// Before: Manual terminal detection
const width = process.stdout.columns || 80;
const hasColor = process.env.TERM && process.env.TERM !== 'dumb';

// After: Use TerminalCapabilities
const capabilities = TerminalCapabilities.getCapabilities();
const { width, color } = capabilities;
```

---

**Next Steps:**
1. Review API documentation for detailed method reference
2. See demo documentation for usage examples  
3. Check troubleshooting section for common issues
4. Integrate with your FlowForge commands and workflows

**Support:** For integration questions, create an issue in the FlowForge repository with the `ui-enhanced` label.