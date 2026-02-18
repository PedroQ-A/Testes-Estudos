# Integration Guide: Enhanced Task Completion Detector

## Overview

This guide demonstrates how to integrate the Enhanced Task Completion Detector with FlowForge v2.0's core systems and external tools. The detector is designed for seamless integration across the entire development ecosystem.

## Core System Integration

### Provider Bridge Integration

The completion detector integrates natively with FlowForge's provider bridge system to receive real-time task updates from external systems.

#### Automatic Integration

```javascript
// Provider bridge automatically connects to completion detector
const ProviderBridge = require('../../provider/ProviderBridge');
const EnhancedTaskCompletionDetector = require('../detection/EnhancedTaskCompletionDetector');

class ProviderBridgeIntegration {
  constructor() {
    this.detector = new EnhancedTaskCompletionDetector({
      enableAggregation: true
    });
    
    this.providerBridge = new ProviderBridge({
      onTaskUpdate: this.handleTaskUpdate.bind(this)
    });
  }
  
  async handleTaskUpdate(update) {
    const { taskId, status, provider } = update;
    
    // Trigger completion detection on status changes
    if (status.changed && ['closed', 'completed', 'done'].includes(status.value)) {
      console.log(`Task #${taskId} marked as ${status.value} in ${provider}`);
      
      const result = await this.detector.checkCompletion(taskId);
      
      if (result.completed && result.confidence > 0.8) {
        await this.handleTaskCompletion(taskId, result);
      }
    }
  }
  
  async handleTaskCompletion(taskId, result) {
    // Trigger aggregation
    if (this.detector.completionAggregator) {
      await this.detector.completionAggregator.triggerAggregation();
    }
    
    // Notify other systems
    await this.notifyCompletion(taskId, result);
  }
}

// Initialize integration
const integration = new ProviderBridgeIntegration();
```

#### Manual Provider Setup

For custom provider integrations:

```javascript
// Custom GitHub integration
class CustomGitHubIntegration {
  constructor(detector) {
    this.detector = detector;
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }
  
