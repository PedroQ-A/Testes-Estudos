# FlowForge v2.0 Provider Abstraction Architecture

## Executive Summary

**Critical Issue**: FlowForge v2.0 hardcodes task management to specific implementations, preventing flexible backends and limiting scalability across different project management systems.

**Solution**: Implement a comprehensive Provider Abstraction Layer that enables FlowForge to work seamlessly with JSON files, GitHub Issues, Notion databases, Jira, and other task management systems through a unified interface.

## Current State Analysis

### Task Management Limitations
```javascript
// Current hardcoded approach
const currentImplementation = {
    taskStorage: 'TASKS.md file only',
    issueTracking: 'GitHub Issues (manual)',
    projectManagement: 'Local files only',
    synchronization: 'None',
    scalability: 'Single project only',
    flexibility: 'Zero - hardcoded paths'
};

// Problems identified:
const problems = [
    'Cannot work with enterprise Jira systems',
    'No synchronization between GitHub and local tasks',
    'Manual task creation and updates',
    'No support for Notion or other modern tools',
    'Limited to single project contexts',
    'No offline/online hybrid support'
];
```

### Integration Complexity Assessment
```
Current State:
┌─────────────────┐
│  FlowForge      │
│     ↓           │
│ Hardcoded TASKS │ ← Single point of failure
│     .md         │
└─────────────────┘

Target State:
┌─────────────────┐
│  FlowForge      │
│     ↓           │
│ Provider Layer  │ ← Abstraction interface
│     ↓           │
├─────┬─────┬─────┤
│JSON │GitHub│Notion│ ← Multiple backends
└─────┴─────┴─────┘
```

## Provider Abstraction Architecture

### 1. Core Provider Interface

```typescript
// File: .flowforge/core/providers/base-provider.ts
// Universal provider interface for all task management systems

interface TaskProvider {
  // Provider metadata
  readonly name: string;
  readonly version: string;
  readonly capabilities: ProviderCapabilities;
  
  // Connection management
  connect(config: ProviderConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  healthCheck(): Promise<HealthStatus>;
  
  // Task operations
  getTasks(filter?: TaskFilter): Promise<Task[]>;
  getTask(id: string): Promise<Task>;
  createTask(task: CreateTaskRequest): Promise<Task>;
  updateTask(id: string, updates: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project>;
  createProject(project: CreateProjectRequest): Promise<Project>;
  
  // Time tracking
  startTimer(taskId: string): Promise<Timer>;
  stopTimer(timerId: string): Promise<TimeEntry>;
  getTimeEntries(filter?: TimeFilter): Promise<TimeEntry[]>;
  
  // Synchronization
  sync(): Promise<SyncResult>;
  getLastSync(): Promise<Date>;
  
  // Search and filtering
  search(query: string): Promise<Task[]>;
  filter(criteria: FilterCriteria): Promise<Task[]>;
  
  // Batch operations
  bulkCreate(tasks: CreateTaskRequest[]): Promise<Task[]>;
  bulkUpdate(updates: BulkUpdateRequest[]): Promise<Task[]>;
  
  // Provider-specific features
  getProviderSpecificFeatures(): Record<string, any>;
  executeProviderAction(action: string, params: any): Promise<any>;
}

interface ProviderCapabilities {
  // Core features
  tasks: boolean;
  projects: boolean;
  timeTracking: boolean;
  comments: boolean;
  attachments: boolean;
  
  // Advanced features
  realTimeSync: boolean;
  offlineSupport: boolean;
  bulkOperations: boolean;
  customFields: boolean;
  webhooks: boolean;
  
  // Integration features
  gitIntegration: boolean;
  slackIntegration: boolean;
  emailNotifications: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  project?: string;
  labels: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  dependencies: string[];
  subtasks: string[];
  customFields: Record<string, any>;
  providerSpecific: Record<string, any>;
}

type TaskStatus = 'open' | 'in_progress' | 'review' | 'done' | 'blocked';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
```

### 2. JSON File Provider Implementation

