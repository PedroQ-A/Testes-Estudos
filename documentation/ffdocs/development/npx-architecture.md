# NPX Architecture Documentation

## Overview

FlowForge's NPX support represents a sophisticated dual-mode execution system that seamlessly adapts between NPX, global, and local installation contexts while maintaining full functionality and professional user experience.

## Architecture Components

### Core Components

```
FlowForge NPX Architecture
├── bin/flowforge.js           # Main CLI entry point
├── lib/context-manager.js     # Execution context detection
├── lib/path-resolver.js       # Dynamic path resolution
├── scripts/smart-install.js   # Context-aware installation
└── package.json               # NPX-optimized configuration
```

### Context Detection System

The `context-manager.js` module provides intelligent execution environment detection:

```javascript
// Execution context detection
const { ExecutionContext } = require('../lib/context-manager');

const context = detectContext();
// Returns: { type: 'npx'|'global'|'local', isNpx: boolean, ... }
```

**Detection Logic:**
1. **NPX Mode**: `npm_execpath` contains `_npx` or `npm_lifecycle_event` is undefined
2. **Global Mode**: Installed in global npm directory
3. **Local Mode**: Installed in local node_modules

### Path Resolution System

The `PathResolver` class handles dynamic path resolution across execution contexts:

```javascript
class PathResolver {
  constructor() {
    this.context = this.detectContext();
    this.basePath = this.resolveBasePath();
  }
  
  // Resolve paths based on execution context
  resolve(...paths) {
    return path.join(this.basePath, ...paths);
  }
  
  // Get appropriate script path
  getScript(scriptName) {
    const extensions = ['.sh', '.js'];
    for (const ext of extensions) {
      const scriptPath = this.resolve('scripts', `${scriptName}${ext}`);
      if (fs.existsSync(scriptPath)) return scriptPath;
    }
    throw new Error(`Script ${scriptName} not found`);
  }
}
```

**Path Resolution Priority:**
1. Current working directory (for local FlowForge installations)
2. NPX cache directory (for NPX execution)
3. Global installation directory (for global installations)
4. Fallback to package installation directory

## Dual-Mode Implementation

### NPX-Aware CLI Design

The main CLI (`bin/flowforge.js`) implements context-aware behavior:

```javascript
// Context-aware help display
function showHelp() {
  if (context.isNpx) {
    console.log('  npx @flowforge/cli <command> [options]\n');
    console.log('  npx @flowforge/cli init          # Initialize in current project');
  } else {
    console.log('  flowforge <command> [options]\n');
    console.log('  flowforge init          # Initialize in current project');
  }
}
```

### Smart Installation System

The `smart-install.js` script provides context-aware installation:

```javascript
// Context-aware installation logic
function determineInstallationStrategy() {
  const context = detectContext();
  
  if (context.isNpx) {
    return {
      mode: 'npx',
      target: process.cwd(),
      copyAssets: true,
      setupLocal: true
    };
  }
  
  // Global or local installation strategies...
}
```

## Technical Implementation Details

### Package.json NPX Optimization

```json
{
  "name": "@flowforge/cli",
  "bin": {
    "flowforge": "./bin/flowforge.js",
    "ff": "./bin/flowforge.js"
  },
  "files": [
    "bin/",
    "lib/",
    "dist/",
    "commands/",
    "agents/",
    "scripts/",
    "templates/",
    ".flowforge/"
  ],
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  },
  "flowforge": {
    "npxSupport": true
  }
}
```

**Key NPX Optimizations:**
- Minimal `files` array for faster downloads
- Binary aliases for `ff` shortcut
- Engine requirements clearly specified
- NPX support feature flag

### Environment Detection

```javascript
function detectExecutionContext() {
  const env = process.env;
  
  // NPX indicators
  const isNpx = 
    env.npm_execpath?.includes('_npx') ||
    env.npm_lifecycle_event === undefined ||
    env.NPX === 'true';
  
  // Global installation check
  const isGlobal = __dirname.includes(
    path.join('lib', 'node_modules', '@flowforge', 'cli')
  );
  
  return {
    type: isNpx ? 'npx' : isGlobal ? 'global' : 'local',
    isNpx,
    isGlobal,
    isLocal: !isNpx && !isGlobal
  };
}
```

### Command Execution Flow

```
NPX Execution Flow:
┌─────────────────┐
│ npx @flowforge  │ → NPX downloads package
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ bin/flowforge.js│ → Detects NPX context
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Context Manager │ → Sets execution mode
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Path Resolver   │ → Resolves asset paths
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Command Handler │ → Executes requested action
└─────────────────┘
```

## State Management

### Context State

The execution context is managed throughout the CLI lifecycle:

