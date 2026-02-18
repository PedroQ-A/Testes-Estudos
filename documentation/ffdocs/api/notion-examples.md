# FlowForge Notion Provider API Examples

## Complete API Usage Examples

This document provides real-world examples of using the FlowForge Notion Provider API for common development workflows.

## Basic Task Operations

### Creating Tasks

#### Simple Task Creation
```typescript
import { NotionProvider } from '@flowforge/providers';

const provider = new NotionProvider(config, logger);
await provider.connect();

const newTask = {
  title: "Implement user authentication",
  description: "Add JWT-based auth with refresh tokens",
  status: "ready",
  priority: "high",
  assignee: "developer@company.com",
  labels: ["backend", "security", "v2.0"],
  estimatedHours: 8
};

const result = await provider.createTask(newTask);
if (result.success) {
  console.log(`Task created: ${result.data.id}`);
  console.log(`Notion URL: https://notion.so/${result.data.id}`);
}
```

#### Bulk Task Creation
```typescript
const tasks = [
  {
    title: "Set up authentication middleware",
    status: "ready",
    priority: "high",
    estimatedHours: 4
  },
  {
    title: "Create user registration endpoint", 
    status: "ready",
    priority: "medium",
    estimatedHours: 6
  },
  {
    title: "Add password validation",
    status: "ready", 
    priority: "medium",
    estimatedHours: 2
  }
];

const createdTasks = [];
for (const taskData of tasks) {
  const result = await provider.createTask(taskData);
  if (result.success) {
    createdTasks.push(result.data);
  }
}

console.log(`Created ${createdTasks.length} tasks`);
```

### Reading Tasks

#### Get Single Task
```typescript
const taskId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const result = await provider.getTask(taskId);

if (result.success) {
  const task = result.data;
  console.log(`Task: ${task.title}`);
  console.log(`Status: ${task.status}`);
  console.log(`Assignee: ${task.assignee}`);
  console.log(`Progress: ${task.actualHours}/${task.estimatedHours} hours`);
}
```

#### List All Tasks
```typescript
const result = await provider.listTasks();

if (result.success) {
  const tasks = result.data;
  
  console.log(`Found ${tasks.length} tasks:`);
  tasks.forEach(task => {
    console.log(`- ${task.title} (${task.status}) - ${task.assignee}`);
  });
}
```

#### Filter Tasks by Status
```typescript
const filter = {
  status: ["in-progress", "blocked"],
  assignee: "current-user@company.com"
};

const result = await provider.listTasks(filter);

if (result.success) {
  console.log("Active tasks for current user:");
  result.data.forEach(task => {
    console.log(`- ${task.title} (${task.status})`);
    if (task.status === "blocked" && task.blockedReason) {
      console.log(`  Blocked: ${task.blockedReason}`);
    }
  });
}
```

#### Search Tasks
```typescript
// Search by title content
const searchResult = await provider.searchTasks("authentication");

if (searchResult.success) {
  console.log("Tasks related to authentication:");
  searchResult.data.forEach(task => {
    console.log(`- ${task.title}`);
  });
}

// Search with additional filtering
const filteredSearch = await provider.searchTasks("bug", {
  priority: "critical",
  status: "ready"
});
```

### Updating Tasks

#### Basic Task Updates
```typescript
const taskId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

// Update status and log time
const updates = {
  status: "in-progress",
  actualHours: 2.5
};

const result = await provider.updateTask(taskId, updates);
if (result.success) {
  console.log("Task updated successfully");
}
```

#### Complete Task Workflow
```typescript
// Start working on a task
async function startTask(taskId: string, user: string) {
  // Update status to in-progress
  await provider.updateTask(taskId, { 
    status: "in-progress",
    assignee: user 
  });
  
  // Start time tracking
  const timeResult = await provider.startTimeTracking(taskId, user, "session-1");
  
  if (timeResult.success) {
    console.log(`Started working on task ${taskId}`);
    return timeResult.data.id; // Session ID
  }
}

// Complete a task
async function completeTask(taskId: string, sessionId: string, hoursSpent: number) {
  // Stop time tracking
  await provider.stopTimeTracking(taskId, sessionId);
  
  // Update task as completed
  const result = await provider.updateTask(taskId, {
    status: "completed",
    actualHours: hoursSpent
  });
  
  if (result.success) {
    console.log(`Task ${taskId} completed!`);
  }
}
```

#### Handle Blocked Tasks
```typescript
async function blockTask(taskId: string, reason: string) {
  const result = await provider.updateTask(taskId, {
    status: "blocked",
    blockedReason: reason
  });
  
  if (result.success) {
    console.log(`Task blocked: ${reason}`);
    
    // Add a comment about the blocker
    await provider.addMicrotask(taskId, {
      description: `BLOCKER: ${reason}`,
      completed: false,
      order: 0
    });
  }
}

