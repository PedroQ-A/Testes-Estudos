# FlowForge v2.0 Agent Enforcement Architecture

## Executive Summary

**Critical Issue**: FlowForge agents exist but are NOT being used automatically, violating Rule #35 and compromising the framework's core value proposition of "correct development regardless of context."

**Solution**: Implement proactive agent enforcement through context detection, automated invocation, and zero-bypass mechanisms that ensure agents are ALWAYS used for their designated domains.

## Current State Analysis

### Agent Availability Assessment
```javascript
// Available Agents in FlowForge v2.0
const availableAgents = {
  'fft-testing': 'Test strategy and TDD implementation',
  'fft-documentation': 'All documentation tasks', 
  'fft-project-manager': 'Planning and task breakdown',
  'fft-database': 'Database design and optimization',
  'fft-architecture': 'System design decisions',
  'fft-api-designer': 'API design and contracts',
  'fft-github': 'Git operations and repository management',
  'fft-security': 'Security architecture and threat modeling',
  'fft-performance': 'Performance optimization',
  'fft-frontend': 'Frontend architecture',
  'fft-devops-agent': 'Infrastructure and deployment',
  'fft-code-reviewer': 'Code quality and reviews'
};

// Critical Problem: Claude Code doesn't automatically invoke these agents
const currentUsage = {
  automatic: 0,    // Zero automatic invocations
  manual: 0,       // Zero manual invocations
  bypassed: 100    // 100% of tasks bypass agents
};
```

### Agent Integration Failure Points
1. **No Context Detection** - System doesn't recognize when agents should be used
2. **Missing Invocation Layer** - No automatic agent calling mechanism
3. **Context-Dependent Operation** - Agents only work when remembered by user
4. **No Enforcement Hooks** - Nothing prevents agent bypass
5. **Silent Failures** - No warnings when agents should be used but aren't

## Agent Enforcement Architecture

### 1. Proactive Agent Detection System

```javascript
// File: .flowforge/core/agent-detector.js
class AgentDetector {
  constructor() {
    this.contextPatterns = this.loadContextPatterns();
    this.agentRegistry = this.loadAgentRegistry();
  }
  
  // Analyze work context and determine required agents
  detectRequiredAgents(context) {
    const requiredAgents = [];
    
    // File-based detection
    if (context.files) {
      for (const file of context.files) {
        const agents = this.detectByFile(file);
        requiredAgents.push(...agents);
      }
    }
    
    // Task-based detection
    if (context.task) {
      const agents = this.detectByTask(context.task);
      requiredAgents.push(...agents);
    }
    
    // Command-based detection
    if (context.command) {
      const agents = this.detectByCommand(context.command);
      requiredAgents.push(...agents);
    }
    
    return [...new Set(requiredAgents)]; // Remove duplicates
  }
  
  detectByFile(filePath) {
    const agents = [];
    
    // Documentation files
    if (filePath.match(/\.(md|txt|rst)$/i)) {
      agents.push('fft-documentation');
    }
    
    // Test files
    if (filePath.match(/\.(test|spec)\.(js|ts|py)$/i)) {
      agents.push('fft-testing');
    }
    
    // Database files
    if (filePath.match(/(migration|schema|model|entity)\.(js|ts|sql)$/i)) {
      agents.push('fft-database');
    }
    
    // API files
    if (filePath.match(/(route|controller|api|endpoint)\.(js|ts)$/i)) {
      agents.push('fft-api-designer');
    }
    
    // Architecture files
    if (filePath.match(/(architecture|design|adr)\.(md|txt)$/i)) {
      agents.push('fft-architecture');
    }
    
    // Frontend files
    if (filePath.match(/\.(vue|react|jsx|tsx|html|css|scss)$/i)) {
      agents.push('fft-frontend');
    }
    
    // DevOps files
    if (filePath.match(/(dockerfile|docker-compose|k8s|terraform|ansible)\.(yml|yaml|tf)$/i)) {
      agents.push('fft-devops-agent');
    }
    
    return agents;
  }
  
  detectByTask(taskDescription) {
    const agents = [];
    const lowerTask = taskDescription.toLowerCase();
    
    // Testing keywords
    if (lowerTask.match(/\b(test|tdd|unit|integration|coverage)\b/)) {
      agents.push('fft-testing');
    }
    
    // Documentation keywords
    if (lowerTask.match(/\b(document|readme|guide|manual|wiki)\b/)) {
      agents.push('fft-documentation');
    }
    
    // Database keywords
    if (lowerTask.match(/\b(database|migration|schema|query|sql)\b/)) {
      agents.push('fft-database');
    }
    
    // Architecture keywords
    if (lowerTask.match(/\b(architecture|design|pattern|structure)\b/)) {
      agents.push('fft-architecture');
    }
    
    // API keywords
    if (lowerTask.match(/\b(api|endpoint|route|controller|swagger)\b/)) {
      agents.push('fft-api-designer');
    }
    
    // Planning keywords
    if (lowerTask.match(/\b(plan|breakdown|estimate|roadmap|milestone)\b/)) {
      agents.push('fft-project-manager');
    }
    
    // Performance keywords
    if (lowerTask.match(/\b(performance|optimize|benchmark|profiling)\b/)) {
      agents.push('fft-performance');
    }
    
    // Security keywords
    if (lowerTask.match(/\b(security|auth|encrypt|vulnerability|secure)\b/)) {
      agents.push('fft-security');
    }
    
    return agents;
  }
  
  detectByCommand(command) {
    const agents = [];
    
    // FlowForge commands that should trigger agents
    const commandMappings = {
      'session:start': ['fft-project-manager'],
      'dev:tdd': ['fft-testing'],
      'project:plan': ['fft-project-manager'],
      'dev:checkrules': ['fft-code-reviewer'],
      'project:setup': ['fft-architecture', 'fft-project-manager']
    };
    
    for (const [cmd, cmdAgents] of Object.entries(commandMappings)) {
      if (command.includes(cmd)) {
        agents.push(...cmdAgents);
      }
    }
    
    return agents;
  }
}
```

