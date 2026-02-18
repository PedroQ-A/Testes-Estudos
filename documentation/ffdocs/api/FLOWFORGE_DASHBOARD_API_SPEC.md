# FlowForge Dashboard API Specification v2.0

## Table of Contents
1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [RESTful API Endpoints](#restful-api-endpoints)
4. [GraphQL Schema](#graphql-schema)
5. [WebSocket API](#websocket-api)
6. [LLM Gateway API](#llm-gateway-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [API Versioning](#api-versioning)

## Overview

### Base URLs
```
Production:  https://api.flowforge.dev/v2
Staging:     https://staging-api.flowforge.dev/v2
Local:       http://localhost:3000/api/v2
WebSocket:   wss://ws.flowforge.dev/v2
GraphQL:     https://api.flowforge.dev/graphql
```

### Supported Protocols
- **REST**: Core CRUD operations
- **GraphQL**: Complex queries and mutations
- **WebSocket**: Real-time updates
- **gRPC**: High-performance LLM communication
- **Server-Sent Events**: One-way real-time updates

## Authentication & Authorization

### JWT Token Structure
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "flowforge-2024-q1"
  },
  "payload": {
    "sub": "usr_abc123def456",
    "email": "developer@flowforge.dev",
    "role": "developer",
    "permissions": [
      "dashboard:read",
      "dashboard:write",
      "llm:query",
      "llm:admin"
    ],
    "workspace": "ws_789xyz",
    "iat": 1704067200,
    "exp": 1704070800,
    "iss": "https://auth.flowforge.dev",
    "aud": "flowforge-dashboard"
  }
}
```

### Security Schemes

#### Bearer Authentication
```yaml
security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token for authenticated requests
```

#### API Key Authentication
```yaml
ApiKeyAuth:
  type: apiKey
  in: header
  name: X-API-Key
  description: API key for service-to-service communication
```

#### OAuth 2.0 Flow
```yaml
OAuth2:
  type: oauth2
  flows:
    authorizationCode:
      authorizationUrl: https://auth.flowforge.dev/oauth/authorize
      tokenUrl: https://auth.flowforge.dev/oauth/token
      refreshUrl: https://auth.flowforge.dev/oauth/refresh
      scopes:
        read: Read access to dashboard data
        write: Modify dashboard configuration
        admin: Administrative operations
        llm:local: Access local LLM endpoints
        llm:cloud: Access cloud LLM endpoints
```

## RESTful API Endpoints

### OpenAPI 3.0 Specification

```yaml
openapi: 3.0.3
info:
  title: FlowForge Dashboard API
  version: 2.0.0
  description: Comprehensive API for FlowForge Dashboard with LLM Integration
  contact:
    name: FlowForge API Support
    email: api@flowforge.dev
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.flowforge.dev/v2
    description: Production server
  - url: http://localhost:3000/api/v2
    description: Local development

paths:
  # Dashboard Management
  /dashboards:
    get:
      summary: List all dashboards
      operationId: listDashboards
      tags:
        - Dashboards
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
        - $ref: '#/components/parameters/SortParam'
        - name: workspace
          in: query
          schema:
            type: string
          description: Filter by workspace ID
      responses:
        '200':
          description: Successfully retrieved dashboards
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Dashboard'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
              example:
                data:
                  - id: "dash_abc123"
                    name: "Development Metrics"
                    workspace: "ws_789xyz"
                    widgets: 12
                    createdAt: "2024-01-01T00:00:00Z"
                    updatedAt: "2024-01-15T10:30:00Z"
                pagination:
                  page: 1
                  limit: 20
                  total: 45
                  totalPages: 3

    post:
      summary: Create new dashboard
      operationId: createDashboard
      tags:
        - Dashboards
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateDashboardRequest'
            example:
              name: "Performance Dashboard"
              description: "Real-time performance metrics"
              layout: "grid"
              widgets: []
      responses:
        '201':
          description: Dashboard created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Dashboard'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /dashboards/{dashboardId}:
    get:
      summary: Get dashboard by ID
      operationId: getDashboard
      tags:
        - Dashboards
      parameters:
        - name: dashboardId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Dashboard details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DashboardDetail'

    put:
      summary: Update dashboard
      operationId: updateDashboard
      tags:
        - Dashboards
      parameters:
        - name: dashboardId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateDashboardRequest'
      responses:
        '200':
          description: Dashboard updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Dashboard'

    delete:
      summary: Delete dashboard
      operationId: deleteDashboard
      tags:
        - Dashboards
      parameters:
        - name: dashboardId
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Dashboard deleted successfully

  # Widget Management
  /dashboards/{dashboardId}/widgets:
    get:
      summary: List dashboard widgets
      operationId: listWidgets
      tags:
        - Widgets
      parameters:
        - name: dashboardId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Widget list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Widget'

    post:
      summary: Add widget to dashboard
      operationId: addWidget
      tags:
        - Widgets
      parameters:
        - name: dashboardId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateWidgetRequest'
            example:
              type: "metric"
              title: "API Response Time"
              dataSource: "prometheus"
              query: "avg(api_response_time)"
              refreshInterval: 30
              position:
                x: 0
                y: 0
                width: 4
                height: 3
      responses:
        '201':
          description: Widget created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Widget'

  # Metrics & Analytics
  /metrics:
    get:
      summary: Get metrics data
      operationId: getMetrics
      tags:
        - Metrics
      parameters:
        - name: metric
          in: query
          required: true
          schema:
            type: string
            enum: [cpu, memory, requests, errors, latency]
        - name: timeRange
          in: query
          schema:
            type: string
            enum: [1h, 6h, 24h, 7d, 30d]
          default: 24h
        - name: aggregation
          in: query
          schema:
            type: string
            enum: [avg, min, max, sum, count]
          default: avg
      responses:
        '200':
          description: Metrics data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MetricsResponse'
              example:
                metric: "cpu"
                timeRange: "24h"
                aggregation: "avg"
                data:
                  - timestamp: "2024-01-15T10:00:00Z"
                    value: 45.2
                  - timestamp: "2024-01-15T10:05:00Z"
                    value: 48.7

  # Task Management
  /tasks:
    get:
      summary: List tasks
      operationId: listTasks
      tags:
        - Tasks
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, in_progress, completed, blocked]
        - name: assignee
          in: query
          schema:
            type: string
        - name: milestone
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Task list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Task'
                  summary:
                    type: object
                    properties:
                      total: 
                        type: integer
                      byStatus:
                        type: object

  # Time Tracking
  /time-entries:
    get:
      summary: List time entries
      operationId: listTimeEntries
      tags:
        - TimeTracking
      parameters:
        - name: startDate
          in: query
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          schema:
            type: string
            format: date
        - name: userId
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Time entries
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/TimeEntry'
                  summary:
                    type: object
                    properties:
                      totalHours:
                        type: number
                      totalCost:
                        type: number

    post:
      summary: Start time tracking
      operationId: startTimeTracking
      tags:
        - TimeTracking
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - taskId
              properties:
                taskId:
                  type: string
                description:
                  type: string
      responses:
        '201':
          description: Time tracking started
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TimeEntry'

  /time-entries/{entryId}/stop:
    post:
      summary: Stop time tracking
      operationId: stopTimeTracking
      tags:
        - TimeTracking
      parameters:
        - name: entryId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Time tracking stopped
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TimeEntry'

components:
  schemas:
    Dashboard:
      type: object
      required:
        - id
        - name
        - workspace
      properties:
        id:
          type: string
          pattern: '^dash_[a-zA-Z0-9]+$'
        name:
          type: string
        description:
          type: string
        workspace:
          type: string
        layout:
          type: string
          enum: [grid, freeform, responsive]
        theme:
          type: string
          enum: [light, dark, auto]
        widgets:
          type: integer
        tags:
          type: array
          items:
            type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    DashboardDetail:
      allOf:
        - $ref: '#/components/schemas/Dashboard'
        - type: object
          properties:
            widgets:
              type: array
              items:
                $ref: '#/components/schemas/Widget'
            permissions:
              type: array
              items:
                type: string
            sharing:
              type: object
              properties:
                public:
                  type: boolean
                users:
                  type: array
                  items:
                    type: string
                teams:
                  type: array
                  items:
                    type: string

    Widget:
      type: object
      required:
        - id
        - type
        - title
      properties:
        id:
          type: string
          pattern: '^wgt_[a-zA-Z0-9]+$'
        type:
          type: string
          enum: [metric, chart, table, text, llm-chat, llm-status]
        title:
          type: string
        dataSource:
          type: string
        query:
          type: string
        refreshInterval:
          type: integer
          description: Refresh interval in seconds
        position:
          type: object
          properties:
            x:
              type: integer
            y:
              type: integer
            width:
              type: integer
            height:
              type: integer
        config:
          type: object
          additionalProperties: true

    Task:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [pending, in_progress, completed, blocked]
        priority:
          type: string
          enum: [low, medium, high, critical]
        assignee:
          type: string
        milestone:
          type: string
        estimatedHours:
          type: number
        actualHours:
          type: number
        tags:
          type: array
          items:
            type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    TimeEntry:
      type: object
      properties:
        id:
          type: string
        userId:
          type: string
        taskId:
          type: string
        startTime:
          type: string
          format: date-time
        endTime:
          type: string
          format: date-time
        duration:
          type: integer
          description: Duration in seconds
        description:
          type: string
        rate:
          type: number
          description: Hourly rate
        cost:
          type: number
          description: Total cost

    MetricsResponse:
      type: object
      properties:
        metric:
          type: string
        timeRange:
          type: string
        aggregation:
          type: string
        unit:
          type: string
        data:
          type: array
          items:
            type: object
            properties:
              timestamp:
                type: string
                format: date-time
              value:
                type: number
              metadata:
                type: object

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer
        hasNext:
          type: boolean
        hasPrev:
          type: boolean

    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
        timestamp:
          type: string
          format: date-time
        path:
          type: string
        requestId:
          type: string

  parameters:
    PageParam:
      name: page
      in: query
      schema:
        type: integer
        minimum: 1
        default: 1
    
    LimitParam:
      name: limit
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
    
    SortParam:
      name: sort
      in: query
      schema:
        type: string
        pattern: '^[a-zA-Z_]+:(asc|desc)$'
        default: 'createdAt:desc'

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "BAD_REQUEST"
            message: "Invalid request parameters"
            details:
              field: "email"
              reason: "Invalid email format"
    
    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "UNAUTHORIZED"
            message: "Authentication required"
    
    Forbidden:
      description: Forbidden
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "FORBIDDEN"
            message: "Insufficient permissions"
    
    NotFound:
      description: Not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "NOT_FOUND"
            message: "Resource not found"
    
    TooManyRequests:
      description: Rate limit exceeded
      headers:
        X-RateLimit-Limit:
          schema:
            type: integer
        X-RateLimit-Remaining:
          schema:
            type: integer
        X-RateLimit-Reset:
          schema:
            type: integer
        Retry-After:
          schema:
            type: integer
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```

## GraphQL Schema

```graphql
# GraphQL Schema for FlowForge Dashboard

scalar DateTime
scalar JSON

# Root Query Type
type Query {
  # Dashboard queries
  dashboard(id: ID!): Dashboard
  dashboards(
    filter: DashboardFilter
    pagination: PaginationInput
    sort: SortInput
  ): DashboardConnection!
  
  # Widget queries
  widget(id: ID!): Widget
  widgets(dashboardId: ID!): [Widget!]!
  
  # Task queries
  task(id: ID!): Task
  tasks(
    filter: TaskFilter
    pagination: PaginationInput
  ): TaskConnection!
  
  # Metrics queries
  metrics(
    metric: MetricType!
    timeRange: TimeRange!
    aggregation: AggregationType
  ): MetricsData!
  
  # Time tracking queries
  timeEntries(
    userId: ID
    startDate: DateTime
    endDate: DateTime
  ): [TimeEntry!]!
  
  activeTimeEntry(userId: ID!): TimeEntry
  
  # LLM queries
  llmProviders: [LLMProvider!]!
  llmStatus(provider: String!): LLMStatus!
  llmQuota: LLMQuota!
}

# Root Mutation Type
type Mutation {
  # Dashboard mutations
  createDashboard(input: CreateDashboardInput!): DashboardPayload!
  updateDashboard(id: ID!, input: UpdateDashboardInput!): DashboardPayload!
  deleteDashboard(id: ID!): DeletePayload!
  duplicateDashboard(id: ID!): DashboardPayload!
  
  # Widget mutations
  addWidget(dashboardId: ID!, input: CreateWidgetInput!): WidgetPayload!
  updateWidget(id: ID!, input: UpdateWidgetInput!): WidgetPayload!
  removeWidget(id: ID!): DeletePayload!
  moveWidget(id: ID!, position: PositionInput!): WidgetPayload!
  
  # Task mutations
  createTask(input: CreateTaskInput!): TaskPayload!
  updateTask(id: ID!, input: UpdateTaskInput!): TaskPayload!
  deleteTask(id: ID!): DeletePayload!
  changeTaskStatus(id: ID!, status: TaskStatus!): TaskPayload!
  
  # Time tracking mutations
  startTimeTracking(taskId: ID!, description: String): TimeEntryPayload!
  stopTimeTracking(entryId: ID!): TimeEntryPayload!
  updateTimeEntry(id: ID!, input: UpdateTimeEntryInput!): TimeEntryPayload!
  
  # LLM mutations
  queryLLM(input: LLMQueryInput!): LLMResponsePayload!
  switchLLMProvider(provider: String!): LLMProviderPayload!
}

# Root Subscription Type
type Subscription {
  # Dashboard subscriptions
  dashboardUpdated(id: ID!): Dashboard!
  widgetDataUpdated(widgetId: ID!): WidgetData!
  
  # Task subscriptions
  taskCreated: Task!
  taskUpdated(id: ID): Task!
  taskStatusChanged: TaskStatusChange!
  
  # Metrics subscriptions
  metricsUpdate(metric: MetricType!): MetricUpdate!
  alertTriggered: Alert!
  
  # Time tracking subscriptions
  timeTrackingStarted: TimeEntry!
  timeTrackingStopped: TimeEntry!
  
  # LLM subscriptions
  llmResponseStream(queryId: ID!): LLMStreamResponse!
  llmStatusChanged(provider: String!): LLMStatus!
}

# Domain Types
type Dashboard {
  id: ID!
  name: String!
  description: String
  workspace: Workspace!
  layout: DashboardLayout!
  theme: Theme!
  widgets: [Widget!]!
  tags: [String!]!
  permissions: [Permission!]!
  sharing: SharingSettings!
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User!
  statistics: DashboardStatistics!
}

type Widget {
  id: ID!
  type: WidgetType!
  title: String!
  dataSource: DataSource!
  query: String
  refreshInterval: Int
  position: Position!
  config: JSON!
  data: WidgetData
  lastUpdated: DateTime!
}

type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: Priority!
  assignee: User
  milestone: Milestone
  estimatedHours: Float
  actualHours: Float
  tags: [String!]!
  comments: [Comment!]!
  attachments: [Attachment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  dueDate: DateTime
  completedAt: DateTime
}

type TimeEntry {
  id: ID!
  user: User!
  task: Task!
  startTime: DateTime!
  endTime: DateTime
  duration: Int
  description: String
  rate: Float
  cost: Float
  approved: Boolean!
  tags: [String!]!
}

type LLMProvider {
  id: ID!
  name: String!
  type: LLMProviderType!
  endpoint: String!
  status: LLMStatus!
  models: [LLMModel!]!
  capabilities: [String!]!
  rateLimit: RateLimit!
  isLocal: Boolean!
}

type LLMModel {
  id: ID!
  name: String!
  version: String!
  contextWindow: Int!
  maxTokens: Int!
  capabilities: [String!]!
  pricing: Pricing
}

type LLMStatus {
  provider: String!
  status: ServiceStatus!
  latency: Int
  availability: Float
  lastChecked: DateTime!
  errors: [Error!]
}

type LLMQuota {
  tokensUsed: Int!
  tokensLimit: Int!
  requestsUsed: Int!
  requestsLimit: Int!
  resetAt: DateTime!
  costUsed: Float!
  costLimit: Float!
}

# Input Types
input CreateDashboardInput {
  name: String!
  description: String
  layout: DashboardLayout
  theme: Theme
  widgets: [CreateWidgetInput!]
  tags: [String!]
}

input UpdateDashboardInput {
  name: String
  description: String
  layout: DashboardLayout
  theme: Theme
  tags: [String!]
}

input CreateWidgetInput {
  type: WidgetType!
  title: String!
  dataSource: String!
  query: String
  refreshInterval: Int
  position: PositionInput!
  config: JSON
}

input UpdateWidgetInput {
  title: String
  query: String
  refreshInterval: Int
  config: JSON
}

input CreateTaskInput {
  title: String!
  description: String
  status: TaskStatus
  priority: Priority
  assigneeId: ID
  milestoneId: ID
  estimatedHours: Float
  dueDate: DateTime
  tags: [String!]
}

input UpdateTaskInput {
  title: String
  description: String
  status: TaskStatus
  priority: Priority
  assigneeId: ID
  milestoneId: ID
  estimatedHours: Float
  dueDate: DateTime
  tags: [String!]
}

input LLMQueryInput {
  provider: String
  model: String!
  prompt: String!
  systemPrompt: String
  temperature: Float
  maxTokens: Int
  stream: Boolean
  context: [LLMContext!]
}

input LLMContext {
  role: String!
  content: String!
}

input PositionInput {
  x: Int!
  y: Int!
  width: Int!
  height: Int!
}

input PaginationInput {
  page: Int
  limit: Int
  cursor: String
}

input SortInput {
  field: String!
  order: SortOrder!
}

input DashboardFilter {
  workspace: ID
  tags: [String!]
  createdBy: ID
  search: String
}

input TaskFilter {
  status: [TaskStatus!]
  priority: [Priority!]
  assignee: ID
  milestone: ID
  tags: [String!]
}

# Enums
enum DashboardLayout {
  GRID
  FREEFORM
  RESPONSIVE
}

enum Theme {
  LIGHT
  DARK
  AUTO
}

enum WidgetType {
  METRIC
  CHART
  TABLE
  TEXT
  LLM_CHAT
  LLM_STATUS
  TIME_TRACKER
  TASK_LIST
  MILESTONE_PROGRESS
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  BLOCKED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum MetricType {
  CPU
  MEMORY
  REQUESTS
  ERRORS
  LATENCY
  THROUGHPUT
}

enum TimeRange {
  HOUR_1
  HOURS_6
  HOURS_24
  DAYS_7
  DAYS_30
  CUSTOM
}

enum AggregationType {
  AVG
  MIN
  MAX
  SUM
  COUNT
  P50
  P95
  P99
}

enum LLMProviderType {
  LOCAL
  CLOUD
  HYBRID
}

enum ServiceStatus {
  ONLINE
  OFFLINE
  DEGRADED
  MAINTENANCE
}

enum SortOrder {
  ASC
  DESC
}

# Connections (Relay-style pagination)
type DashboardConnection {
  edges: [DashboardEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type DashboardEdge {
  node: Dashboard!
  cursor: String!
}

type TaskConnection {
  edges: [TaskEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type TaskEdge {
  node: Task!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Payload Types
type DashboardPayload {
  dashboard: Dashboard
  errors: [Error!]
  success: Boolean!
}

type WidgetPayload {
  widget: Widget
  errors: [Error!]
  success: Boolean!
}

type TaskPayload {
  task: Task
  errors: [Error!]
  success: Boolean!
}

type TimeEntryPayload {
  timeEntry: TimeEntry
  errors: [Error!]
  success: Boolean!
}

type LLMResponsePayload {
  response: String
  model: String!
  tokensUsed: Int!
  latency: Int!
  errors: [Error!]
  success: Boolean!
}

type LLMProviderPayload {
  provider: LLMProvider
  errors: [Error!]
  success: Boolean!
}

type DeletePayload {
  id: ID!
  success: Boolean!
  errors: [Error!]
}

type LLMStreamResponse {
  chunk: String!
  done: Boolean!
  tokensUsed: Int
  error: Error
}

type Error {
  code: String!
  message: String!
  field: String
  details: JSON
}
```

## WebSocket API

### WebSocket Connection Protocol

```javascript
// WebSocket Connection URL
// wss://ws.flowforge.dev/v2/realtime?token={JWT_TOKEN}

// Connection Handshake
{
  "type": "connection",
  "id": "msg_123",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "protocol": "v2.flowforge.realtime",
    "version": "2.0.0",
    "capabilities": ["dashboard", "metrics", "llm", "tasks"]
  }
}

// Server Response
{
  "type": "connection_ack",
  "id": "msg_123",
  "timestamp": "2024-01-15T10:00:01Z",
  "data": {
    "connectionId": "conn_abc123",
    "heartbeatInterval": 30000,
    "capabilities": ["dashboard", "metrics", "llm", "tasks"],
    "subscriptions": []
  }
}
```

### WebSocket Message Types

```typescript
// TypeScript definitions for WebSocket messages

enum MessageType {
  // Connection Management
  CONNECTION = 'connection',
  CONNECTION_ACK = 'connection_ack',
  PING = 'ping',
  PONG = 'pong',
  DISCONNECT = 'disconnect',
  
  // Subscriptions
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  SUBSCRIPTION_DATA = 'subscription_data',
  
  // Dashboard Events
  DASHBOARD_UPDATE = 'dashboard.update',
  WIDGET_UPDATE = 'widget.update',
  WIDGET_DATA = 'widget.data',
  
  // Task Events
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_STATUS_CHANGED = 'task.status_changed',
  
  // Metrics Events
  METRICS_UPDATE = 'metrics.update',
  ALERT_TRIGGERED = 'alert.triggered',
  
  // Time Tracking Events
  TIME_TRACKING_START = 'time.start',
  TIME_TRACKING_STOP = 'time.stop',
  TIME_ENTRY_UPDATE = 'time.update',
  
  // LLM Events
  LLM_STREAM_START = 'llm.stream.start',
  LLM_STREAM_CHUNK = 'llm.stream.chunk',
  LLM_STREAM_END = 'llm.stream.end',
  LLM_STATUS_CHANGE = 'llm.status.change',
  
  // Error Events
  ERROR = 'error'
}

interface WebSocketMessage {
  type: MessageType;
  id: string;
  timestamp: string;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Subscription Examples

```javascript
// Subscribe to dashboard updates
{
  "type": "subscribe",
  "id": "msg_456",
  "timestamp": "2024-01-15T10:00:05Z",
  "data": {
    "channel": "dashboard.updates",
    "params": {
      "dashboardId": "dash_abc123"
    }
  }
}

// Subscribe to metric updates
{
  "type": "subscribe",
  "id": "msg_789",
  "timestamp": "2024-01-15T10:00:10Z",
  "data": {
    "channel": "metrics.realtime",
    "params": {
      "metrics": ["cpu", "memory", "requests"],
      "interval": 5000
    }
  }
}

// Subscribe to LLM streaming
{
  "type": "subscribe",
  "id": "msg_012",
  "timestamp": "2024-01-15T10:00:15Z",
  "data": {
    "channel": "llm.stream",
    "params": {
      "queryId": "query_xyz789"
    }
  }
}
```

### Real-time Data Updates

```javascript
// Widget data update
{
  "type": "widget.data",
  "id": "msg_345",
  "timestamp": "2024-01-15T10:01:00Z",
  "data": {
    "widgetId": "wgt_def456",
    "dashboardId": "dash_abc123",
    "data": {
      "value": 87.5,
      "trend": "up",
      "change": 5.2,
      "timestamp": "2024-01-15T10:01:00Z"
    }
  }
}

// Task status change notification
{
  "type": "task.status_changed",
  "id": "msg_678",
  "timestamp": "2024-01-15T10:02:00Z",
  "data": {
    "taskId": "task_ghi789",
    "previousStatus": "in_progress",
    "newStatus": "completed",
    "changedBy": "usr_jkl012",
    "timestamp": "2024-01-15T10:02:00Z"
  }
}

// LLM streaming response
{
  "type": "llm.stream.chunk",
  "id": "msg_901",
  "timestamp": "2024-01-15T10:03:00Z",
  "data": {
    "queryId": "query_xyz789",
    "chunk": "Based on the analysis, ",
    "index": 0,
    "done": false,
    "tokensUsed": 5
  }
}
```

## LLM Gateway API

### Hybrid LLM Architecture

```yaml
# LLM Gateway Configuration
llm:
  providers:
    # Local LLM Endpoints
    local:
      - name: "ollama"
        type: "local"
        endpoint: "http://localhost:11434"
        models:
          - "llama2"
          - "codellama"
          - "mistral"
        priority: 1
        fallback: "cloud.openai"
      
      - name: "llama-cpp"
        type: "local"
        endpoint: "http://localhost:8080"
        models:
          - "custom-model"
        priority: 2
    
    # Cloud LLM Endpoints
    cloud:
      - name: "openai"
        type: "cloud"
        endpoint: "https://api.openai.com/v1"
        models:
          - "gpt-4"
          - "gpt-3.5-turbo"
        apiKey: "${OPENAI_API_KEY}"
        rateLimit:
          requests: 3000
          tokens: 90000
          window: 60
      
      - name: "anthropic"
        type: "cloud"
        endpoint: "https://api.anthropic.com/v1"
        models:
          - "claude-3-opus"
          - "claude-3-sonnet"
        apiKey: "${ANTHROPIC_API_KEY}"
        rateLimit:
          requests: 1000
          tokens: 100000
          window: 60
```

### LLM Query API

```http
POST /api/v2/llm/query
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "provider": "auto",  // auto, local, cloud, or specific provider
  "model": "auto",     // auto or specific model
  "prompt": "Analyze this code for potential improvements",
  "systemPrompt": "You are a senior software engineer",
  "context": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ],
  "options": {
    "temperature": 0.7,
    "maxTokens": 2000,
    "stream": true,
    "preferLocal": true,  // Prefer local LLM if available
    "fallbackToCloud": true  // Allow cloud fallback
  },
  "metadata": {
    "taskId": "task_123",
    "userId": "usr_456"
  }
}

Response (Streaming):
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"chunk": "Based on", "index": 0, "done": false}
data: {"chunk": " the analysis", "index": 1, "done": false}
data: {"chunk": ", here are", "index": 2, "done": false}
data: {"chunk": " the improvements:", "index": 3, "done": false}
data: {"chunk": "", "index": 4, "done": true, "tokensUsed": 150, "provider": "local.ollama", "model": "codellama"}
```

### LLM Provider Selection Algorithm

```javascript
class LLMGateway {
  async selectProvider(request) {
    const providers = this.getAvailableProviders();
    
    // Priority-based selection
    if (request.provider === 'auto') {
      // Check local providers first if preferLocal is true
      if (request.options.preferLocal) {
        const localProvider = await this.findAvailableLocal(providers);
        if (localProvider) return localProvider;
      }
      
      // Fall back to cloud if allowed
      if (request.options.fallbackToCloud) {
        const cloudProvider = await this.findAvailableCloud(providers);
        if (cloudProvider) return cloudProvider;
      }
      
      throw new Error('No available LLM providers');
    }
    
    // Specific provider requested
    const provider = providers.find(p => p.name === request.provider);
    if (!provider || !await this.isProviderHealthy(provider)) {
      throw new Error(`Provider ${request.provider} is not available`);
    }
    
    return provider;
  }
  
  async findAvailableLocal(providers) {
    const localProviders = providers
      .filter(p => p.type === 'local')
      .sort((a, b) => a.priority - b.priority);
    
    for (const provider of localProviders) {
      if (await this.isProviderHealthy(provider)) {
        return provider;
      }
    }
    
    return null;
  }
  
  async findAvailableCloud(providers) {
    const cloudProviders = providers
      .filter(p => p.type === 'cloud')
      .filter(p => !this.isRateLimited(p));
    
    for (const provider of cloudProviders) {
      if (await this.isProviderHealthy(provider)) {
        return provider;
      }
    }
    
    return null;
  }
  
  async isProviderHealthy(provider) {
    try {
      const response = await fetch(`${provider.endpoint}/health`, {
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  isRateLimited(provider) {
    const usage = this.rateLimiter.getUsage(provider.name);
    return usage.requests >= provider.rateLimit.requests ||
           usage.tokens >= provider.rateLimit.tokens;
  }
}
```

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "timestamp": "2024-01-15T10:00:00Z",
    "path": "/api/v2/dashboards",
    "method": "POST",
    "requestId": "req_abc123def456",
    "details": {
      "validationErrors": [
        {
          "field": "name",
          "value": "",
          "message": "Name is required",
          "code": "REQUIRED_FIELD"
        },
        {
          "field": "layout",
          "value": "invalid",
          "message": "Invalid layout type",
          "code": "INVALID_ENUM"
        }
      ]
    },
    "documentation": "https://docs.flowforge.dev/api/errors/VALIDATION_ERROR",
    "support": "https://support.flowforge.dev"
  }
}
```

### Error Codes

```javascript
const ErrorCodes = {
  // Client Errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // Server Errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',
  
  // Business Logic Errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  DEPENDENCY_ERROR: 'DEPENDENCY_ERROR',
  
  // LLM Specific Errors
  LLM_PROVIDER_UNAVAILABLE: 'LLM_PROVIDER_UNAVAILABLE',
  LLM_MODEL_NOT_FOUND: 'LLM_MODEL_NOT_FOUND',
  LLM_CONTEXT_TOO_LARGE: 'LLM_CONTEXT_TOO_LARGE',
  LLM_RATE_LIMITED: 'LLM_RATE_LIMITED',
  LLM_QUOTA_EXCEEDED: 'LLM_QUOTA_EXCEEDED'
};
```

## Rate Limiting

### Rate Limit Configuration

```yaml
rateLimiting:
  default:
    requests: 1000
    window: 3600  # 1 hour in seconds
    strategy: "sliding-window"
  
  tiers:
    free:
      requests: 100
      window: 3600
      burst: 10
    
    pro:
      requests: 5000
      window: 3600
      burst: 100
    
    enterprise:
      requests: unlimited
      window: null
      burst: 1000
  
  endpoints:
    # Specific endpoint limits
    "/api/v2/llm/query":
      requests: 100
      window: 3600
      costBased: true  # Consider token usage
    
    "/api/v2/metrics":
      requests: 600
      window: 60  # 10 requests per second
    
    "/api/v2/dashboards":
      requests: 1000
      window: 3600
```

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1705320000
X-RateLimit-Policy: default
X-RateLimit-Burst: 50

# When rate limited
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705320000
Retry-After: 3600
Content-Type: application/json

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "retryAfter": 3600,
    "upgradeUrl": "https://flowforge.dev/pricing"
  }
}
```

## API Versioning

### Versioning Strategy

```yaml
versioning:
  strategy: "url-path"  # /v2/, /v3/
  current: "v2"
  supported:
    - version: "v2"
      status: "current"
      deprecation: null
      sunset: null
    - version: "v1"
      status: "deprecated"
      deprecation: "2024-01-01"
      sunset: "2024-07-01"
  
  migration:
    breaking_changes:
      v1_to_v2:
        - field: "user_id"
          change: "renamed to userId"
        - endpoint: "/users/list"
          change: "changed to /users"
        - response: "data wrapping added"
```

### Version Migration Headers

```http
# Deprecated version warning
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 01 Jul 2024 00:00:00 GMT
Link: </api/v2/users>; rel="successor-version"
Warning: 299 - "API version v1 is deprecated, please migrate to v2"
```

### Version Discovery Endpoint

```http
GET /api/versions
Accept: application/json

Response:
{
  "versions": [
    {
      "version": "v2",
      "status": "current",
      "releaseDate": "2024-01-01",
      "documentation": "https://docs.flowforge.dev/api/v2"
    },
    {
      "version": "v1",
      "status": "deprecated",
      "deprecationDate": "2024-01-01",
      "sunsetDate": "2024-07-01",
      "documentation": "https://docs.flowforge.dev/api/v1",
      "migrationGuide": "https://docs.flowforge.dev/api/migration/v1-to-v2"
    }
  ],
  "recommended": "v2"
}
```

## Security Considerations

### API Security Checklist

```yaml
security:
  authentication:
    - JWT with RS256 signing
    - API keys for service accounts
    - OAuth 2.0 for third-party apps
  
  authorization:
    - Role-based access control (RBAC)
    - Resource-level permissions
    - Attribute-based access control (ABAC)
  
  transport:
    - TLS 1.3 minimum
    - Certificate pinning for mobile apps
    - HSTS headers
  
  input_validation:
    - Schema validation on all inputs
    - SQL injection prevention
    - XSS protection
    - File upload restrictions
  
  output_encoding:
    - JSON encoding for all responses
    - HTML entity encoding where needed
    - Content-Type headers always set
  
  rate_limiting:
    - Per-user limits
    - Per-IP limits
    - Distributed rate limiting
  
  monitoring:
    - All requests logged
    - Anomaly detection
    - Real-time alerting
  
  compliance:
    - GDPR compliant
    - SOC 2 Type II
    - ISO 27001
```

### CORS Configuration

```javascript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://app.flowforge.dev',
      'https://dashboard.flowforge.dev',
      'http://localhost:3000',  // Development only
      'http://localhost:5173'   // Vite development
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-Workspace-ID'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID'
  ],
  maxAge: 86400  // 24 hours
};
```

## API Testing Contract

```javascript
// Pact Contract Testing Example
describe('Dashboard API Contract', () => {
  describe('GET /dashboards', () => {
    it('should return paginated dashboard list', async () => {
      await provider.addInteraction({
        state: 'user has dashboards',
        uponReceiving: 'a request for dashboards',
        withRequest: {
          method: 'GET',
          path: '/api/v2/dashboards',
          headers: {
            'Authorization': match.regex(/Bearer .+/),
            'Accept': 'application/json'
          },
          query: {
            page: '1',
            limit: '20'
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': match.integer(),
            'X-RateLimit-Remaining': match.integer()
          },
          body: {
            data: match.eachLike({
              id: match.regex(/^dash_[a-zA-Z0-9]+$/),
              name: match.string(),
              workspace: match.string(),
              createdAt: match.iso8601DateTime(),
              updatedAt: match.iso8601DateTime()
            }),
            pagination: {
              page: match.integer(),
              limit: match.integer(),
              total: match.integer(),
              totalPages: match.integer(),
              hasNext: match.boolean(),
              hasPrev: match.boolean()
            }
          }
        }
      });
      
      const response = await dashboardAPI.listDashboards(1, 20);
      expect(response.data).toHaveLength(20);
      expect(response.pagination.page).toBe(1);
    });
  });
  
  describe('WebSocket Contract', () => {
    it('should handle real-time dashboard updates', async () => {
      const ws = new WebSocket('wss://ws.flowforge.dev/v2/realtime');
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'subscribe',
          id: 'test_123',
          data: {
            channel: 'dashboard.updates',
            params: { dashboardId: 'dash_test' }
          }
        }));
      });
      
      ws.on('message', (data) => {
        const message = JSON.parse(data);
        expect(message).toMatchSchema({
          type: match.string(),
          id: match.string(),
          timestamp: match.iso8601DateTime(),
          data: match.object()
        });
      });
    });
  });
});
```

## Performance Requirements

```yaml
performance:
  response_times:
    p50: 50ms
    p95: 100ms
    p99: 200ms
  
  throughput:
    minimum: 10000  # requests per second
    target: 50000
  
  availability:
    sla: 99.99%  # 52 minutes downtime per year
  
  data_limits:
    max_request_size: 10MB
    max_response_size: 50MB
    max_websocket_frame: 64KB
  
  caching:
    cdn: CloudFlare
    ttl:
      static: 86400    # 1 day
      dynamic: 300     # 5 minutes
      realtime: 0      # No caching
```

## SDK Support

```javascript
// JavaScript/TypeScript SDK Example
import { FlowForgeClient } from '@flowforge/sdk';

const client = new FlowForgeClient({
  apiKey: process.env.FLOWFORGE_API_KEY,
  baseUrl: 'https://api.flowforge.dev/v2',
  timeout: 30000,
  retryOptions: {
    retries: 3,
    backoff: 'exponential'
  }
});

// REST API usage
const dashboards = await client.dashboards.list({
  page: 1,
  limit: 20,
  workspace: 'ws_123'
});

// GraphQL usage
const result = await client.graphql({
  query: `
    query GetDashboard($id: ID!) {
      dashboard(id: $id) {
        id
        name
        widgets {
          id
          type
          title
        }
      }
    }
  `,
  variables: { id: 'dash_abc123' }
});

// WebSocket usage
const ws = client.realtime({
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected')
});

ws.subscribe('dashboard.updates', { dashboardId: 'dash_abc123' }, (data) => {
  console.log('Dashboard updated:', data);
});

// LLM usage
const llmResponse = await client.llm.query({
  prompt: 'Analyze this code',
  model: 'auto',
  preferLocal: true,
  stream: true,
  onChunk: (chunk) => console.log(chunk)
});
```

---

## Summary

This comprehensive API specification provides:

1. **Multi-Protocol Support**: REST, GraphQL, WebSocket, and gRPC for different use cases
2. **Hybrid LLM Integration**: Seamless switching between local and cloud LLM providers
3. **Real-time Capabilities**: WebSocket and SSE for live dashboard updates
4. **Security First**: JWT, OAuth 2.0, API keys, and comprehensive security measures
5. **Developer Experience**: Clear documentation, SDKs, and consistent patterns
6. **Performance Optimized**: Caching, rate limiting, and pagination strategies
7. **Future-Proof**: Versioning strategy with deprecation timeline
8. **Production Ready**: Error handling, monitoring, and compliance considerations

The API is designed to scale with FlowForge's growth while maintaining backward compatibility and excellent developer experience.