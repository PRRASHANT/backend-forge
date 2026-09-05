const request = require('supertest');
const { setupTestDB, clearDatabase, teardownTestDB, app } = require('./helpers');

describe('Logs, Analytics & Health', () => {
  let token, projectId, apiKey;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  async function setupFull() {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'password123' });
    token = regRes.body.data.token;

    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Analytics Project' });
    projectId = projRes.body.data.project._id;

    await request(app)
      .post(`/api/projects/${projectId}/collections`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'items',
        fields: [{ name: 'name', type: 'string', required: true }],
      });

    const keyRes = await request(app)
      .post(`/api/projects/${projectId}/api-keys`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Log Key' });
    apiKey = keyRes.body.data.apiKey.rawKey;
  }

  describe('Health Endpoint', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.uptime).toBeDefined();
    });
  });

  describe('Request Logging', () => {
    beforeEach(setupFull);

    it('should log runtime requests', async () => {
      // Make some runtime requests
      await request(app)
        .post(`/api/v1/${projectId}/items`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Logged Item' });

      await request(app)
        .get(`/api/v1/${projectId}/items`)
        .set('X-API-Key', apiKey);

      // Wait briefly for async logs
      await new Promise((r) => setTimeout(r, 200));

      const res = await request(app)
        .get(`/api/projects/${projectId}/logs`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.logs.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.pagination).toBeDefined();

      // Verify logs only contain the short prefix, not the full 70-char key
      for (const log of res.body.data.logs) {
        expect(log.apiKeyPrefix).toBeDefined();
        expect(log.apiKeyPrefix.length).toBeLessThanOrEqual(12);
        // Full raw key is ~70 chars; prefix is 12. Verify no long key is stored.
        const logStr = JSON.stringify(log);
        // The log should NOT contain any string longer than 12 chars that starts with bf_sk_
        const fullKeyPattern = /bf_sk_[a-f0-9]{20,}/;
        expect(fullKeyPattern.test(logStr)).toBe(false);
      }
    });

    it('should paginate logs', async () => {
      // Generate some logs
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get(`/api/v1/${projectId}/items`)
          .set('X-API-Key', apiKey);
      }

      await new Promise((r) => setTimeout(r, 200));

      const res = await request(app)
        .get(`/api/projects/${projectId}/logs?page=1&limit=2`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.logs.length).toBeLessThanOrEqual(2);
      expect(res.body.data.pagination.pages).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Analytics', () => {
    beforeEach(setupFull);

    it('should return real analytics from actual requests', async () => {
      // Make various requests
      await request(app)
        .post(`/api/v1/${projectId}/items`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Item 1' });

      await request(app)
        .post(`/api/v1/${projectId}/items`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Item 2' });

      await request(app)
        .get(`/api/v1/${projectId}/items`)
        .set('X-API-Key', apiKey);

      await new Promise((r) => setTimeout(r, 200));

      const res = await request(app)
        .get(`/api/projects/${projectId}/analytics`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const analytics = res.body.data.analytics;
      expect(analytics.totalRequests).toBeGreaterThanOrEqual(3);
      expect(analytics.successRate).toBeDefined();
      expect(analytics.requestsByMethod).toBeDefined();
      expect(analytics.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return empty analytics for new project', async () => {
      // Create a new project with no runtime requests
      const projRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Empty Project' });
      const emptyProjectId = projRes.body.data.project._id;

      const res = await request(app)
        .get(`/api/projects/${emptyProjectId}/analytics`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.analytics.totalRequests).toBe(0);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