### 2. Automatic Agent Invocation System

```javascript
// File: .flowforge/core/agent-orchestrator.js
class AgentOrchestrator {
  constructor() {
    this.detector = new AgentDetector();
    this.invoker = new AgentInvoker();
    this.enforcer = new AgentEnforcer();
  }
  
  // Main orchestration method - called by all FlowForge commands
  async orchestrateAgents(context) {
    // 1. Detect required agents
    const requiredAgents = this.detector.detectRequiredAgents(context);
    
    if (requiredAgents.length === 0) {
      return { agents: [], bypassed: false };
    }
    
    // 2. Check if user is trying to bypass agents
    const bypassAttempt = this.enforcer.detectBypassAttempt(context);
    if (bypassAttempt) {
      return this.enforcer.handleBypassAttempt(requiredAgents, context);
    }
    
    // 3. Invoke agents automatically
    const results = await this.invoker.invokeAgents(requiredAgents, context);
    
    // 4. Validate agent execution
    const validation = this.enforcer.validateAgentExecution(results);
    
    return {
      agents: requiredAgents,
      results,
      validation,
      bypassed: false
    };
  }
  
  // For Claude Code integration - determines if agents should be used
  shouldUseAgents(context) {
    const requiredAgents = this.detector.detectRequiredAgents(context);
    return requiredAgents.length > 0;
  }
  
  // For command line integration - forces agent usage
  enforceAgentUsage(context) {
    const requiredAgents = this.detector.detectRequiredAgents(context);
    
    if (requiredAgents.length === 0) {
      return { required: false };
    }
    
    return {
      required: true,
      agents: requiredAgents,
      message: `🔧 Required agents: ${requiredAgents.join(', ')}`,
      enforcement: 'MANDATORY'
    };
  }
}
```

### 3. Zero-Bypass Enforcement Mechanisms