// Usage
await blockTask(taskId, "Waiting for API key from DevOps team");
```

## Microtask Management

### Adding and Managing Subtasks

```typescript
async function addSubtasks(taskId: string, subtasks: string[]) {
  const results = [];
  
  for (const [index, description] of subtasks.entries()) {
    const microtask = {
      description,
      completed: false,
      estimatedMinutes: 30,
      order: index
    };
    
    const result = await provider.addMicrotask(taskId, microtask);
    if (result.success) {
      results.push(result.data);
    }
  }
  
  return results;
}

// Add subtasks to a feature task
const taskId = "auth-feature-task-id";
const subtasks = [
  "Research JWT libraries",
  "Set up authentication middleware", 
  "Create login endpoint",
  "Add token validation",
  "Write tests for auth flow",
  "Update documentation"
];

const microtasks = await addSubtasks(taskId, subtasks);
console.log(`Added ${microtasks.length} subtasks`);
```

### Complete Subtasks Progressively

```typescript
async function completeSubtask(taskId: string, microtaskId: string) {
  const result = await provider.updateMicrotask(taskId, microtaskId, {
    completed: true,
    actualMinutes: 25
  });
  
  if (result.success) {
    console.log("Subtask completed!");
    
    // Check if all subtasks are done
    const task = await provider.getTask(taskId);
    if (task.success) {
      const allMicrotasksComplete = task.data.microtasks?.every(m => m.completed);
      
      if (allMicrotasksComplete) {
        console.log("All subtasks complete! Ready to finish main task.");
      }
    }
  }
}
```

## Time Tracking Examples

### Development Session Tracking

```typescript
class DevelopmentSession {
  private provider: NotionProvider;
  private currentSession: string | null = null;
  
  constructor(provider: NotionProvider) {
    this.provider = provider;
  }
  
  async startWorking(taskId: string, user: string) {
    const result = await this.provider.startTimeTracking(
      taskId, 
      user, 
      `session-${Date.now()}`
    );
    
    if (result.success) {
      this.currentSession = result.data.id;
      console.log(`Started working on ${taskId}`);
      
      // Update task status
      await this.provider.updateTask(taskId, { 
        status: "in-progress" 
      });
    }
    
    return this.currentSession;
  }
  
  async takeBreak(taskId: string) {
    if (this.currentSession) {
      const result = await this.provider.stopTimeTracking(taskId, this.currentSession);
      
      if (result.success) {
        console.log(`Break time! Worked for ${result.data.duration} minutes`);
        this.currentSession = null;
      }
    }
  }
  
  async getDailyReport(user: string) {
    const today = new Date();
    const filter = {
      assignee: user,
      updatedAfter: new Date(today.setHours(0, 0, 0, 0))
    };
    
    const tasks = await this.provider.listTasks(filter);
    
    if (tasks.success) {
      let totalHours = 0;
      tasks.data.forEach(task => {
        if (task.actualHours) {
          totalHours += task.actualHours;
        }
      });
      
      console.log(`Today's work: ${totalHours} hours across ${tasks.data.length} tasks`);
    }
  }
}

// Usage
const session = new DevelopmentSession(provider);
await session.startWorking(taskId, "developer@company.com");

// Later...
await session.takeBreak(taskId);
await session.getDailyReport("developer@company.com");
```

## Team Workflow Examples

### Sprint Planning Automation

```typescript
async function createSprintTasks(sprintName: string, userStories: any[]) {
  const createdTasks = [];
  
  for (const story of userStories) {
    const task = {
      title: story.title,
      description: story.acceptanceCriteria,
      status: "ready",
      priority: story.priority,
      estimatedHours: story.storyPoints * 2, // Convert story points to hours
      labels: ["sprint", sprintName, ...story.epics],
      milestone: sprintName
    };
    
    const result = await provider.createTask(task);
    if (result.success) {
      createdTasks.push(result.data);
      
      // Add subtasks for each story
      if (story.tasks) {
        await addSubtasks(result.data.id, story.tasks);
      }
    }
  }
  
  console.log(`Created ${createdTasks.length} tasks for ${sprintName}`);
  return createdTasks;
}

// Sprint planning data
const sprintStories = [
  {
    title: "User can log in with email and password",
    acceptanceCriteria: "Given valid credentials, user should be authenticated",
    priority: "high",
    storyPoints: 5,
    epics: ["authentication"],
    tasks: [
      "Create login form component",
      "Implement authentication API",
      "Add form validation",
      "Write integration tests"
    ]
  },
  // More stories...
];