```typescript
// File: .flowforge/core/providers/json-provider.ts
// Local JSON file-based task management

class JsonProvider implements TaskProvider {
  readonly name = 'json';
  readonly version = '1.0.0';
  readonly capabilities: ProviderCapabilities = {
    tasks: true,
    projects: true,
    timeTracking: true,
    comments: false,
    attachments: false,
    realTimeSync: false,
    offlineSupport: true,
    bulkOperations: true,
    customFields: true,
    webhooks: false,
    gitIntegration: true,
    slackIntegration: false,
    emailNotifications: false
  };
  
  private dataFile: string;
  private data: JsonProviderData;
  private connected: boolean = false;
  
  constructor(config: JsonProviderConfig) {
    this.dataFile = config.dataFile || '.flowforge/data/tasks.json';
  }
  
  async connect(config: ProviderConfig): Promise<void> {
    try {
      await this.loadData();
      this.connected = true;
    } catch (error) {
      throw new ProviderError(`Failed to connect to JSON provider: ${error.message}`);
    }
  }
  
  async disconnect(): Promise<void> {
    await this.saveData();
    this.connected = false;
  }
  
  isConnected(): boolean {
    return this.connected;
  }
  
  async healthCheck(): Promise<HealthStatus> {
    try {
      const stats = await fs.stat(this.dataFile);
      return {
        status: 'healthy',
        lastModified: stats.mtime,
        size: stats.size,
        readable: true,
        writable: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
  
  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    this.ensureConnected();
    
    let tasks = this.data.tasks;
    
    if (filter) {
      tasks = this.applyFilter(tasks, filter);
    }
    
    return tasks.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  
  async createTask(task: CreateTaskRequest): Promise<Task> {
    this.ensureConnected();
    
    const newTask: Task = {
      id: this.generateId(),
      title: task.title,
      description: task.description || '',
      status: task.status || 'open',
      priority: task.priority || 'medium',
      assignee: task.assignee,
      project: task.project,
      labels: task.labels || [],
      estimatedHours: task.estimatedHours,
      actualHours: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: task.dueDate,
      dependencies: task.dependencies || [],
      subtasks: [],
      customFields: task.customFields || {},
      providerSpecific: {}
    };
    
    this.data.tasks.push(newTask);
    await this.saveData();
    
    return newTask;
  }
  
  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    this.ensureConnected();
    
    const taskIndex = this.data.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new TaskNotFoundError(`Task ${id} not found`);
    }
    
    const task = this.data.tasks[taskIndex];
    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date()
    };
    
    this.data.tasks[taskIndex] = updatedTask;
    await this.saveData();
    
    return updatedTask;
  }
  
  async startTimer(taskId: string): Promise<Timer> {
    this.ensureConnected();
    
    const task = await this.getTask(taskId);
    if (!task) {
      throw new TaskNotFoundError(`Task ${taskId} not found`);
    }
    
    const timer: Timer = {
      id: this.generateId(),
      taskId,
      startTime: new Date(),
      active: true
    };
    
    this.data.timers = this.data.timers || [];
    this.data.timers.push(timer);
    await this.saveData();
    
    return timer;
  }
  
  async sync(): Promise<SyncResult> {
    // For JSON provider, sync means save to disk and reload
    await this.saveData();
    await this.loadData();
    
    return {
      status: 'success',
      timestamp: new Date(),
      changes: 0,
      conflicts: 0
    };
  }
  
  private async loadData(): Promise<void> {
    try {
      const content = await fs.readFile(this.dataFile, 'utf8');
      this.data = JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create empty data
        this.data = {
          tasks: [],
          projects: [],
          timers: [],
          metadata: {
            version: '1.0.0',
            created: new Date(),
            lastModified: new Date()
          }
        };
        await this.saveData();
      } else {
        throw error;
      }
    }
  }
  
  private async saveData(): Promise<void> {
    this.data.metadata.lastModified = new Date();
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
    
    // Write with backup
    const backupFile = `${this.dataFile}.backup`;
    if (await this.fileExists(this.dataFile)) {
      await fs.copyFile(this.dataFile, backupFile);
    }
    
    await fs.writeFile(this.dataFile, JSON.stringify(this.data, null, 2));
  }
  
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private ensureConnected(): void {
    if (!this.connected) {
      throw new ProviderError('Provider not connected');
    }
  }
}
```

### 3. GitHub Issues Provider Implementation

