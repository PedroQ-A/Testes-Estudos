# FlowForge Dashboard API Contract Tests

## Test-Driven Development Specification

### Core Test Requirements

```javascript
// Test Suite Structure
describe('FlowForge Dashboard API v2', () => {
  
  // Authentication Tests
  describe('Authentication', () => {
    describe('JWT Authentication', () => {
      it('should accept valid JWT token', async () => {
        const token = generateValidJWT();
        const response = await request(app)
          .get('/api/v2/dashboards')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
      });
      
      it('should reject expired JWT token', async () => {
        const token = generateExpiredJWT();
        const response = await request(app)
          .get('/api/v2/dashboards')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('TOKEN_EXPIRED');
      });
      
      it('should reject invalid JWT signature', async () => {
        const token = generateInvalidSignatureJWT();
        const response = await request(app)
          .get('/api/v2/dashboards')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('INVALID_TOKEN');
      });
    });
    
    describe('API Key Authentication', () => {
      it('should accept valid API key', async () => {
        const response = await request(app)
          .get('/api/v2/dashboards')
          .set('X-API-Key', validAPIKey);
        
        expect(response.status).toBe(200);
      });
      
      it('should reject invalid API key format', async () => {
        const response = await request(app)
          .get('/api/v2/dashboards')
          .set('X-API-Key', 'invalid-key');
        
        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe('INVALID_API_KEY');
      });
    });
  });
  
  // Dashboard CRUD Tests
  describe('Dashboard Operations', () => {
    describe('GET /dashboards', () => {
      it('should return paginated dashboard list', async () => {
        const response = await authenticatedRequest()
          .get('/api/v2/dashboards?page=1&limit=10');
        
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: expect.stringMatching(/^dash_[a-zA-Z0-9]+$/),
              name: expect.any(String),
              workspace: expect.any(String),
              createdAt: expect.stringMatching(ISO8601_REGEX),
              updatedAt: expect.stringMatching(ISO8601_REGEX)
            })
          ]),
          pagination: {
            page: 1,
            limit: 10,
            total: expect.any(Number),
            totalPages: expect.any(Number),
            hasNext: expect.any(Boolean),
            hasPrev: expect.any(Boolean)
          }
        });
      });
      
      it('should filter dashboards by workspace', async () => {
        const workspaceId = 'ws_test123';
        const response = await authenticatedRequest()
          .get(`/api/v2/dashboards?workspace=${workspaceId}`);
        
        expect(response.status).toBe(200);
        response.body.data.forEach(dashboard => {
          expect(dashboard.workspace).toBe(workspaceId);
        });
      });
      
      it('should respect rate limits', async () => {
        const response = await authenticatedRequest()
          .get('/api/v2/dashboards');
        
        expect(response.headers['x-ratelimit-limit']).toBeDefined();
        expect(response.headers['x-ratelimit-remaining']).toBeDefined();
        expect(response.headers['x-ratelimit-reset']).toBeDefined();
      });
    });
    
    describe('POST /dashboards', () => {
      it('should create dashboard with valid data', async () => {
        const newDashboard = {
          name: 'Test Dashboard',
          description: 'Test description',
          layout: 'grid',
          theme: 'dark'
        };
        
        const response = await authenticatedRequest()
          .post('/api/v2/dashboards')
          .send(newDashboard);
        
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          id: expect.stringMatching(/^dash_[a-zA-Z0-9]+$/),
          ...newDashboard,
          createdAt: expect.stringMatching(ISO8601_REGEX),
          updatedAt: expect.stringMatching(ISO8601_REGEX)
        });
      });
      
      it('should validate required fields', async () => {
        const invalidDashboard = {
          description: 'Missing name field'
        };
        
        const response = await authenticatedRequest()
          .post('/api/v2/dashboards')
          .send(invalidDashboard);
        
        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(response.body.error.details.validationErrors).toContainEqual(
          expect.objectContaining({
            field: 'name',
            code: 'REQUIRED_FIELD'
          })
        );
      });
      
      it('should validate enum fields', async () => {
        const invalidDashboard = {
          name: 'Test Dashboard',
          layout: 'invalid-layout'
        };
        
        const response = await authenticatedRequest()
          .post('/api/v2/dashboards')
          .send(invalidDashboard);
        
        expect(response.status).toBe(400);
        expect(response.body.error.details.validationErrors).toContainEqual(
          expect.objectContaining({
            field: 'layout',
            code: 'INVALID_ENUM'
          })
        );
      });
    });
    
    describe('PUT /dashboards/:id', () => {
      it('should update existing dashboard', async () => {
        const dashboardId = 'dash_existing123';
        const updates = {
          name: 'Updated Dashboard Name',
          theme: 'light'
        };
        
        const response = await authenticatedRequest()
          .put(`/api/v2/dashboards/${dashboardId}`)
          .send(updates);
        
        expect(response.status).toBe(200);
        expect(response.body.name).toBe(updates.name);
        expect(response.body.theme).toBe(updates.theme);
        expect(response.body.updatedAt).not.toBe(response.body.createdAt);
      });
      
      it('should return 404 for non-existent dashboard', async () => {
        const response = await authenticatedRequest()
          .put('/api/v2/dashboards/dash_nonexistent')
          .send({ name: 'Updated' });
        
        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe('NOT_FOUND');
      });
    });
    
    describe('DELETE /dashboards/:id', () => {
      it('should delete dashboard with proper authorization', async () => {
        const dashboardId = 'dash_deletable123';
        
        const response = await authenticatedRequest()
          .delete(`/api/v2/dashboards/${dashboardId}`);
        
        expect(response.status).toBe(204);
        
        // Verify deletion
        const getResponse = await authenticatedRequest()
          .get(`/api/v2/dashboards/${dashboardId}`);
        expect(getResponse.status).toBe(404);
      });
      
      it('should prevent deletion without proper permissions', async () => {
        const dashboardId = 'dash_protected123';
        
        const response = await limitedAuthRequest()
          .delete(`/api/v2/dashboards/${dashboardId}`);
        
        expect(response.status).toBe(403);
        expect(response.body.error.code).toBe('FORBIDDEN');
      });
    });
  });
  
  // Widget Management Tests
  describe('Widget Operations', () => {
    describe('POST /dashboards/:id/widgets', () => {
      it('should add widget to dashboard', async () => {
        const dashboardId = 'dash_test123';
        const widget = {
          type: 'metric',
          title: 'CPU Usage',
          dataSource: 'prometheus',
          query: 'avg(cpu_usage)',
          refreshInterval: 30,
          position: { x: 0, y: 0, width: 4, height: 3 }
        };
        
        const response = await authenticatedRequest()
          .post(`/api/v2/dashboards/${dashboardId}/widgets`)
          .send(widget);
        
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
          id: expect.stringMatching(/^wgt_[a-zA-Z0-9]+$/),
          ...widget
        });
      });
      
      it('should validate widget position', async () => {
        const dashboardId = 'dash_test123';
        const widget = {
          type: 'metric',
          title: 'Invalid Position',
          position: { x: -1, y: 0, width: 4, height: 3 }
        };
        
        const response = await authenticatedRequest()
          .post(`/api/v2/dashboards/${dashboardId}/widgets`)
          .send(widget);
        
        expect(response.status).toBe(400);
        expect(response.body.error.details.validationErrors).toContainEqual(
          expect.objectContaining({
            field: 'position.x',
            code: 'MIN_VALUE'
          })
        );
      });
    });
  });
  
  // LLM Integration Tests
  describe('LLM Gateway', () => {
    describe('POST /llm/query', () => {
      it('should route to local LLM when available', async () => {
        // Mock local LLM available
        mockLocalLLMAvailable();
        
        const response = await authenticatedRequest()
          .post('/api/v2/llm/query')
          .send({
            provider: 'auto',
            model: 'codellama',
            prompt: 'Test prompt',
            options: { preferLocal: true }
          });
        
        expect(response.status).toBe(200);
        expect(response.body.provider).toBe('local.ollama');
      });
      
      it('should fallback to cloud when local unavailable', async () => {
        // Mock local LLM unavailable
        mockLocalLLMUnavailable();
        
        const response = await authenticatedRequest()
          .post('/api/v2/llm/query')
          .send({
            provider: 'auto',
            model: 'gpt-4',
            prompt: 'Test prompt',
            options: { 
              preferLocal: true,
              fallbackToCloud: true 
            }
          });
        
        expect(response.status).toBe(200);
        expect(response.body.provider).toMatch(/^cloud\./);
      });
      
      it('should stream responses when requested', async () => {
        const response = await authenticatedRequest()
          .post('/api/v2/llm/query')
          .send({
            model: 'gpt-3.5-turbo',
            prompt: 'Test streaming',
            options: { stream: true }
          })
          .expect('Content-Type', /text\/event-stream/);
        
        expect(response.status).toBe(200);
      });
      
      it('should enforce token limits', async () => {
        const largePrompt = 'x'.repeat(100000);
        
        const response = await authenticatedRequest()
          .post('/api/v2/llm/query')
          .send({
            model: 'gpt-4',
            prompt: largePrompt,
            options: { maxTokens: 1000 }
          });
        
        expect(response.status).toBe(400);
        expect(response.body.error.code).toBe('LLM_CONTEXT_TOO_LARGE');
      });
      
      it('should track token usage for billing', async () => {
        const response = await authenticatedRequest()
          .post('/api/v2/llm/query')
          .send({
            model: 'gpt-3.5-turbo',
            prompt: 'Calculate tokens'
          });
        
        expect(response.status).toBe(200);
        expect(response.body.tokensUsed).toBeGreaterThan(0);
        expect(response.body.cost).toBeDefined();
      });
    });
  });
  
  // WebSocket Tests
  describe('WebSocket Real-time API', () => {
    let ws;
    
    beforeEach((done) => {
      ws = new WebSocket('wss://ws.flowforge.dev/v2/realtime?token=' + validJWT);
      ws.on('open', done);
    });
    
    afterEach(() => {
      ws.close();
    });
    
    it('should establish connection with valid token', (done) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'connection_ack') {
          expect(message.data.connectionId).toBeDefined();
          expect(message.data.capabilities).toContain('dashboard');
          done();
        }
      });
      
      ws.send(JSON.stringify({
        type: 'connection',
        id: 'test_123',
        data: { protocol: 'v2.flowforge.realtime' }
      }));
    });
    
    it('should subscribe to dashboard updates', (done) => {
      const dashboardId = 'dash_test123';
      
      ws.send(JSON.stringify({
        type: 'subscribe',
        id: 'sub_123',
        data: {
          channel: 'dashboard.updates',
          params: { dashboardId }
        }
      }));
      
      ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'subscription_data') {
          expect(message.data.dashboardId).toBe(dashboardId);
          done();
        }
      });
      
      // Trigger dashboard update
      triggerDashboardUpdate(dashboardId);
    });
    
    it('should handle ping/pong for keepalive', (done) => {
      ws.send(JSON.stringify({
        type: 'ping',
        id: 'ping_123',
        timestamp: new Date().toISOString()
      }));
      
      ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'pong') {
          expect(message.id).toBe('ping_123');
          done();
        }
      });
    });
    
    it('should stream LLM responses', (done) => {
      const chunks = [];
      
      ws.send(JSON.stringify({
        type: 'subscribe',
        id: 'llm_123',
        data: {
          channel: 'llm.stream',
          params: { queryId: 'query_xyz789' }
        }
      }));
      
      ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'llm.stream.chunk') {
          chunks.push(message.data.chunk);
          if (message.data.done) {
            expect(chunks.join('')).toContain('Based on the analysis');
            done();
          }
        }
      });
    });
  });
  
  // Rate Limiting Tests
  describe('Rate Limiting', () => {
    it('should enforce rate limits per user', async () => {
      const requests = [];
      const limit = 100;
      
      // Make requests up to limit
      for (let i = 0; i < limit + 10; i++) {
        requests.push(
          authenticatedRequest().get('/api/v2/dashboards')
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
      expect(rateLimited[0].body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(rateLimited[0].headers['retry-after']).toBeDefined();
    });
    
    it('should reset rate limits after window', async () => {
      // Exhaust rate limit
      await exhaustRateLimit();
      
      const limitedResponse = await authenticatedRequest()
        .get('/api/v2/dashboards');
      expect(limitedResponse.status).toBe(429);
      
      // Wait for reset
      const resetTime = parseInt(limitedResponse.headers['x-ratelimit-reset']);
      await waitUntil(resetTime * 1000);
      
      const response = await authenticatedRequest()
        .get('/api/v2/dashboards');
      expect(response.status).toBe(200);
    });
    
    it('should have different limits for different tiers', async () => {
      const freeResponse = await freeUserRequest()
        .get('/api/v2/dashboards');
      const proResponse = await proUserRequest()
        .get('/api/v2/dashboards');
      
      const freeLimit = parseInt(freeResponse.headers['x-ratelimit-limit']);
      const proLimit = parseInt(proResponse.headers['x-ratelimit-limit']);
      
      expect(proLimit).toBeGreaterThan(freeLimit);
    });
  });
  
  // GraphQL Tests
  describe('GraphQL API', () => {
    it('should execute dashboard query', async () => {
      const query = `
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
      `;
      
      const response = await authenticatedRequest()
        .post('/api/v2/graphql')
        .send({
          query,
          variables: { id: 'dash_test123' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.dashboard).toMatchObject({
        id: 'dash_test123',
        name: expect.any(String),
        widgets: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            type: expect.any(String),
            title: expect.any(String)
          })
        ])
      });
    });
    
    it('should handle mutations', async () => {
      const mutation = `
        mutation CreateDashboard($input: CreateDashboardInput!) {
          createDashboard(input: $input) {
            dashboard {
              id
              name
            }
            errors {
              code
              message
            }
            success
          }
        }
      `;
      
      const response = await authenticatedRequest()
        .post('/api/v2/graphql')
        .send({
          query: mutation,
          variables: {
            input: {
              name: 'GraphQL Dashboard',
              layout: 'GRID',
              theme: 'DARK'
            }
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.createDashboard.success).toBe(true);
      expect(response.body.data.createDashboard.dashboard.name)
        .toBe('GraphQL Dashboard');
    });
    
    it('should support subscriptions', (done) => {
      const subscription = `
        subscription TaskUpdates {
          taskUpdated {
            id
            status
            updatedAt
          }
        }
      `;
      
      const client = createGraphQLWSClient();
      
      client.subscribe({
        query: subscription
      }, {
        next: (data) => {
          expect(data.taskUpdated).toMatchObject({
            id: expect.any(String),
            status: expect.any(String),
            updatedAt: expect.any(String)
          });
          done();
        },
        error: (err) => done(err),
        complete: () => {}
      });
      
      // Trigger task update
      triggerTaskUpdate('task_test123');
    });
  });
  
  // Error Handling Tests
  describe('Error Handling', () => {
    it('should return consistent error format', async () => {
      const response = await request(app)
        .get('/api/v2/dashboards/invalid_id');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toMatchObject({
        code: 'NOT_FOUND',
        message: expect.any(String),
        timestamp: expect.stringMatching(ISO8601_REGEX),
        path: '/api/v2/dashboards/invalid_id',
        requestId: expect.any(String),
        documentation: expect.stringContaining('docs.flowforge.dev')
      });
    });
    
    it('should handle validation errors with details', async () => {
      const response = await authenticatedRequest()
        .post('/api/v2/dashboards')
        .send({
          // Invalid data
          name: '',
          layout: 'invalid',
          widgets: 'not-an-array'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.validationErrors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            code: 'REQUIRED_FIELD'
          }),
          expect.objectContaining({
            field: 'layout',
            code: 'INVALID_ENUM'
          }),
          expect.objectContaining({
            field: 'widgets',
            code: 'INVALID_TYPE'
          })
        ])
      );
    });
  });
  
  // Versioning Tests
  describe('API Versioning', () => {
    it('should support multiple API versions', async () => {
      const v1Response = await authenticatedRequest()
        .get('/api/v1/dashboards');
      const v2Response = await authenticatedRequest()
        .get('/api/v2/dashboards');
      
      expect(v1Response.status).toBe(200);
      expect(v2Response.status).toBe(200);
      
      // V1 should have deprecation headers
      expect(v1Response.headers['deprecation']).toBe('true');
      expect(v1Response.headers['sunset']).toBeDefined();
    });
    
    it('should provide version discovery', async () => {
      const response = await request(app)
        .get('/api/versions');
      
      expect(response.status).toBe(200);
      expect(response.body.versions).toContainEqual(
        expect.objectContaining({
          version: 'v2',
          status: 'current'
        })
      );
      expect(response.body.recommended).toBe('v2');
    });
  });
  
  // Performance Tests
  describe('Performance Requirements', () => {
    it('should meet response time SLA', async () => {
      const startTime = Date.now();
      const response = await authenticatedRequest()
        .get('/api/v2/dashboards');
      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(100); // p95 target
    });
    
    it('should handle concurrent requests', async () => {
      const concurrentRequests = 100;
      const requests = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          authenticatedRequest().get('/api/v2/dashboards')
        );
      }
      
      const responses = await Promise.all(requests);
      const successfulResponses = responses.filter(r => r.status === 200);
      
      expect(successfulResponses.length).toBeGreaterThan(95); // 95% success rate
    });
  });
});

// Test Helpers
function authenticatedRequest() {
  return request(app).set('Authorization', `Bearer ${validJWT}`);
}

function limitedAuthRequest() {
  return request(app).set('Authorization', `Bearer ${limitedJWT}`);
}

function freeUserRequest() {
  return request(app).set('Authorization', `Bearer ${freeUserJWT}`);
}

function proUserRequest() {
  return request(app).set('Authorization', `Bearer ${proUserJWT}`);
}

async function exhaustRateLimit() {
  const limit = 100;
  const requests = [];
  for (let i = 0; i < limit + 1; i++) {
    requests.push(authenticatedRequest().get('/api/v2/dashboards'));
  }
  await Promise.all(requests);
}

function waitUntil(timestamp) {
  const delay = timestamp - Date.now();
  return new Promise(resolve => setTimeout(resolve, Math.max(0, delay)));
}

const ISO8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
```