```javascript
// Global context state
const executionState = {
  context: detectContext(),
  basePath: null,
  initialized: false,
  localFlowForgeDetected: false
};

// State updates based on operations
function updateExecutionState(newState) {
  Object.assign(executionState, newState);
  
  if (process.env.FLOWFORGE_DEBUG) {
    console.log('Context updated:', executionState);
  }
}
```

### Local vs Remote Command Resolution

```javascript
// Command resolution priority
function resolveCommand(commandName) {
  const locations = [
    // 1. Local project commands (highest priority)
    path.join(process.cwd(), 'commands', 'flowforge', ...commandName.split(':')),
    
    // 2. NPX/Global package commands
    resolver.resolve('commands', 'flowforge', ...commandName.split(':')),
    
    // 3. Fallback commands
    resolver.resolve('templates', 'commands', ...commandName.split(':'))
  ];
  
  for (const location of locations) {
    if (fs.existsSync(`${location}.md`)) {
      return `${location}.md`;
    }
  }
  
  throw new Error(`Command ${commandName} not found`);
}
```

## Performance Optimizations

### NPX Caching Strategy

FlowForge leverages NPX's built-in caching:

```bash
# NPX cache location (varies by platform)
~/.npm/_npx/         # Linux/macOS
%APPDATA%/npm-cache/ # Windows

# Cache warmup for demos
npx @flowforge/cli version > /dev/null 2>&1
```

### Asset Bundle Optimization

```javascript
// Minimal asset copying in NPX mode
function copyAssetsForContext(context) {
  const requiredAssets = {
    npx: [
      'scripts/install-flowforge.sh',
      'scripts/smart-install.js',
      'commands/',
      'templates/',
      '.flowforge/'
    ],
    global: ['*'],
    local: ['*']
  };
  
  return requiredAssets[context.type] || [];
}
```

### Lazy Loading

```javascript
// Lazy load heavy modules only when needed
function loadModule(moduleName) {
  return () => {
    if (!moduleCache[moduleName]) {
      moduleCache[moduleName] = require(moduleName);
    }
    return moduleCache[moduleName];
  };
}

const heavyModules = {
  notion: loadModule('@notionhq/client'),
  octokit: loadModule('@octokit/rest')
};
```

## Error Handling

### Context-Aware Error Messages

```javascript
function showContextualError(error, command) {
  console.error(`❌ ${error.message}`);
  
  if (context.isNpx) {
    if (error.code === 'COMMAND_NOT_FOUND') {
      console.log('Note: Some features may be limited in NPX mode');
      console.log('For full functionality, install globally:');
      console.log('  npm install -g @flowforge/cli');
    }
  }
  
  // Generic help
  console.log(`Run 'flowforge help' for usage information`);
}
```

### Graceful Degradation

```javascript
function handleMissingFeature(feature, fallback = null) {
  if (context.isNpx && !isFeatureAvailable(feature)) {
    console.warn(`⚠️  Feature ${feature} limited in NPX mode`);
    
    if (fallback) {
      console.log(`Using fallback: ${fallback}`);
      return fallback;
    }
    
    console.log('Consider installing globally for full features');
    return null;
  }
  
  return feature;
}
```

## Security Considerations

### Package Integrity

```javascript
function verifyPackageIntegrity() {
  const packageJson = require('../package.json');
  
  // Verify we're running the official package
  if (packageJson.name !== '@flowforge/cli') {
    throw new Error('Invalid package detected');
  }
  
  // Version sanity check
  if (!packageJson.version.match(/^\d+\.\d+\.\d+/)) {
    throw new Error('Invalid version format');
  }
}
```

### NPX Execution Safety

```javascript
// Validate NPX environment
function validateNpxEnvironment() {
  const env = process.env;
  
  // Check for suspicious environment variables
  const suspiciousVars = ['npm_config_user', 'npm_config_prefix'];
  
  for (const varName of suspiciousVars) {
    if (env[varName] && !isValidPath(env[varName])) {
      console.warn(`⚠️  Suspicious environment: ${varName}`);
    }
  }
}
```

## Testing Strategy

### Context Mocking

```javascript
// Test helper for mocking execution contexts
function mockExecutionContext(contextType) {
  const originalEnv = process.env;
  
  const contextEnvs = {
    npx: { npm_execpath: '/usr/local/lib/node_modules/npm/bin/_npx' },
    global: { npm_config_prefix: '/usr/local' },
    local: { PWD: '/project/node_modules/@flowforge/cli' }
  };
  
  process.env = { ...originalEnv, ...contextEnvs[contextType] };
  
  return () => {
    process.env = originalEnv;
  };
}
```

### Integration Testing