```typescript
// File: .flowforge/core/providers/github-provider.ts
// GitHub Issues integration with full API support

class GitHubProvider implements TaskProvider {
  readonly name = 'github';
  readonly version = '1.0.0';
  readonly capabilities: ProviderCapabilities = {
    tasks: true,
    projects: true,
    timeTracking: false, // External via other tools
    comments: true,
    attachments: true,
    realTimeSync: true,
    offlineSupport: false,
    bulkOperations: true,
    customFields: true, // Via labels and metadata
    webhooks: true,
    gitIntegration: true,
    slackIntegration: true,
    emailNotifications: true
  };
  
  private client: Octokit;
  private owner: string;
  private repo: string;
  private connected: boolean = false;
  
  constructor(config: GitHubProviderConfig) {
    this.owner = config.owner;
    this.repo = config.repo;
  }
  
  async connect(config: ProviderConfig): Promise<void> {
    const githubConfig = config as GitHubProviderConfig;
    
    this.client = new Octokit({
      auth: githubConfig.token,
      userAgent: 'FlowForge/2.0.0'
    });
    
    // Test connection
    try {
      await this.client.rest.repos.get({
        owner: this.owner,
        repo: this.repo
      });
      this.connected = true;
    } catch (error) {
      throw new ProviderError(`Failed to connect to GitHub: ${error.message}`);
    }
  }
  
  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    this.ensureConnected();
    
    const params: any = {
      owner: this.owner,
      repo: this.repo,
      per_page: 100
    };
    
    if (filter) {
      if (filter.status) {
        params.state = this.mapStatusToGitHub(filter.status);
      }
      if (filter.assignee) {
        params.assignee = filter.assignee;
      }
      if (filter.labels) {
        params.labels = filter.labels.join(',');
      }
    }
    
    const response = await this.client.rest.issues.listForRepo(params);
    
    return response.data.map(issue => this.mapGitHubIssueToTask(issue));
  }
  
  async createTask(task: CreateTaskRequest): Promise<Task> {
    this.ensureConnected();
    
    const body = this.formatTaskDescription(task);
    const labels = this.formatLabels(task);
    
    const response = await this.client.rest.issues.create({
      owner: this.owner,
      repo: this.repo,
      title: task.title,
      body,
      labels,
      assignees: task.assignee ? [task.assignee] : undefined
    });
    
    return this.mapGitHubIssueToTask(response.data);
  }
  
  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    this.ensureConnected();
    
    const issueNumber = parseInt(id);
    
    const updateData: any = {
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber
    };
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.body = updates.description;
    if (updates.status) updateData.state = this.mapStatusToGitHub(updates.status);
    if (updates.assignee) updateData.assignees = [updates.assignee];
    if (updates.labels) updateData.labels = updates.labels;
    
    const response = await this.client.rest.issues.update(updateData);
    
    return this.mapGitHubIssueToTask(response.data);
  }
  
  async sync(): Promise<SyncResult> {
    // For GitHub, sync means fetching latest state
    const tasks = await this.getTasks();
    
    return {
      status: 'success',
      timestamp: new Date(),
      changes: tasks.length,
      conflicts: 0
    };
  }
  
  async search(query: string): Promise<Task[]> {
    this.ensureConnected();
    
    const response = await this.client.rest.search.issuesAndPullRequests({
      q: `${query} repo:${this.owner}/${this.repo} type:issue`
    });
    
    return response.data.items.map(issue => this.mapGitHubIssueToTask(issue));
  }
  
  // GitHub-specific methods
  async addComment(taskId: string, comment: string): Promise<void> {
    this.ensureConnected();
    
    await this.client.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: parseInt(taskId),
      body: comment
    });
  }
  
  async addLabel(taskId: string, labels: string[]): Promise<void> {
    this.ensureConnected();
    
    await this.client.rest.issues.addLabels({
      owner: this.owner,
      repo: this.repo,
      issue_number: parseInt(taskId),
      labels
    });
  }
  
  private mapGitHubIssueToTask(issue: any): Task {
    return {
      id: issue.number.toString(),
      title: issue.title,
      description: issue.body || '',
      status: this.mapGitHubStatusToTask(issue.state),
      priority: this.extractPriorityFromLabels(issue.labels),
      assignee: issue.assignee?.login,
      project: this.extractProjectFromLabels(issue.labels),
      labels: issue.labels.map((l: any) => l.name),
      estimatedHours: this.extractEstimatedHours(issue.body),
      actualHours: 0, // Would need to be tracked separately
      createdAt: new Date(issue.created_at),
      updatedAt: new Date(issue.updated_at),
      dueDate: this.extractDueDate(issue.body),
      dependencies: this.extractDependencies(issue.body),
      subtasks: [],
      customFields: {},
      providerSpecific: {
        url: issue.html_url,
        number: issue.number,
        state: issue.state,
        comments: issue.comments,
        locked: issue.locked
      }
    };
  }
  
  private formatTaskDescription(task: CreateTaskRequest): string {
    let body = task.description || '';
    
    // Add FlowForge metadata
    body += '\n\n---\n**FlowForge Metadata:**\n';
    
    if (task.estimatedHours) {
      body += `- Estimated Hours: ${task.estimatedHours}\n`;
    }
    
    if (task.priority) {
      body += `- Priority: ${task.priority}\n`;
    }
    
    if (task.dueDate) {
      body += `- Due Date: ${task.dueDate.toISOString().split('T')[0]}\n`;
    }
    
    if (task.dependencies && task.dependencies.length > 0) {
      body += `- Dependencies: ${task.dependencies.join(', ')}\n`;
    }
    
    return body;
  }
  
  private formatLabels(task: CreateTaskRequest): string[] {
    const labels = [...(task.labels || [])];
    
    // Add priority label
    if (task.priority) {
      labels.push(`priority:${task.priority}`);
    }
    
    // Add FlowForge label
    labels.push('flowforge');
    
    // Add status label
    if (task.status) {
      labels.push(`status:${task.status}`);
    }
    
    return labels;
  }
  
  private ensureConnected(): void {
    if (!this.connected) {
      throw new ProviderError('GitHub provider not connected');
    }
  }
}
```