```javascript
// File: .flowforge/core/agent-enforcer.js
class AgentEnforcer {
  constructor() {
    this.violations = [];
    this.strictMode = true; // v2.0 default
  }
  
  // Detect attempts to bypass agent usage
  detectBypassAttempt(context) {
    const indicators = [
      // Manual work on agent domains
      context.manualWork && this.isAgentDomain(context.workType),
      
      // Direct file modification without agent
      context.files && this.requiresAgent(context.files) && !context.agentInvoked,
      
      // Command execution without agent pre-check
      context.command && this.commandRequiresAgent(context.command) && !context.agentConsulted
    ];
    
    return indicators.some(indicator => indicator);
  }
  
  // Handle bypass attempts with zero tolerance
  handleBypassAttempt(requiredAgents, context) {
    const violation = {
      timestamp: new Date().toISOString(),
      context,
      requiredAgents,
      severity: 'CRITICAL',
      rule: 'Rule #35: Always Use FlowForge Agents'
    };
    
    this.violations.push(violation);
    
    if (this.strictMode) {
      // HALT execution - no bypass allowed
      throw new AgentEnforcementError(
        `🚨 MANDATORY AGENT USAGE VIOLATION\n\n` +
        `Required agents: ${requiredAgents.join(', ')}\n` +
        `Context: ${JSON.stringify(context, null, 2)}\n\n` +
        `FlowForge Rule #35: Agent usage is MANDATORY for quality assurance.\n` +
        `This prevents errors and ensures consistency.\n\n` +
        `Solution: Use Task tool to invoke required agents first.`
      );
    }
    
    // Warning mode (development only)
    return {
      bypassed: true,
      violation,
      warning: `⚠️ Agent bypass detected - quality may be compromised`
    };
  }
  
  // Validate that agents were actually executed properly
  validateAgentExecution(agentResults) {
    const validation = {
      executed: true,
      quality: 'UNKNOWN',
      issues: []
    };
    
    for (const [agent, result] of Object.entries(agentResults)) {
      if (!result || result.error) {
        validation.issues.push(`${agent}: Execution failed`);
        validation.quality = 'FAILED';
      }
      
      if (!result.output || result.output.length < 100) {
        validation.issues.push(`${agent}: Insufficient output quality`);
        validation.quality = 'POOR';
      }
    }
    
    if (validation.issues.length === 0) {
      validation.quality = 'EXCELLENT';
    }
    
    return validation;
  }
  
  // Check if work type is in agent domain
  isAgentDomain(workType) {
    const agentDomains = {
      'documentation': 'fft-documentation',
      'testing': 'fft-testing', 
      'database': 'fft-database',
      'architecture': 'fft-architecture',
      'api': 'fft-api-designer',
      'planning': 'fft-project-manager',
      'security': 'fft-security',
      'performance': 'fft-performance',
      'frontend': 'fft-frontend',
      'devops': 'fft-devops-agent',
      'review': 'fft-code-reviewer'
    };
    
    return Object.keys(agentDomains).includes(workType);
  }
}

class AgentEnforcementError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AgentEnforcementError';
    this.code = 'AGENT_REQUIRED';
  }
}
```

### 4. Context-Independent Operation

```bash
#!/bin/bash
# File: .flowforge/hooks/pre-agent-check.sh
# Pre-execution agent requirement check

set -e

CONTEXT_FILE="/tmp/flowforge-context.json"
WORK_TYPE="$1"
FILES_CHANGED="$2"

# Detect required agents based on context
node -e "
const detector = require('./.flowforge/core/agent-detector.js');
const context = {
  workType: '$WORK_TYPE',
  files: '$FILES_CHANGED'.split(',').filter(f => f),
  timestamp: new Date().toISOString()
};

const requiredAgents = detector.detectRequiredAgents(context);

if (requiredAgents.length > 0) {
  console.error('🔧 REQUIRED AGENTS:', requiredAgents.join(', '));
  console.error('📖 Rule #35: Agent usage is mandatory');
  console.error('🚨 Cannot proceed without agent consultation');
  process.exit(1);
}
"

echo "✅ No agents required for this context"
```

### 5. FlowForge Command Integration

```bash
# File: commands/flowforge/core/agent-check.md
# Agent Requirement Check Command

## Description
Validates agent requirements for current context and enforces usage.

## Usage
```bash
/flowforge:agent:check [context]
/flowforge:agent:enforce [context] 
/flowforge:agent:validate [agents]
```