  async watchIssues(owner, repo) {
    // Poll for issue changes
    setInterval(async () => {
      const { data: issues } = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        since: new Date(Date.now() - 5 * 60 * 1000).toISOString() // Last 5 minutes
      });
      
      for (const issue of issues) {
        if (issue.state === 'closed' && issue.closed_at) {
          const closedRecently = new Date(issue.closed_at) > new Date(Date.now() - 5 * 60 * 1000);
          
          if (closedRecently) {
            await this.detector.checkCompletion(issue.number.toString());
          }
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
}

// Setup custom integration
const customIntegration = new CustomGitHubIntegration(detector);
await customIntegration.watchIssues('owner', 'repo');
```

### SmartBatchAggregator Integration

The detector seamlessly feeds completion data to the team aggregation system for billing and reporting.

#### Automatic Aggregation

```javascript
// Automatic aggregation happens in checkCompletion method
class EnhancedTaskCompletionDetector {
  async checkCompletion(taskId) {
    // ... detection logic ...
    
    const result = {
      completed,
      confidence: overallConfidence,
      detectionMethods,
      metadata: this.privacyFilter.filter(metadata),
      // ... other fields ...
    };
    
    // Auto-aggregate to team data
    if (this.completionAggregator) {
      await this.completionAggregator.aggregateCompletion({
        taskId,
        completed: result.completed,
        confidence: result.confidence,
        detectionMethods: result.detectionMethods,
        metadata: result.metadata,
        timestamp: new Date().toISOString()
      });
    }
    
    return result;
  }
}
```

#### Custom Aggregation Workflows

```javascript
// Custom aggregation with team notifications
class TeamAggregationWorkflow {
  constructor(detector, aggregator) {
    this.detector = detector;
    this.aggregator = aggregator;
  }
  
  async processTaskCompletion(taskId) {
    const result = await this.detector.checkCompletion(taskId);
    
    if (result.completed) {
      // Custom aggregation with additional context
      await this.aggregator.aggregateCompletion({
        ...result,
        teamContext: await this.getTeamContext(taskId),
        billingMetrics: await this.calculateBillingMetrics(taskId),
        projectImpact: await this.assessProjectImpact(taskId)
      });
      
      // Generate team notification
      await this.notifyTeamCompletion(taskId, result);
      
      // Update project dashboards
      await this.updateDashboards(taskId, result);
    }
    
    return result;
  }
  
  async getTeamContext(taskId) {
    // Load team context from FlowForge data
    const teamData = await this.loadTeamData();
    return {
      assignedDeveloper: teamData.assignments[taskId],
      estimatedHours: teamData.estimates[taskId],
      actualHours: teamData.timeTracking[taskId]?.total || 0,
      complexity: teamData.complexity[taskId] || 'medium'
    };
  }
}
```

### Git Hooks Integration

The detector integrates with FlowForge's enhanced git hooks for automatic completion detection on commits.

#### Enhanced Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit
# Enhanced FlowForge hook with completion detection

set -euo pipefail

readonly FLOWFORGE_DIR=".flowforge"
readonly DETECTOR_SCRIPT="scripts/detect-completion.js"

# Source FlowForge environment
if [ -f "$FLOWFORGE_DIR/environment.sh" ]; then
    source "$FLOWFORGE_DIR/environment.sh"
fi

# Run standard FlowForge aggregation
run_flowforge_aggregation() {
    echo "🔄 Running FlowForge time aggregation..."
    
    if command -v flowforge_aggregate >/dev/null 2>&1; then
        if flowforge_aggregate; then
            echo "✅ Time aggregation successful"
            return 0
        else
            echo "⚠️  Time aggregation failed"
            return 1
        fi
    else
        echo "⚠️  FlowForge aggregation not available"
        return 1
    fi
}

# Run completion detection
run_completion_detection() {
    local task_id="$1"
    
    if [ -z "$task_id" ]; then
        echo "⚠️  No task ID found, skipping completion detection"
        return 0
    fi
    
    echo "🔍 Running completion detection for task #$task_id..."
    
    if [ -f "$DETECTOR_SCRIPT" ]; then
        if node "$DETECTOR_SCRIPT" "$task_id" --aggregate --team-summary --quiet; then
            echo "✅ Completion detection successful"
            return 0
        else
            echo "⚠️  Completion detection failed, continuing..."
            return 1
        fi
    else
        echo "⚠️  Completion detector not available"
        return 1
    fi
}

# Extract task ID from various sources
get_task_id() {
    local task_id=""
    
    # Method 1: Check current task file
    if [ -f "$FLOWFORGE_DIR/current-task.txt" ]; then
        task_id=$(cat "$FLOWFORGE_DIR/current-task.txt" 2>/dev/null | tr -d '\n\r ')
    fi
    
    # Method 2: Extract from branch name
    if [ -z "$task_id" ]; then
        local branch_name=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
        if [[ "$branch_name" =~ feature/([0-9]+) ]]; then
            task_id="${BASH_REMATCH[1]}"
        elif [[ "$branch_name" =~ ([0-9]+) ]]; then
            task_id="${BASH_REMATCH[1]}"
        fi
    fi
    
    # Method 3: Extract from commit message
    if [ -z "$task_id" ]; then
        local commit_msg_file=".git/COMMIT_EDITMSG"
        if [ -f "$commit_msg_file" ]; then
            local commit_msg=$(cat "$commit_msg_file" 2>/dev/null || echo "")
            if [[ "$commit_msg" =~ \#([0-9]+) ]]; then
                task_id="${BASH_REMATCH[1]}"
            fi
        fi
    fi
    
    echo "$task_id"
}

# Main execution
main() {
    echo "🚀 Starting FlowForge pre-commit processing..."
    
    # Run time aggregation first (critical for billing)
    if run_flowforge_aggregation; then
        echo "✅ FlowForge aggregation completed"
    else
        echo "⚠️  FlowForge aggregation failed - continuing with commit"
    fi
    
    # Run completion detection
    local task_id=$(get_task_id)
    if [ -n "$task_id" ]; then
        echo "📋 Current task: #$task_id"
        run_completion_detection "$task_id"
    else
        echo "⚠️  No task ID detected - skipping completion detection"
    fi
    
    echo "✅ Pre-commit processing completed"
    
    # Never block commits due to completion detection issues
    exit 0
}

# Execute main function
main "$@"
```

#### Post-Commit Hook Integration

```bash
#!/bin/bash
# .git/hooks/post-commit
# Post-commit completion detection

set -euo pipefail

readonly FLOWFORGE_DIR=".flowforge"
readonly DETECTOR_SCRIPT="scripts/detect-completion.js"

# Run completion detection after successful commit
run_post_commit_detection() {
    local task_id="$1"
    local commit_hash="$2"
    
    echo "🔍 Post-commit completion detection for task #$task_id (commit: $commit_hash)"
    
    if [ -f "$DETECTOR_SCRIPT" ]; then
        # Run detection with commit context
        node "$DETECTOR_SCRIPT" "$task_id" \
            --commit "$commit_hash" \
            --aggregate \
            --team-summary \
            --post-commit
    fi
}

# Main execution
main() {
    local task_id=$(get_task_id)  # Function from pre-commit hook
    local commit_hash=$(git rev-parse HEAD)
    
    if [ -n "$task_id" ]; then
        run_post_commit_detection "$task_id" "$commit_hash"
    fi
}

main "$@"
```

## CLI Integration

### FlowForge Command Integration

Integrate completion detection with FlowForge's command system:

```bash
# commands/flowforge/completion/check.md
#!/bin/bash

# FlowForge Completion Check Command
# Usage: flowforge:completion:check [task-id] [options]

set -euo pipefail

# Command metadata
readonly COMMAND_NAME="completion:check"
readonly COMMAND_VERSION="2.0.0"
readonly COMMAND_DESCRIPTION="Check task completion status using multiple detection methods"

# Default options
readonly DEFAULT_CONFIDENCE_THRESHOLD="0.7"
readonly DEFAULT_TIMEOUT="30000"

# Parse arguments
parse_arguments() {
    TASK_ID=""
    MONITOR_MODE=false
    JSON_OUTPUT=false
    VERBOSE_MODE=false
    AGGREGATE_MODE=false
    TEAM_SUMMARY=false
    CONFIDENCE_THRESHOLD="$DEFAULT_CONFIDENCE_THRESHOLD"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -m|--monitor)
                MONITOR_MODE=true
                shift
                ;;
            -j|--json)
                JSON_OUTPUT=true
                shift
                ;;
            -v|--verbose)
                VERBOSE_MODE=true
                shift
                ;;
            -a|--aggregate)
                AGGREGATE_MODE=true
                shift
                ;;
            -t|--team-summary)
                TEAM_SUMMARY=true
                shift
                ;;
            --confidence)
                CONFIDENCE_THRESHOLD="$2"
                shift 2
                ;;
            -*)
                echo "Unknown option: $1" >&2
                exit 1
                ;;
            *)
                TASK_ID="$1"
                shift
                ;;
        esac
    done
    
    # Validate task ID
    if [[ -z "$TASK_ID" ]]; then
        # Try to auto-detect task ID
        TASK_ID=$(flowforge:task:current 2>/dev/null || echo "")
        
        if [[ -z "$TASK_ID" ]]; then
            echo "Error: No task ID provided and unable to detect current task" >&2
            echo "Usage: flowforge:completion:check <task-id> [options]" >&2
            exit 1
        fi
    fi
}

# Execute completion check
execute_completion_check() {
    local detector_args=("$TASK_ID")
    
    # Add options
    if [[ "$MONITOR_MODE" == true ]]; then
        detector_args+=("--monitor")
    fi
    
    if [[ "$JSON_OUTPUT" == true ]]; then
        detector_args+=("--json")
    fi
    
    if [[ "$VERBOSE_MODE" == true ]]; then
        detector_args+=("--verbose")
    fi
    
    if [[ "$AGGREGATE_MODE" == true ]]; then
        detector_args+=("--aggregate")
    fi
    
    if [[ "$TEAM_SUMMARY" == true ]]; then
        detector_args+=("--team-summary")
    fi
    
    # Execute detector script
    if [[ -f "scripts/detect-completion.js" ]]; then
        node "scripts/detect-completion.js" "${detector_args[@]}"
    else
        echo "Error: Completion detector script not found" >&2
        exit 1
    fi
}

# Show help information
show_help() {
    cat << EOF
FlowForge Completion Check Command

USAGE:
    flowforge:completion:check [task-id] [options]

ARGUMENTS:
    task-id              Task ID to check (auto-detected if not provided)

OPTIONS:
    -h, --help           Show this help message
    -m, --monitor        Monitor task until completion
    -j, --json           Output results in JSON format
    -v, --verbose        Show detailed information
    -a, --aggregate      Trigger completion data aggregation
    -t, --team-summary   Update team summary with results
    --confidence <n>     Set confidence threshold (0-1, default: $DEFAULT_CONFIDENCE_THRESHOLD)

EXAMPLES:
    # Check current task
    flowforge:completion:check
    
    # Check specific task
    flowforge:completion:check 123
    
    # Monitor task with aggregation
    flowforge:completion:check 123 --monitor --aggregate
    
    # Get JSON output for scripts
    flowforge:completion:check 123 --json
    
    # Verbose check with team summary
    flowforge:completion:check 123 --verbose --team-summary

EXIT CODES:
    0 - Task is completed
    1 - Task is not completed
    2 - Error occurred
EOF
}

# Main execution
main() {
    parse_arguments "$@"
    execute_completion_check
}

# Execute if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

### Session Integration

Integrate with FlowForge session management:

```bash
# Integration with session:start command
# commands/flowforge/session/start.md (enhanced)

# ... existing session start logic ...

# Start completion monitoring for new task
start_completion_monitoring() {
    local task_id="$1"
    
    echo "🔍 Starting completion monitoring for task #$task_id..."
    
    # Start background monitoring
    if command -v flowforge:completion:check >/dev/null 2>&1; then
        flowforge:completion:check "$task_id" --monitor &
        local monitor_pid=$!
        
        # Save monitor PID for cleanup
        echo "$monitor_pid" > "$FLOWFORGE_DIR/completion-monitor.pid"
        
        echo "✅ Completion monitoring started (PID: $monitor_pid)"
    else
        echo "⚠️  Completion monitoring not available"
    fi
}

# Integration with session:end command
# commands/flowforge/session/end.md (enhanced)

# ... existing session end logic ...

# Final completion check and cleanup
finalize_completion_detection() {
    local task_id="$1"
    
    echo "🔍 Final completion check for task #$task_id..."
    
    # Stop background monitoring
    if [[ -f "$FLOWFORGE_DIR/completion-monitor.pid" ]]; then
        local monitor_pid=$(cat "$FLOWFORGE_DIR/completion-monitor.pid")
        if kill -0 "$monitor_pid" 2>/dev/null; then
            kill "$monitor_pid" 2>/dev/null || true
        fi
        rm -f "$FLOWFORGE_DIR/completion-monitor.pid"
    fi
    
    # Run final completion check
    if command -v flowforge:completion:check >/dev/null 2>&1; then
        local result
        if result=$(flowforge:completion:check "$task_id" --aggregate --team-summary --json 2>/dev/null); then
            local completed=$(echo "$result" | jq -r '.completed' 2>/dev/null || echo "false")
            local confidence=$(echo "$result" | jq -r '.confidence' 2>/dev/null || echo "0")
            
            if [[ "$completed" == "true" ]]; then
                echo "✅ Task #$task_id completed with ${confidence} confidence"
                
                # Ask user for confirmation
                read -p "Mark this task as complete in tracking systems? (y/N): " -n 1 -r
                echo
                
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    # Mark task complete in all systems
                    flowforge:task:complete "$task_id"
                fi
            else
                echo "⏳ Task #$task_id appears to be in progress (${confidence} confidence)"
            fi
        fi
    fi
}
```

## External Tool Integration

### Slack Integration

Integrate completion notifications with Slack:

```javascript
// integrations/SlackCompletionNotifier.js
const { WebClient } = require('@slack/web-api');

class SlackCompletionNotifier {
  constructor(options) {
    this.slack = new WebClient(options.token);
    this.channel = options.channel || '#dev-updates';
    this.mentionTeam = options.mentionTeam || false;
  }
  
  async notifyCompletion(taskId, result) {
    const { completed, confidence, detectionMethods } = result;
    
    if (!completed) return;
    
    const confidenceEmoji = confidence >= 0.9 ? '🎯' : confidence >= 0.8 ? '✅' : '⚠️';
    const methodsText = detectionMethods.join(', ');
    
    const message = {
      channel: this.channel,
      text: `Task #${taskId} completed`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${confidenceEmoji} *Task #${taskId} Completed*\n*Confidence:* ${(confidence * 100).toFixed(1)}%\n*Detection Methods:* ${methodsText}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Task'
              },
              url: `https://github.com/owner/repo/issues/${taskId}`
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Time Report'
              },
              url: `https://dashboard.company.com/tasks/${taskId}/time`
            }
          ]
        }
      ]
    };
    
    if (this.mentionTeam && confidence >= 0.9) {
      message.text = `<!channel> ${message.text}`;
    }
    
    try {
      await this.slack.chat.postMessage(message);
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }
}