### 4. Notion Provider Implementation

```typescript
// File: .flowforge/core/providers/notion-provider.ts
// Notion database integration for modern project management

class NotionProvider implements TaskProvider {
  readonly name = 'notion';
  readonly version = '1.0.0';
  readonly capabilities: ProviderCapabilities = {
    tasks: true,
    projects: true,
    timeTracking: true,
    comments: true,
    attachments: true,
    realTimeSync: true,
    offlineSupport: false,
    bulkOperations: true,
    customFields: true,
    webhooks: true,
    gitIntegration: false,
    slackIntegration: true,
    emailNotifications: true
  };
  
  private client: Client;
  private databaseId: string;
  private connected: boolean = false;
  
  constructor(config: NotionProviderConfig) {
    this.databaseId = config.databaseId;
  }
  
  async connect(config: ProviderConfig): Promise<void> {
    const notionConfig = config as NotionProviderConfig;
    
    this.client = new Client({
      auth: notionConfig.token
    });
    
    // Test connection
    try {
      await this.client.databases.retrieve({
        database_id: this.databaseId
      });
      this.connected = true;
    } catch (error) {
      throw new ProviderError(`Failed to connect to Notion: ${error.message}`);
    }
  }
  
  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    this.ensureConnected();
    
    const query: any = {
      database_id: this.databaseId,
      sorts: [
        {
          property: 'Updated',
          direction: 'descending'
        }
      ]
    };
    
    if (filter) {
      query.filter = this.buildNotionFilter(filter);
    }
    
    const response = await this.client.databases.query(query);
    
    return response.results.map(page => this.mapNotionPageToTask(page));
  }
  
  async createTask(task: CreateTaskRequest): Promise<Task> {
    this.ensureConnected();
    
    const properties = this.buildNotionProperties(task);
    
    const response = await this.client.pages.create({
      parent: {
        database_id: this.databaseId
      },
      properties
    });
    
    return this.mapNotionPageToTask(response);
  }
  
  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    this.ensureConnected();
    
    const properties = this.buildNotionProperties(updates);
    
    const response = await this.client.pages.update({
      page_id: id,
      properties
    });
    
    return this.mapNotionPageToTask(response);
  }
  
  private buildNotionProperties(data: CreateTaskRequest | UpdateTaskRequest): any {
    const properties: any = {};
    
    if (data.title) {
      properties.Title = {
        title: [
          {
            text: {
              content: data.title
            }
          }
        ]
      };
    }
    
    if (data.status) {
      properties.Status = {
        select: {
          name: this.mapStatusToNotion(data.status)
        }
      };
    }
    
    if (data.priority) {
      properties.Priority = {
        select: {
          name: data.priority
        }
      };
    }
    
    if (data.assignee) {
      properties.Assignee = {
        people: [
          {
            id: data.assignee // Notion user ID
          }
        ]
      };
    }
    
    if (data.estimatedHours) {
      properties['Estimated Hours'] = {
        number: data.estimatedHours
      };
    }
    
    if (data.dueDate) {
      properties['Due Date'] = {
        date: {
          start: data.dueDate.toISOString().split('T')[0]
        }
      };
    }
    
    if (data.labels && data.labels.length > 0) {
      properties.Labels = {
        multi_select: data.labels.map(label => ({ name: label }))
      };
    }
    
    return properties;
  }
  
  private mapNotionPageToTask(page: any): Task {
    const props = page.properties;
    
    return {
      id: page.id,
      title: this.extractTitle(props.Title),
      description: '', // Would need to fetch page content
      status: this.mapNotionStatusToTask(props.Status?.select?.name),
      priority: props.Priority?.select?.name as TaskPriority || 'medium',
      assignee: props.Assignee?.people?.[0]?.id,
      project: props.Project?.select?.name,
      labels: props.Labels?.multi_select?.map((l: any) => l.name) || [],
      estimatedHours: props['Estimated Hours']?.number,
      actualHours: props['Actual Hours']?.number || 0,
      createdAt: new Date(page.created_time),
      updatedAt: new Date(page.last_edited_time),
      dueDate: props['Due Date']?.date?.start ? new Date(props['Due Date'].date.start) : undefined,
      dependencies: [],
      subtasks: [],
      customFields: this.extractCustomFields(props),
      providerSpecific: {
        url: page.url,
        archived: page.archived,
        icon: page.icon,
        cover: page.cover
      }
    };
  }
  
  private ensureConnected(): void {
    if (!this.connected) {
      throw new ProviderError('Notion provider not connected');
    }
  }
}
```