await createSprintTasks("Sprint 23", sprintStories);
```

### Daily Standup Automation

```typescript
async function generateStandupReport(teamMembers: string[]) {
  const standupData: any = {};
  
  for (const member of teamMembers) {
    // Get yesterday's completed tasks
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const completedTasks = await provider.listTasks({
      assignee: member,
      status: "completed",
      updatedAfter: yesterday
    });
    
    // Get today's planned tasks
    const activeTasks = await provider.listTasks({
      assignee: member,
      status: ["ready", "in-progress"]
    });
    
    // Get any blockers
    const blockedTasks = await provider.listTasks({
      assignee: member,
      status: "blocked"
    });
    
    standupData[member] = {
      completed: completedTasks.success ? completedTasks.data : [],
      planned: activeTasks.success ? activeTasks.data.slice(0, 3) : [], // Top 3
      blockers: blockedTasks.success ? blockedTasks.data : []
    };
  }
  
  // Generate standup report
  console.log("📅 Daily Standup Report");
  console.log("======================");
  
  for (const [member, data] of Object.entries(standupData)) {
    console.log(`\n👤 ${member}`);
    console.log(`✅ Completed (${data.completed.length}):`);
    data.completed.forEach((task: any) => {
      console.log(`   - ${task.title}`);
    });
    
    console.log(`📋 Today's Plan (${data.planned.length}):`);
    data.planned.forEach((task: any) => {
      console.log(`   - ${task.title} (${task.status})`);
    });
    
    if (data.blockers.length > 0) {
      console.log(`🚫 Blockers (${data.blockers.length}):`);
      data.blockers.forEach((task: any) => {
        console.log(`   - ${task.title}: ${task.blockedReason}`);
      });
    }
  }
}

// Run standup report
const team = [
  "alice@company.com",
  "bob@company.com", 
  "charlie@company.com"
];

await generateStandupReport(team);
```

## Advanced Integration Examples

### GitHub Integration Sync

```typescript
async function syncWithGitHub(provider: NotionProvider, githubIssue: any) {
  // Check if task already exists
  const existingTasks = await provider.searchTasks(`#${githubIssue.number}`);
  
  if (existingTasks.success && existingTasks.data.length > 0) {
    // Update existing task
    const task = existingTasks.data[0];
    const updates = {
      status: mapGitHubStatusToFlowForge(githubIssue.state),
      labels: githubIssue.labels.map((l: any) => l.name),
      assignee: githubIssue.assignee?.email
    };
    
    await provider.updateTask(task.id, updates);
    console.log(`Updated task ${task.id} from GitHub issue #${githubIssue.number}`);
  } else {
    // Create new task
    const newTask = {
      title: `${githubIssue.title} (#${githubIssue.number})`,
      description: githubIssue.body,
      status: mapGitHubStatusToFlowForge(githubIssue.state),
      priority: determineGitHubPriority(githubIssue.labels),
      labels: githubIssue.labels.map((l: any) => l.name),
      assignee: githubIssue.assignee?.email,
      githubUrl: githubIssue.html_url,
      issueNumber: githubIssue.number.toString()
    };
    
    const result = await provider.createTask(newTask);
    if (result.success) {
      console.log(`Created task ${result.data.id} from GitHub issue #${githubIssue.number}`);
    }
  }
}

function mapGitHubStatusToFlowForge(githubState: string): string {
  switch (githubState) {
    case "open": return "ready";
    case "closed": return "completed";
    default: return "ready";
  }
}

function determineGitHubPriority(labels: any[]): string {
  const priorityLabels = labels.map(l => l.name.toLowerCase());
  
  if (priorityLabels.includes("critical") || priorityLabels.includes("urgent")) {
    return "critical";
  } else if (priorityLabels.includes("high") || priorityLabels.includes("important")) {
    return "high";
  } else if (priorityLabels.includes("low")) {
    return "low";
  }
  
  return "medium";
}
```

### Automated Task Dependencies

```typescript
async function createTaskWithDependencies(
  provider: NotionProvider,
  mainTask: any,
  dependencies: string[]
) {
  // Create the main task
  const mainResult = await provider.createTask(mainTask);
  
  if (!mainResult.success) {
    throw new Error("Failed to create main task");
  }
  
  const mainTaskId = mainResult.data.id;
  
  // Add dependency information as microtasks
  for (const dep of dependencies) {
    await provider.addMicrotask(mainTaskId, {
      description: `Dependency: ${dep}`,
      completed: false,
      order: -1 // Put dependencies at the top
    });
  }
  
  // Set main task as blocked initially
  await provider.updateTask(mainTaskId, {
    status: "blocked",
    blockedReason: "Waiting for dependencies to complete"
  });
  
  console.log(`Created task ${mainTaskId} with ${dependencies.length} dependencies`);
  return mainTaskId;
}