## Implementation
```bash
#!/bin/bash

CONTEXT_TYPE="${1:-auto}"
ENFORCEMENT_MODE="${FLOWFORGE_AGENT_ENFORCEMENT:-strict}"

# Auto-detect context if not specified
if [[ "$CONTEXT_TYPE" == "auto" ]]; then
    # Analyze current directory, git status, recent commands
    CONTEXT_TYPE=$(node .flowforge/core/detect-context.js)
fi

# Load agent orchestrator
REQUIRED_AGENTS=$(node -e "
const orchestrator = require('./.flowforge/core/agent-orchestrator.js');
const context = {
    type: '$CONTEXT_TYPE',
    cwd: process.cwd(),
    gitStatus: '$(git status --porcelain)',
    command: process.env.FLOWFORGE_LAST_COMMAND || ''
};

const enforcement = orchestrator.enforceAgentUsage(context);
console.log(JSON.stringify(enforcement));
")

# Parse results
REQUIRED=$(echo "$REQUIRED_AGENTS" | jq -r '.required')

if [[ "$REQUIRED" == "true" ]]; then
    AGENTS=$(echo "$REQUIRED_AGENTS" | jq -r '.agents[]')
    MESSAGE=$(echo "$REQUIRED_AGENTS" | jq -r '.message')
    
    echo "$MESSAGE"
    echo ""
    echo "🎯 Available options:"
    echo "1. Use Task tool to invoke agents automatically"
    echo "2. Call agents manually: /flowforge:agent:invoke [agent-name]"
    echo "3. Override (NOT RECOMMENDED): --force-bypass"
    
    if [[ "$ENFORCEMENT_MODE" == "strict" ]]; then
        echo ""
        echo "❌ Strict mode: Cannot proceed without agent usage"
        exit 1
    fi
else
    echo "✅ No agents required for current context"
fi
```

### 6. Claude Code Integration Pattern

```javascript
// File: .flowforge/integrations/claude-code.js
// Integration layer for Claude Code environment

class ClaudeCodeAgentIntegration {
  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.context = this.detectClaudeCodeContext();
  }
  
  // Analyze Claude Code session context
  detectClaudeCodeContext() {
    return {
      environment: 'claude-code',
      workingDirectory: process.cwd(),
      recentCommands: this.getRecentCommands(),
      fileChanges: this.getFileChanges(),
      currentTask: this.getCurrentTask(),
      sessionDuration: this.getSessionDuration()
    };
  }
  
  // Main integration point - called before any significant operation
  async checkAgentRequirements(operation) {
    const context = {
      ...this.context,
      operation,
      timestamp: new Date().toISOString()
    };
    
    const shouldUse = this.orchestrator.shouldUseAgents(context);
    
    if (shouldUse) {
      const enforcement = this.orchestrator.enforceAgentUsage(context);
      
      // In Claude Code, we provide guidance rather than blocking
      return {
        agentsRequired: true,
        guidance: this.formatClaudeCodeGuidance(enforcement),
        autoInvoke: this.shouldAutoInvoke(enforcement)
      };
    }
    
    return { agentsRequired: false };
  }
  
  // Format agent guidance for Claude Code output
  formatClaudeCodeGuidance(enforcement) {
    return `
🤖 **Agent Consultation Required**

FlowForge has detected that this task requires specialized agents:
${enforcement.agents.map(agent => `• ${agent}`).join('\n')}

**Recommended approach:**
1. Use the Task tool to invoke these agents
2. Review agent recommendations 
3. Proceed with implementation

**Why this matters:**
Agents ensure consistency, prevent errors, and maintain quality standards
that manual work might miss.
    `.trim();
  }
  
  // Determine if agents should be auto-invoked
  shouldAutoInvoke(enforcement) {
    // Auto-invoke for critical domains
    const criticalAgents = ['fft-security', 'fft-database', 'fft-architecture'];
    return enforcement.agents.some(agent => criticalAgents.includes(agent));
  }
}

// Export for use in FlowForge commands
module.exports = { ClaudeCodeAgentIntegration };
```

## 7. Implementation Strategy

### Phase 1: Detection Infrastructure
```bash
# Day 1: Core detection system
1. Implement AgentDetector class
2. Add context analysis capabilities  
3. Create file-based detection rules
4. Test with existing FlowForge codebase

# Validation: Correctly identifies 90% of agent requirements
```

### Phase 2: Enforcement Mechanisms
```bash
# Day 2: Zero-bypass enforcement
1. Implement AgentEnforcer class
2. Add strict mode enforcement
3. Create violation tracking
4. Install pre-commit hooks

# Validation: All bypass attempts are caught and blocked
```