### 5. Provider Registry & Factory

```typescript
// File: .flowforge/core/providers/provider-registry.ts
// Central registry for all task providers

class ProviderRegistry {
  private providers = new Map<string, typeof TaskProvider>();
  private instances = new Map<string, TaskProvider>();
  
  constructor() {
    this.registerDefaultProviders();
  }
  
  private registerDefaultProviders(): void {
    this.register('json', JsonProvider);
    this.register('github', GitHubProvider);
    this.register('notion', NotionProvider);
    this.register('jira', JiraProvider); // Future implementation
    this.register('linear', LinearProvider); // Future implementation
    this.register('trello', TrelloProvider); // Future implementation
  }
  
  register(name: string, providerClass: typeof TaskProvider): void {
    this.providers.set(name, providerClass);
  }
  
  async createProvider(name: string, config: ProviderConfig): Promise<TaskProvider> {
    const ProviderClass = this.providers.get(name);
    
    if (!ProviderClass) {
      throw new ProviderNotFoundError(`Provider '${name}' not found`);
    }
    
    const provider = new ProviderClass(config);
    await provider.connect(config);
    
    this.instances.set(name, provider);
    
    return provider;
  }
  
  getProvider(name: string): TaskProvider | undefined {
    return this.instances.get(name);
  }
  
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
  
  async disconnectAll(): Promise<void> {
    for (const provider of this.instances.values()) {
      await provider.disconnect();
    }
    this.instances.clear();
  }
}

// Factory for creating providers based on configuration
class ProviderFactory {
  private registry = new ProviderRegistry();
  
  async createFromConfig(config: FlowForgeConfig): Promise<TaskProvider[]> {
    const providers: TaskProvider[] = [];
    
    for (const providerConfig of config.providers) {
      const provider = await this.registry.createProvider(
        providerConfig.type,
        providerConfig.config
      );
      providers.push(provider);
    }
    
    return providers;
  }
  
  async createDefault(): Promise<TaskProvider> {
    // Default to JSON provider for local development
    return await this.registry.createProvider('json', {
      dataFile: '.flowforge/data/tasks.json'
    });
  }
  
  getRegistry(): ProviderRegistry {
    return this.registry;
  }
}
```