async function checkAndUnblockTask(provider: NotionProvider, taskId: string) {
  const task = await provider.getTask(taskId);
  
  if (task.success && task.data.status === "blocked") {
    // Check if all dependency microtasks are complete
    const dependencyMicrotasks = task.data.microtasks?.filter(m => 
      m.description.startsWith("Dependency:")
    ) || [];
    
    const allDepsComplete = dependencyMicrotasks.every(m => m.completed);
    
    if (allDepsComplete) {
      await provider.updateTask(taskId, {
        status: "ready",
        blockedReason: undefined
      });
      
      console.log(`Task ${taskId} unblocked - all dependencies complete!`);
    }
  }
}

// Usage
const mainTask = {
  title: "Deploy authentication system",
  description: "Final deployment of auth system to production",
  priority: "critical"
};

const dependencies = [
  "Complete authentication API testing",
  "Security review approval", 
  "Database migration scripts ready",
  "Load testing completed"
];

const taskId = await createTaskWithDependencies(provider, mainTask, dependencies);

// Later, when checking dependencies
await checkAndUnblockTask(provider, taskId);
```

## Error Handling Patterns

### Robust Task Operations

```typescript
async function robustTaskOperation<T>(
  operation: () => Promise<AsyncResult<T>>,
  maxRetries: number = 3,
  backoffMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await operation();
      
      if (result.success) {
        return result.data;
      }
      
      lastError = result.error!;
      
      // Handle specific error types
      if (result.error?.message.includes("rate_limited")) {
        console.warn(`Rate limited, waiting ${backoffMs * (attempt + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs * (attempt + 1)));
        continue;
      }
      
      // For other errors, throw immediately
      throw result.error;
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt + 1} failed: ${error}`);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }
  
  throw lastError!;
}

// Usage
const newTask = await robustTaskOperation(async () => {
  return provider.createTask({
    title: "Important task",
    status: "ready",
    priority: "high"
  });
});

console.log(`Successfully created task: ${newTask.id}`);
```

### Connection Management

```typescript
class NotionProviderManager {
  private provider: NotionProvider;
  private isConnected: boolean = false;
  
  constructor(config: NotionProviderConfig, logger: Logger) {
    this.provider = new NotionProvider(config, logger);
  }
  
  async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      const result = await this.provider.connect();
      if (!result.success) {
        throw new Error(`Failed to connect to Notion: ${result.error?.message}`);
      }
      this.isConnected = true;
    }
    
    // Verify connection is still active
    const available = await this.provider.isAvailable();
    if (!available) {
      this.isConnected = false;
      await this.ensureConnected(); // Retry connection
    }
  }
  
  async safeOperation<T>(operation: () => Promise<AsyncResult<T>>): Promise<T> {
    await this.ensureConnected();
    
    const result = await operation();
    if (!result.success) {
      throw new Error(result.error?.message || "Operation failed");
    }
    
    return result.data;
  }
  
  async createTask(task: any): Promise<Task> {
    return this.safeOperation(() => this.provider.createTask(task));
  }
  
  async updateTask(id: string, updates: any): Promise<Task> {
    return this.safeOperation(() => this.provider.updateTask(id, updates));
  }
  
  // Add other methods as needed...
}

// Usage
const manager = new NotionProviderManager(config, logger);

try {
  const task = await manager.createTask({
    title: "Test task",
    status: "ready"
  });
  
  console.log("Task created successfully:", task.id);
} catch (error) {
  console.error("Failed to create task:", error.message);
}
```

## Performance Optimization

### Batch Operations

```typescript
async function batchCreateTasks(
  provider: NotionProvider,
  tasks: any[],
  batchSize: number = 5
): Promise<Task[]> {
  const results: Task[] = [];
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchPromises = batch.map(task => provider.createTask(task));
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Process results
    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value.success) {
        results.push(result.value.data);
      } else {
        console.error("Failed to create task:", result);
      }
    }
    
    // Rate limiting: wait between batches
    if (i + batchSize < tasks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// Create 50 tasks efficiently
const tasksToCreate = Array(50).fill(null).map((_, i) => ({
  title: `Task ${i + 1}`,
  status: "ready",
  priority: "medium"
}));

const createdTasks = await batchCreateTasks(provider, tasksToCreate);
console.log(`Successfully created ${createdTasks.length} tasks`);
```

This comprehensive set of examples covers most real-world usage patterns for the FlowForge Notion Provider. Each example is production-ready and includes proper error handling, performance considerations, and best practices.