```javascript
// Test NPX execution flow
describe('NPX Integration', () => {
  it('should detect NPX context correctly', () => {
    const cleanup = mockExecutionContext('npx');
    
    const context = detectContext();
    expect(context.isNpx).toBe(true);
    expect(context.type).toBe('npx');
    
    cleanup();
  });
  
  it('should resolve paths in NPX mode', () => {
    const cleanup = mockExecutionContext('npx');
    
    const resolver = new PathResolver();
    const scriptPath = resolver.getScript('install-flowforge');
    expect(scriptPath).toContain('scripts/install-flowforge');
    
    cleanup();
  });
});
```

## Monitoring and Analytics

### Usage Tracking (Privacy-Preserving)

```javascript
// Anonymous usage analytics
function trackNpxUsage(command, context) {
  if (process.env.FLOWFORGE_ANALYTICS === 'false') return;
  
  const analytics = {
    context: context.type,
    command: command,
    version: packageJson.version,
    timestamp: new Date().toISOString(),
    // No personal information collected
  };
  
  // Send to anonymous analytics endpoint
  sendAnalytics(analytics).catch(() => {
    // Fail silently - analytics should never block functionality
  });
}
```

## Future Enhancements

### Progressive Web App Integration

```javascript
// Future: NPX to PWA bridge
function checkPwaAvailability() {
  if (context.isNpx && navigator?.serviceWorker) {
    console.log('💡 FlowForge PWA available for offline use');
    console.log('   Visit: https://app.flowforge.dev');
  }
}
```

### Smart Caching

```javascript
// Future: Intelligent package caching
function optimizeNpxCaching() {
  const cacheStrategy = {
    maxAge: '7d',
    preloadModules: ['core', 'commands'],
    backgroundUpdate: true
  };
  
  return setupSmartCache(cacheStrategy);
}
```

## Debugging NPX Issues

### Debug Mode

```bash
# Enable detailed NPX debugging
FLOWFORGE_DEBUG=true npx @flowforge/cli version

# Show path resolution
FLOWFORGE_DEBUG_PATHS=true npx @flowforge/cli init

# Trace command execution
FLOWFORGE_TRACE=true npx @flowforge/cli run help
```

### Common Issues and Solutions

```javascript
// Diagnostic utilities
function diagnoseNpxIssues() {
  console.log('🔍 FlowForge NPX Diagnostics');
  console.log('============================');
  
  // Environment check
  console.log('Node version:', process.version);
  console.log('NPM version:', execSync('npm --version', { encoding: 'utf8' }).trim());
  console.log('NPX available:', which.sync('npx') ? '✅' : '❌');
  
  // Context detection
  const context = detectContext();
  console.log('Detected context:', context);
  
  // Path resolution
  const resolver = new PathResolver();
  console.log('Base path:', resolver.getBasePath());
  console.log('Commands available:', fs.existsSync(resolver.resolve('commands')));
}
```

## API Reference

### Context Manager API

```typescript
interface ExecutionContext {
  type: 'npx' | 'global' | 'local';
  isNpx: boolean;
  isGlobal: boolean;
  isLocal: boolean;
  npmExecutable?: string;
  packagePath?: string;
}

function detectContext(): ExecutionContext;
```

### Path Resolver API

```typescript
class PathResolver {
  constructor();
  
  getContext(): ExecutionContext;
  getBasePath(): string;
  resolve(...paths: string[]): string;
  getScript(scriptName: string): string;
  getRunScript(): string;
  
  // Asset resolution
  resolveAsset(assetPath: string): string;
  copyAssets(targetDir: string): Promise<void>;
}
```

## Summary

FlowForge's NPX architecture represents a **sophisticated balance** between:

- **Zero-friction user experience** - Works instantly without installation
- **Full functionality** - Complete FlowForge feature set available
- **Performance optimization** - Smart caching and lazy loading
- **Context awareness** - Adapts behavior based on execution mode
- **Professional reliability** - Robust error handling and graceful degradation

The dual-mode design ensures FlowForge can be **evaluated instantly** via NPX while providing **seamless upgrade paths** to installed versions, embodying the framework's core principle of removing friction from developer workflows.

**Key Technical Achievements:**

✅ **Seamless Context Detection** - Automatically adapts to execution environment  
✅ **Dynamic Path Resolution** - Works across NPX, global, and local installations  
✅ **Smart Asset Management** - Optimized file bundling for NPX performance  
✅ **Graceful Degradation** - Maintains functionality across all contexts  
✅ **Professional UX** - Context-aware help and error messages  

This architecture enables FlowForge's **"try before you buy"** philosophy while maintaining the professional standards expected in enterprise development environments.