### 6. Provider Manager & Orchestration

```typescript
// File: .flowforge/core/providers/provider-manager.ts
// Manages multiple providers and synchronization

class ProviderManager {
  private providers: TaskProvider[] = [];
  private primaryProvider: TaskProvider;
  private syncEnabled: boolean = true;
  private syncInterval: number = 300000; // 5 minutes
  private syncTimer?: NodeJS.Timeout;
  
  constructor(providers: TaskProvider[], primaryProvider?: TaskProvider) {
    this.providers = providers;
    this.primaryProvider = primaryProvider || providers[0];
    
    if (!this.primaryProvider) {
      throw new Error('At least one provider is required');
    }
  }
  
  // Unified task operations that work across all providers
  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    const allTasks: Task[] = [];
    
    for (const provider of this.providers) {
      try {
        const tasks = await provider.getTasks(filter);
        allTasks.push(...tasks);
      } catch (error) {
        console.warn(`Failed to get tasks from ${provider.name}:`, error.message);
      }
    }
    
    // Deduplicate tasks based on title and description similarity
    return this.deduplicateTasks(allTasks);
  }
  
  async createTask(task: CreateTaskRequest): Promise<Task> {
    // Create in primary provider first
    const primaryTask = await this.primaryProvider.createTask(task);
    
    // Sync to other providers if enabled
    if (this.syncEnabled) {
      await this.syncTaskToProviders(primaryTask);
    }
    
    return primaryTask;
  }
  
  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    // Find which provider has this task
    const provider = await this.findProviderForTask(id);
    
    if (!provider) {
      throw new TaskNotFoundError(`Task ${id} not found in any provider`);
    }
    
    const updatedTask = await provider.updateTask(id, updates);
    
    // Sync to other providers
    if (this.syncEnabled) {
      await this.syncTaskToProviders(updatedTask);
    }
    
    return updatedTask;
  }
  
  async startTimer(taskId: string): Promise<Timer> {
    // Find provider that supports time tracking
    const provider = this.providers.find(p => p.capabilities.timeTracking);
    
    if (!provider) {
      throw new ProviderError('No provider supports time tracking');
    }
    
    return await provider.startTimer(taskId);
  }
  
  async syncAll(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    
    for (const provider of this.providers) {
      try {
        const result = await provider.sync();
        results.push(result);
      } catch (error) {
        results.push({
          status: 'error',
          timestamp: new Date(),
          changes: 0,
          conflicts: 0,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  // Cross-provider synchronization
  async syncTaskToProviders(task: Task): Promise<void> {
    for (const provider of this.providers) {
      if (provider === this.primaryProvider) continue;
      
      try {
        // Check if task exists in this provider
        const existingTask = await this.findTaskInProvider(provider, task);
        
        if (existingTask) {
          // Update existing task
          await provider.updateTask(existingTask.id, {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignee: task.assignee,
            labels: task.labels
          });
        } else if (provider.capabilities.tasks) {
          // Create new task
          await provider.createTask({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignee: task.assignee,
            labels: task.labels,
            estimatedHours: task.estimatedHours,
            dueDate: task.dueDate
          });
        }
      } catch (error) {
        console.warn(`Failed to sync task to ${provider.name}:`, error.message);
      }
    }
  }
  
  // Smart task deduplication
  private deduplicateTasks(tasks: Task[]): Task[] {
    const deduplicated: Task[] = [];
    const seen = new Set<string>();
    
    for (const task of tasks) {
      // Create a hash based on title and description
      const hash = this.createTaskHash(task);
      
      if (!seen.has(hash)) {
        seen.add(hash);
        deduplicated.push(task);
      } else {
        // Merge data from duplicate task
        const existing = deduplicated.find(t => this.createTaskHash(t) === hash);
        if (existing) {
          this.mergeTaskData(existing, task);
        }
      }
    }
    
    return deduplicated;
  }
  
  private createTaskHash(task: Task): string {
    return `${task.title}_${task.description}`.toLowerCase().replace(/\s+/g, '');
  }
  
  private async findProviderForTask(taskId: string): Promise<TaskProvider | null> {
    for (const provider of this.providers) {
      try {
        await provider.getTask(taskId);
        return provider;
      } catch (error) {
        // Task not found in this provider, continue searching
      }
    }
    return null;
  }
  
  startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(async () => {
      try {
        await this.syncAll();
      } catch (error) {
        console.error('Auto-sync failed:', error.message);
      }
    }, this.syncInterval);
  }
  
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }
}
```