// Usage
const slackNotifier = new SlackCompletionNotifier({
  token: process.env.SLACK_BOT_TOKEN,
  channel: '#dev-updates',
  mentionTeam: true
});

detector.on('completion', async (taskId, result) => {
  await slackNotifier.notifyCompletion(taskId, result);
});
```

### Jira Integration

Integrate with Jira for automatic issue transitions:

```javascript
// integrations/JiraCompletionHandler.js
const JiraApi = require('jira-client');

class JiraCompletionHandler {
  constructor(options) {
    this.jira = new JiraApi({
      protocol: 'https',
      host: options.host,
      username: options.username,
      password: options.password,
      apiVersion: '2',
      strictSSL: true
    });
    
    this.transitionMap = options.transitionMap || {
      'To Do': 'Done',
      'In Progress': 'Done',
      'Code Review': 'Done'
    };
  }
  
  async handleCompletion(taskId, result) {
    if (!result.completed || result.confidence < 0.8) return;
    
    try {
      // Get current issue
      const issue = await this.jira.findIssue(taskId);
      const currentStatus = issue.fields.status.name;
      
      // Check if transition is needed
      const targetStatus = this.transitionMap[currentStatus];
      if (!targetStatus || currentStatus === targetStatus) return;
      
      // Get available transitions
      const transitions = await this.jira.listTransitions(taskId);
      const transition = transitions.transitions.find(t => t.to.name === targetStatus);
      
      if (transition) {
        await this.jira.transitionIssue(taskId, {
          transition: { id: transition.id },
          fields: {},
          update: {
            comment: [{
              add: {
                body: `Automatically marked as complete by FlowForge (${(result.confidence * 100).toFixed(1)}% confidence)\nDetection methods: ${result.detectionMethods.join(', ')}`
              }
            }]
          }
        });
        
        console.log(`✅ Jira issue ${taskId} transitioned to ${targetStatus}`);
      }
      
    } catch (error) {
      console.error(`Failed to update Jira issue ${taskId}:`, error.message);
    }
  }
}
```

### Notion Integration

Integrate with Notion databases:

```javascript
// integrations/NotionCompletionSync.js
const { Client } = require('@notionhq/client');