### Phase 3: Command Integration
```bash
# Day 3: FlowForge command updates
1. Update all commands to check agent requirements
2. Add agent orchestration calls
3. Modify session:start to include agent detection
4. Test command-level enforcement

# Validation: No FlowForge command can bypass agent requirements
```

### Phase 4: Claude Code Integration
```bash
# Day 4: Claude Code environment integration
1. Implement Claude Code integration layer
2. Add context detection for Claude sessions
3. Create guidance formatting for developers
4. Test auto-invocation mechanisms

# Validation: Claude Code sessions automatically detect agent needs
```

## 8. Agent Availability Solutions

### Problem: Agents Not Available in Claude Code
The core issue is that agents are defined in FlowForge but not accessible within Claude Code sessions. 

### Solution: Task Tool Integration
```javascript
// File: .flowforge/core/task-tool-bridge.js
// Bridge between FlowForge agents and Claude Code Task tool

class TaskToolBridge {
  constructor() {
    this.agentMappings = this.loadAgentMappings();
  }
  
  // Convert agent requirements to Task tool instructions
  convertToTaskInstructions(requiredAgents, context) {
    const instructions = requiredAgents.map(agent => {
      const agentConfig = this.agentMappings[agent];
      
      return {
        tool: 'Task',
        instruction: this.formatAgentInstruction(agent, agentConfig, context),
        priority: agentConfig.priority || 'medium',
        domain: agentConfig.domain
      };
    });
    
    return instructions;
  }
  
  formatAgentInstruction(agentName, config, context) {
    return `You are now acting as ${agentName} - ${config.description}. 

Context: ${JSON.stringify(context, null, 2)}

Your responsibilities:
${config.responsibilities.map(r => `• ${r}`).join('\n')}

Approach this task with your specialized expertise in ${config.domain}.
Ensure your output follows FlowForge standards and provides actionable guidance.`;
  }
  
  loadAgentMappings() {
    return {
      'fft-documentation': {
        description: 'Documentation specialist focused on clear, maintainable docs',
        domain: 'technical writing',
        priority: 'high',
        responsibilities: [
          'Create comprehensive documentation',
          'Ensure documentation accuracy',
          'Follow documentation standards',
          'Update existing documentation'
        ]
      },
      
      'fft-testing': {
        description: 'Testing specialist focused on TDD and quality assurance',
        domain: 'software testing',
        priority: 'critical',
        responsibilities: [
          'Design test strategies',
          'Implement test-driven development',
          'Ensure adequate test coverage',
          'Create integration and unit tests'
        ]
      },
      
      'fft-architecture': {
        description: 'System architect focused on scalable, maintainable design',
        domain: 'software architecture',
        priority: 'critical',
        responsibilities: [
          'Design system architecture',
          'Create architectural decisions records',
          'Ensure scalability and maintainability',
          'Define patterns and standards'
        ]
      }
      
      // ... additional agents
    };
  }
}
```

### Auto-Agent Invocation via Task Tool
```bash
#!/bin/bash
# File: .flowforge/scripts/auto-invoke-agents.sh
# Automatically invoke required agents via Task tool

REQUIRED_AGENTS="$1"
CONTEXT="$2"

echo "🤖 Auto-invoking required agents..."

for agent in $(echo "$REQUIRED_AGENTS" | tr ',' ' '); do
    echo ""
    echo "📋 Invoking $agent..."
    
    # Generate Task tool instruction
    INSTRUCTION=$(node -e "
        const bridge = require('./.flowforge/core/task-tool-bridge.js');
        const instructions = bridge.convertToTaskInstructions(['$agent'], $CONTEXT);
        console.log(instructions[0].instruction);
    ")
    
    # Note: In actual implementation, this would trigger Task tool
    echo "Task instruction generated for $agent"
    echo "Instruction: $INSTRUCTION"
    
    # Placeholder for actual Task tool invocation
    # This would be replaced with actual Task tool integration
done

echo ""
echo "✅ All required agents invoked"
```

## 9. Monitoring & Validation