### 7. FlowForge Integration Layer

```typescript
// File: .flowforge/core/task-service.ts
// Main service that abstracts provider complexity from FlowForge commands

class FlowForgeTaskService {
  private providerManager: ProviderManager;
  private config: FlowForgeConfig;
  
  constructor(config: FlowForgeConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<void> {
    const factory = new ProviderFactory();
    const providers = await factory.createFromConfig(this.config);
    
    this.providerManager = new ProviderManager(providers);
    this.providerManager.startAutoSync();
  }
  
  // High-level task operations used by FlowForge commands
  async getCurrentTasks(): Promise<Task[]> {
    return await this.providerManager.getTasks({
      status: ['open', 'in_progress']
    });
  }
  
  async createTaskFromIssue(issueNumber: number): Promise<Task> {
    // Logic to create task from GitHub issue or other source
    const issueData = await this.fetchIssueData(issueNumber);
    
    return await this.providerManager.createTask({
      title: issueData.title,
      description: issueData.description,
      status: 'open',
      priority: this.mapIssuePriority(issueData.labels),
      labels: issueData.labels
    });
  }
  
  async startWorkSession(taskId: string): Promise<{ task: Task; timer: Timer }> {
    // Update task status to in_progress
    const task = await this.providerManager.updateTask(taskId, {
      status: 'in_progress'
    });
    
    // Start timer if time tracking is available
    let timer;
    try {
      timer = await this.providerManager.startTimer(taskId);
    } catch (error) {
      console.warn('Time tracking not available:', error.message);
    }
    
    return { task, timer };
  }
  
  async completeTask(taskId: string): Promise<Task> {
    return await this.providerManager.updateTask(taskId, {
      status: 'done',
      actualHours: await this.calculateActualHours(taskId)
    });
  }
  
  async getTasksByProject(project: string): Promise<Task[]> {
    return await this.providerManager.getTasks({
      project
    });
  }
  
  async syncWithRemote(): Promise<SyncResult[]> {
    return await this.providerManager.syncAll();
  }
  
  private async calculateActualHours(taskId: string): Promise<number> {
    // Calculate based on time entries
    // Implementation depends on time tracking provider
    return 0;
  }
  
  private async fetchIssueData(issueNumber: number): Promise<any> {
    // Fetch from GitHub or other issue tracker
    // Implementation depends on Git provider
    return {};
  }
  
  private mapIssuePriority(labels: string[]): TaskPriority {
    if (labels.includes('priority:urgent')) return 'urgent';
    if (labels.includes('priority:high')) return 'high';
    if (labels.includes('priority:low')) return 'low';
    return 'medium';
  }
}
```

### 8. Configuration System

```json
// File: .flowforge/config/providers.json
// Provider configuration for different environments

{
  "default": {
    "providers": [
      {
        "type": "json",
        "primary": true,
        "config": {
          "dataFile": ".flowforge/data/tasks.json",
          "backupEnabled": true,
          "autoSave": true
        }
      }
    ],
    "sync": {
      "enabled": false,
      "interval": 300000
    }
  },
  
  "development": {
    "providers": [
      {
        "type": "json",
        "primary": true,
        "config": {
          "dataFile": ".flowforge/data/tasks.json"
        }
      },
      {
        "type": "github",
        "config": {
          "owner": "JustCode-CruzAlex",
          "repo": "FlowForge",
          "token": "${GITHUB_TOKEN}"
        }
      }
    ],
    "sync": {
      "enabled": true,
      "interval": 600000
    }
  },
  
  "production": {
    "providers": [
      {
        "type": "github",
        "primary": true,
        "config": {
          "owner": "${GITHUB_OWNER}",
          "repo": "${GITHUB_REPO}",
          "token": "${GITHUB_TOKEN}"
        }
      },
      {
        "type": "notion",
        "config": {
          "token": "${NOTION_TOKEN}",
          "databaseId": "${NOTION_DATABASE_ID}"
        }
      }
    ],
    "sync": {
      "enabled": true,
      "interval": 300000
    }
  },
  
  "enterprise": {
    "providers": [
      {
        "type": "jira",
        "primary": true,
        "config": {
          "host": "${JIRA_HOST}",
          "username": "${JIRA_USERNAME}",
          "token": "${JIRA_TOKEN}",
          "project": "${JIRA_PROJECT}"
        }
      },
      {
        "type": "json",
        "config": {
          "dataFile": ".flowforge/data/tasks-backup.json"
        }
      }
    ],
    "sync": {
      "enabled": true,
      "interval": 180000,
      "conflictResolution": "manual"
    }
  }
}
```