class NotionCompletionSync {
  constructor(options) {
    this.notion = new Client({ auth: options.token });
    this.databaseId = options.databaseId;
    this.taskIdProperty = options.taskIdProperty || 'Task ID';
    this.statusProperty = options.statusProperty || 'Status';
    this.completionValues = options.completionValues || ['Done', 'Completed'];
  }
  
  async syncCompletion(taskId, result) {
    if (!result.completed || result.confidence < 0.7) return;
    
    try {
      // Find page by task ID
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
        filter: {
          property: this.taskIdProperty,
          number: {
            equals: parseInt(taskId)
          }
        }
      });
      
      if (response.results.length === 0) {
        console.log(`No Notion page found for task ${taskId}`);
        return;
      }
      
      const page = response.results[0];
      
      // Update status to completed
      await this.notion.pages.update({
        page_id: page.id,
        properties: {
          [this.statusProperty]: {
            select: {
              name: this.completionValues[0]
            }
          },
          'Completion Confidence': {
            number: Math.round(result.confidence * 100)
          },
          'Detection Methods': {
            multi_select: result.detectionMethods.map(method => ({ name: method }))
          },
          'Completed At': {
            date: {
              start: new Date().toISOString()
            }
          }
        }
      });
      
      console.log(`✅ Notion page updated for task ${taskId}`);
      
    } catch (error) {
      console.error(`Failed to sync task ${taskId} to Notion:`, error.message);
    }
  }
}
```

## Dashboard Integration

### Team Dashboard Integration

Create a real-time team dashboard showing completion status:

```javascript
// dashboard/CompletionDashboard.js
const express = require('express');
const WebSocket = require('ws');