## Coverage Requirements

```yaml
coverage:
  target: 80%
  breakdown:
    statements: 85%
    branches: 80%
    functions: 80%
    lines: 85%
  
  critical_paths:
    authentication: 100%
    authorization: 100%
    data_validation: 95%
    error_handling: 90%
    rate_limiting: 95%
  
  excluded:
    - "test/**"
    - "mocks/**"
    - "*.spec.js"
    - "*.test.js"
```

## Contract Testing with Pact

```javascript
// Pact Consumer Test
const { Pact } = require('@pact-foundation/pact');
const path = require('path');

describe('Dashboard API Consumer', () => {
  const provider = new Pact({
    consumer: 'FlowForge Dashboard UI',
    provider: 'FlowForge API',
    port: 1234,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'INFO'
  });
  
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());
  
  describe('Dashboard List', () => {
    it('should return dashboard list', async () => {
      await provider.addInteraction({
        state: 'user has 3 dashboards',
        uponReceiving: 'a request for dashboard list',
        withRequest: {
          method: 'GET',
          path: '/api/v2/dashboards',
          headers: {
            'Authorization': Matchers.regex(/Bearer .+/, 'Bearer token123')
          }
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            data: Matchers.eachLike({
              id: Matchers.regex(/^dash_[a-zA-Z0-9]+$/, 'dash_abc123'),
              name: Matchers.string('My Dashboard'),
              workspace: Matchers.string('ws_123'),
              createdAt: Matchers.iso8601DateTime(),
              updatedAt: Matchers.iso8601DateTime()
            }, { min: 1 }),
            pagination: {
              page: Matchers.integer(1),
              limit: Matchers.integer(20),
              total: Matchers.integer(3),
              totalPages: Matchers.integer(1),
              hasNext: Matchers.boolean(false),
              hasPrev: Matchers.boolean(false)
            }
          }
        }
      });
      
      const response = await dashboardAPI.listDashboards();
      expect(response.data).toHaveLength(3);
    });
  });
});

// Pact Provider Verification
describe('Dashboard API Provider', () => {
  it('should verify consumer contracts', async () => {
    const opts = {
      provider: 'FlowForge API',
      providerBaseUrl: 'http://localhost:3000',
      pactUrls: [
        path.resolve(__dirname, '../pacts/flowforge_dashboard_ui-flowforge_api.json')
      ],
      stateHandlers: {
        'user has 3 dashboards': async () => {
          await seedDatabase({
            dashboards: [
              { id: 'dash_001', name: 'Dashboard 1' },
              { id: 'dash_002', name: 'Dashboard 2' },
              { id: 'dash_003', name: 'Dashboard 3' }
            ]
          });
        }
      },
      requestFilter: (req, res, next) => {
        req.headers['authorization'] = 'Bearer valid-test-token';
        next();
      }
    };
    
    await new Verifier(opts).verifyProvider();
  });
});
```

---

## Test Execution Strategy

1. **Unit Tests**: Run on every commit
2. **Integration Tests**: Run on PR creation
3. **Contract Tests**: Run before deployment
4. **Performance Tests**: Run nightly
5. **Security Tests**: Run weekly
6. **Load Tests**: Run before major releases

The comprehensive test suite ensures API reliability, performance, and security compliance.