### 9. Command Integration

```bash
#!/bin/bash
# File: commands/flowforge/provider/configure.md
# Provider configuration command

## Description
Configure task providers for FlowForge

## Usage
```bash
/flowforge:provider:configure [provider-type] [environment]
/flowforge:provider:list
/flowforge:provider:test [provider-name]
/flowforge:provider:sync
```

## Implementation
```bash
#!/bin/bash

PROVIDER_TYPE="$1"
ENVIRONMENT="${2:-development}"
CONFIG_FILE=".flowforge/config/providers.json"

case "$1" in
    "list")
        echo "🔌 Available Providers:"
        node -e "
        const factory = require('./.flowforge/core/providers/provider-factory.js');
        const registry = factory.getRegistry();
        const providers = registry.getAvailableProviders();
        providers.forEach(p => console.log('  •', p));
        "
        ;;
        
    "test")
        echo "🧪 Testing provider: $2"
        node -e "
        const service = require('./.flowforge/core/task-service.js');
        service.testProvider('$2').then(result => {
            console.log(result.success ? '✅ Success' : '❌ Failed');
            if (result.error) console.log('Error:', result.error);
        });
        "
        ;;
        
    "sync")
        echo "🔄 Syncing all providers..."
        node -e "
        const service = require('./.flowforge/core/task-service.js');
        service.syncWithRemote().then(results => {
            results.forEach(r => {
                console.log(\`\${r.status === 'success' ? '✅' : '❌'} \${r.provider}\`);
            });
        });
        "
        ;;
        
    *)
        if [[ -z "$PROVIDER_TYPE" ]]; then
            echo "Usage: /flowforge:provider:configure [provider-type] [environment]"
            echo "       /flowforge:provider:list"
            echo "       /flowforge:provider:test [provider-name]"
            echo "       /flowforge:provider:sync"
            exit 1
        fi
        
        echo "⚙️  Configuring $PROVIDER_TYPE provider for $ENVIRONMENT..."
        
        # Create provider configuration wizard
        node .flowforge/scripts/configure-provider.js "$PROVIDER_TYPE" "$ENVIRONMENT"
        ;;
esac
```

## Success Metrics & KPIs

### Provider Integration KPIs
- **Multi-Provider Support**: ≥ 3 providers working simultaneously
- **Sync Success Rate**: ≥ 95% successful synchronizations
- **Data Consistency**: 100% data integrity across providers
- **Response Time**: Provider operations < 2 seconds
- **Offline Support**: Local provider works without internet

### Quality Metrics
- **Zero Data Loss**: All task operations preserve data
- **Conflict Resolution**: < 1% unresolved conflicts
- **Provider Reliability**: 99.9% provider uptime
- **Configuration Simplicity**: < 5 minutes to configure new provider

## Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| 1 | 2 days | Core interfaces and JSON provider |
| 2 | 2 days | GitHub provider and registry |
| 3 | 3 days | Notion provider and manager |
| 4 | 2 days | Command integration and testing |
| 5 | 1 day | Documentation and examples |

## Conclusion

This Provider Abstraction Architecture enables FlowForge v2.0 to work seamlessly with any task management system while maintaining a consistent developer experience. The flexible design supports current needs while enabling future provider additions without breaking changes.

**Key Takeaway**: Provider abstraction is essential for FlowForge's enterprise adoption and ensures the framework remains valuable regardless of organizational tool choices.

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-08-17  
**Status**: Implementation Required  
**Priority**: HIGH