class CompletionDashboard {
  constructor(detector) {
    this.detector = detector;
    this.app = express();
    this.wss = new WebSocket.Server({ port: 8080 });
    
    this.setupRoutes();
    this.setupWebSocket();
    this.setupDetectorEvents();
  }
  
  setupRoutes() {
    // Dashboard HTML page
    this.app.get('/dashboard', (req, res) => {
      res.sendFile(path.join(__dirname, 'completion-dashboard.html'));
    });
    
    // API endpoints
    this.app.get('/api/completion/status', async (req, res) => {
      const status = await this.getTeamCompletionStatus();
      res.json(status);
    });
    
    this.app.get('/api/completion/metrics', async (req, res) => {
      const metrics = await this.getCompletionMetrics();
      res.json(metrics);
    });
    
    this.app.post('/api/completion/check/:taskId', async (req, res) => {
      const { taskId } = req.params;
      const result = await this.detector.checkCompletion(taskId);
      res.json(result);
    });
  }
  
  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('Dashboard client connected');
      
      // Send current status
      this.sendStatusUpdate(ws);
      
      ws.on('message', async (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'check_task') {
          const result = await this.detector.checkCompletion(data.taskId);
          ws.send(JSON.stringify({
            type: 'task_result',
            taskId: data.taskId,
            result
          }));
        }
      });
    });
  }
  
  setupDetectorEvents() {
    // Listen for completion events
    this.detector.on('completion', (taskId, result) => {
      this.broadcastCompletionUpdate(taskId, result);
    });
  }
  
  broadcastCompletionUpdate(taskId, result) {
    const message = JSON.stringify({
      type: 'completion_update',
      taskId,
      result,
      timestamp: new Date().toISOString()
    });
    
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  async getTeamCompletionStatus() {
    // Load current tasks from FlowForge
    const tasks = await this.loadCurrentTasks();
    const statuses = {};
    
    for (const task of tasks) {
      try {
        const result = await this.detector.checkCompletion(task.id);
        statuses[task.id] = {
          ...task,
          completion: result
        };
      } catch (error) {
        statuses[task.id] = {
          ...task,
          completion: { error: error.message }
        };
      }
    }
    
    return statuses;
  }
}
```

### HTML Dashboard

```html
<!-- dashboard/completion-dashboard.html -->
<!DOCTYPE html>
<html>
<head>
    <title>FlowForge Completion Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .task-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .completed { background-color: #d4edda; border-color: #c3e6cb; }
        .in-progress { background-color: #fff3cd; border-color: #ffeaa7; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .confidence { font-weight: bold; }
        .methods { color: #666; font-size: 0.9em; }
        .real-time { position: fixed; top: 10px; right: 10px; background: #007bff; color: white; padding: 5px 10px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>FlowForge Task Completion Dashboard</h1>
    <div class="real-time" id="status">Connecting...</div>
    
    <div id="tasks"></div>
    
    <script>
        const ws = new WebSocket('ws://localhost:8080');
        const tasksContainer = document.getElementById('tasks');
        const statusDiv = document.getElementById('status');
        
        ws.onopen = () => {
            statusDiv.textContent = 'Connected';
            statusDiv.style.backgroundColor = '#28a745';
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'completion_update') {
                updateTaskCard(data.taskId, data.result);
            }
        };
        
        ws.onclose = () => {
            statusDiv.textContent = 'Disconnected';
            statusDiv.style.backgroundColor = '#dc3545';
        };
        
        function updateTaskCard(taskId, result) {
            let card = document.getElementById(`task-${taskId}`);
            
            if (!card) {
                card = document.createElement('div');
                card.id = `task-${taskId}`;
                card.className = 'task-card';
                tasksContainer.appendChild(card);
            }
            
            const statusClass = result.completed ? 'completed' : 
                               result.error ? 'error' : 'in-progress';
            
            card.className = `task-card ${statusClass}`;
            
            card.innerHTML = `
                <h3>Task #${taskId}</h3>
                <div class="confidence">
                    ${result.completed ? '✅' : '⏳'} 
                    Confidence: ${(result.confidence * 100).toFixed(1)}%
                </div>
                <div class="methods">
                    Detection: ${result.detectionMethods ? result.detectionMethods.join(', ') : 'None'}
                </div>
                ${result.errors && result.errors.length > 0 ? 
                    `<div style="color: red;">Errors: ${result.errors.join(', ')}</div>` : ''}
                <div style="font-size: 0.8em; color: #666;">
                    Last updated: ${new Date().toLocaleTimeString()}
                </div>
            `;
        }
        
        // Load initial data
        fetch('/api/completion/status')
            .then(response => response.json())
            .then(statuses => {
                Object.entries(statuses).forEach(([taskId, data]) => {
                    updateTaskCard(taskId, data.completion);
                });
            });
    </script>
</body>
</html>
```

## CI/CD Integration

### GitHub Actions Integration

```yaml
# .github/workflows/completion-detection.yml
name: Task Completion Detection

on:
  push:
    branches: [main, develop, 'feature/*']
  pull_request:
    types: [closed]
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes

jobs:
  detect-completions:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' || github.event.pull_request.merged == true
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 100  # Need history for detection
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Extract task ID from branch or PR
        id: task-id
        run: |
          if [ "${{ github.event_name }}" == "pull_request" ]; then
            TASK_ID=$(echo "${{ github.head_ref }}" | grep -o '[0-9]\+' | head -1)
          else
            TASK_ID=$(echo "${{ github.ref_name }}" | grep -o '[0-9]\+' | head -1)
          fi
          
          if [ -z "$TASK_ID" ]; then
            TASK_ID=$(git log --format="%s" -1 | grep -o '#[0-9]\+' | cut -d'#' -f2)
          fi
          
          echo "task-id=$TASK_ID" >> $GITHUB_OUTPUT
      
      - name: Run completion detection
        if: steps.task-id.outputs.task-id != ''
        run: |
          node scripts/detect-completion.js ${{ steps.task-id.outputs.task-id }} \
            --aggregate --team-summary --json > detection-result.json
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
      
      - name: Process detection result
        if: steps.task-id.outputs.task-id != ''
        run: |
          COMPLETED=$(jq -r '.completed' detection-result.json)
          CONFIDENCE=$(jq -r '.confidence' detection-result.json)
          
          if [ "$COMPLETED" == "true" ] && (( $(echo "$CONFIDENCE > 0.8" | bc -l) )); then
            echo "Task ${{ steps.task-id.outputs.task-id }} completed with high confidence"
            
            # Create completion comment on PR
            if [ "${{ github.event_name }}" == "pull_request" ]; then
              gh pr comment ${{ github.event.number }} --body \
                "🎯 **Task Completion Detected**
                
                Task #${{ steps.task-id.outputs.task-id }} appears to be completed with ${CONFIDENCE}% confidence.
                
                Detection methods: $(jq -r '.detectionMethods | join(", ")' detection-result.json)
                
                *Automated detection by FlowForge*"
            fi
            
            # Update GitHub issue
            gh issue edit ${{ steps.task-id.outputs.task-id }} \
              --add-label "completed" \
              --body-file <(gh issue view ${{ steps.task-id.outputs.task-id }} --json body | jq -r '.body'; echo -e "\n\n---\n**Completion detected automatically by FlowForge**\nConfidence: ${CONFIDENCE}%")
          fi
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload detection results
        uses: actions/upload-artifact@v3
        with:
          name: completion-detection-results
          path: detection-result.json
          retention-days: 30

  scheduled-check:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run batch completion check
        run: |
          # Get all open issues
          gh issue list --state open --json number --jq '.[].number' | while read task_id; do
            echo "Checking task #$task_id..."
            node scripts/detect-completion.js "$task_id" --aggregate --quiet || true
          done
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Jenkins Integration

```groovy
// Jenkinsfile for completion detection
pipeline {
    agent any
    
    triggers {
        // Run every 30 minutes
        cron('H/30 * * * *')
        
        // Run on SCM changes
        pollSCM('H/5 * * * *')
    }
    
    environment {
        GITHUB_TOKEN = credentials('github-token')
        NOTION_TOKEN = credentials('notion-token')
    }
    
    stages {
        stage('Setup') {
            steps {
                checkout scm
                sh 'npm ci'
            }
        }
        
        stage('Detect Completions') {
            steps {
                script {
                    // Get current task from branch name or environment
                    def taskId = env.BRANCH_NAME?.replaceAll(/.*?(\d+).*/, '$1') ?: env.TASK_ID
                    
                    if (taskId) {
                        echo "Checking completion for task #${taskId}"
                        
                        def result = sh(
                            script: "node scripts/detect-completion.js ${taskId} --json --aggregate",
                            returnStdout: true
                        ).trim()
                        
                        def detection = readJSON text: result
                        
                        if (detection.completed && detection.confidence > 0.8) {
                            echo "✅ Task #${taskId} completed with ${detection.confidence} confidence"
                            
                            // Trigger downstream jobs
                            build job: 'task-completion-workflow', 
                                  parameters: [
                                      string(name: 'TASK_ID', value: taskId),
                                      string(name: 'CONFIDENCE', value: detection.confidence.toString())
                                  ]
                            
                            // Send notifications
                            slackSend(
                                channel: '#dev-updates',
                                color: 'good',
                                message: "Task #${taskId} completed (${Math.round(detection.confidence * 100)}% confidence)"
                            )
                        }
                    }
                }
            }
        }
        
        stage('Archive Results') {
            steps {
                archiveArtifacts artifacts: '.flowforge/detection/logs/*.log', allowEmptyArchive: true
            }
        }
    }
    
    post {
        failure {
            slackSend(
                channel: '#dev-alerts',
                color: 'danger',
                message: "Completion detection failed for ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
}
```

## Troubleshooting Integration Issues

### Common Integration Problems

#### Provider Authentication Issues

```bash
# Test provider connectivity
node scripts/test-provider-auth.js --all

# Test specific provider
node scripts/test-provider-auth.js --provider github
node scripts/test-provider-auth.js --provider notion

# Debug authentication
DEBUG=flowforge:completion:providers node scripts/detect-completion.js 123
```

#### Git Hook Not Triggering

```bash
# Check hook permissions
ls -la .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Test hook manually
.git/hooks/pre-commit

# Check for hook errors
tail -f .flowforge/detection/logs/hook.log
```

#### Aggregation Not Working

```bash
# Check aggregator status
node -e "
const detector = require('./src/core/detection/EnhancedTaskCompletionDetector');
const d = new detector();
console.log(d.getStatus());
"

# Test aggregation manually
node scripts/detect-completion.js 123 --aggregate --verbose

# Check team directory permissions
ls -la .flowforge/team/summaries/
```

### Debug Commands

```bash
# Enable comprehensive debugging
export DEBUG=flowforge:completion*
node scripts/detect-completion.js 123 --verbose

# Test specific integration
node scripts/test-integration.js --component git-hooks
node scripts/test-integration.js --component providers
node scripts/test-integration.js --component aggregation

# Validate configuration
node scripts/validate-integration-config.js
```

---

*This integration guide is part of the FlowForge v2.0 documentation suite. For installation instructions, see the [Installation Guide](../guides/install-completion-detector.md).*