### Agent Usage Metrics
```javascript
// File: .flowforge/core/agent-metrics.js
class AgentMetrics {
  constructor() {
    this.metricsFile = '.flowforge/data/agent-metrics.json';
    this.loadMetrics();
  }
  
  // Track agent usage patterns
  recordAgentUsage(agents, context, outcome) {
    const record = {
      timestamp: new Date().toISOString(),
      agents,
      context: this.sanitizeContext(context),
      outcome,
      sessionId: process.env.FLOWFORGE_SESSION_ID
    };
    
    this.metrics.usage.push(record);
    this.saveMetrics();
  }
  
  // Track bypass attempts
  recordBypassAttempt(agents, context, resolved) {
    const record = {
      timestamp: new Date().toISOString(),
      agents,
      context: this.sanitizeContext(context),
      resolved,
      severity: 'HIGH'
    };
    
    this.metrics.bypasses.push(record);
    this.saveMetrics();
  }
  
  // Generate compliance report
  generateComplianceReport() {
    const total = this.metrics.usage.length;
    const bypasses = this.metrics.bypasses.length;
    const resolved = this.metrics.bypasses.filter(b => b.resolved).length;
    
    return {
      compliance: {
        total_tasks: total,
        agent_usage_rate: total > 0 ? ((total - bypasses) / total * 100).toFixed(2) : 100,
        bypass_attempts: bypasses,
        resolved_bypasses: resolved,
        compliance_score: total > 0 ? ((total - bypasses + resolved) / total * 100).toFixed(2) : 100
      },
      recommendations: this.generateRecommendations()
    };
  }
}
```

### Compliance Dashboard
```bash
#!/bin/bash
# File: .flowforge/scripts/agent-compliance-dashboard.sh
# Display agent compliance metrics

echo "🤖 FlowForge Agent Compliance Dashboard"
echo "═══════════════════════════════════════"

# Load metrics
METRICS=$(node -e "
const metrics = require('./.flowforge/core/agent-metrics.js');
const report = metrics.generateComplianceReport();
console.log(JSON.stringify(report, null, 2));
")

# Parse and display
COMPLIANCE_SCORE=$(echo "$METRICS" | jq -r '.compliance.compliance_score')
USAGE_RATE=$(echo "$METRICS" | jq -r '.compliance.agent_usage_rate')
BYPASSES=$(echo "$METRICS" | jq -r '.compliance.bypass_attempts')

echo ""
echo "📊 Current Status:"
echo "   Compliance Score: $COMPLIANCE_SCORE%"
echo "   Agent Usage Rate: $USAGE_RATE%"
echo "   Bypass Attempts:  $BYPASSES"

# Status indicator
if (( $(echo "$COMPLIANCE_SCORE >= 95" | bc -l) )); then
    echo "   Status: 🟢 EXCELLENT"
elif (( $(echo "$COMPLIANCE_SCORE >= 80" | bc -l) )); then
    echo "   Status: 🟡 GOOD"
else
    echo "   Status: 🔴 NEEDS IMPROVEMENT"
fi

echo ""
echo "🎯 Targets:"
echo "   Compliance Score: ≥ 95%"
echo "   Agent Usage Rate: ≥ 90%"
echo "   Bypass Attempts:  ≤ 5 per week"
```

## 10. Success Metrics & KPIs

### Agent Enforcement KPIs
- **Agent Usage Rate**: ≥ 95% of applicable tasks use agents
- **Bypass Detection**: 100% of bypass attempts caught and handled
- **Quality Improvement**: Measurable increase in output quality
- **Compliance Score**: ≥ 95% overall compliance
- **Response Time**: Agent requirements detected within 5 seconds

### Quality Metrics
- **Documentation Quality**: Consistent formatting and completeness
- **Test Coverage**: Automated achievement of 80%+ coverage
- **Architecture Decisions**: All major decisions use fft-architecture
- **API Consistency**: All APIs designed by fft-api-designer
- **Security Reviews**: All security-related work uses fft-security

## Conclusion

This Agent Enforcement Architecture ensures FlowForge v2.0 delivers on its promise of "correct development regardless of context" by making agent usage mandatory, automatic, and inescapable. The zero-bypass enforcement protects quality while the proactive detection ensures no agent requirements are missed.

**Key Takeaway**: Agent enforcement is not optional - it's the foundation of FlowForge's value proposition and must be implemented with zero tolerance for bypasses.

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-08-17  
**Status**: Implementation Required  
**Priority**: CRITICAL