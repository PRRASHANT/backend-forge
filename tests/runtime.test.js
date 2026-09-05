const request = require('supertest');
const { setupTestDB, clearDatabase, teardownTestDB, app } = require('./helpers');

describe('Runtime API, API Keys & Tenant Isolation', () => {
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

  async function setupProjectWithCollection() {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'password123' });
    token = regRes.body.data.token;

    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Ecommerce' });
    projectId = projRes.body.data.project._id;

    // Create products collection
    await request(app)
      .post(`/api/projects/${projectId}/collections`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'products',
        fields: [
          { name: 'name', type: 'string', required: true, maxLength: 200 },
          { name: 'price', type: 'number', required: true, min: 0 },
          { name: 'description', type: 'string' },
          { name: 'inStock', type: 'boolean', default: true },
          { name: 'category', type: 'enum', enumValues: ['electronics', 'clothing', 'food'] },
          { name: 'email', type: 'email' },
          { name: 'website', type: 'url' },
          { name: 'quantity', type: 'integer', min: 0 },
          { name: 'tags', type: 'array', itemType: 'string' },
          { name: 'metadata', type: 'object' },
        ],
      });

    // Create API key
    const keyRes = await request(app)
      .post(`/api/projects/${projectId}/api-keys`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Key' });

    apiKey = keyRes.body.data.apiKey.rawKey;
  }

  describe('API Key Management', () => {
    beforeEach(setupProjectWithCollection);

    it('should create an API key and return raw key once', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/api-keys`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Key' });

      expect(res.status).toBe(201);
      expect(res.body.data.apiKey.rawKey).toBeDefined();
      expect(res.body.data.apiKey.rawKey).toMatch(/^bf_sk_/);
      expect(res.body.data.warning).toBeDefined();
    });

    it('should list API keys without raw keys or hashes', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/api-keys`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.apiKeys.length).toBeGreaterThanOrEqual(1);
      // Verify no raw keys or hashes are leaked
      for (const key of res.body.data.apiKeys) {
        expect(key.rawKey).toBeUndefined();
        expect(key.keyHash).toBeUndefined();
      }
    });

    it('should revoke an API key', async () => {
      const keyRes = await request(app)
        .post(`/api/projects/${projectId}/api-keys`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Revocable' });

      const revokeRes = await request(app)
        .patch(`/api/projects/${projectId}/api-keys/${keyRes.body.data.apiKey.id}/revoke`)
        .set('Authorization', `Bearer ${token}`);

      expect(revokeRes.status).toBe(200);

      // Try using revoked key
      const runtimeRes = await request(app)
        .get(`/api/v1/${projectId}/products`)
        .set('X-API-Key', keyRes.body.data.apiKey.rawKey);

      expect(runtimeRes.status).toBe(401);
    });
  });

  describe('Runtime CRUD', () => {
    beforeEach(setupProjectWithCollection);

    it('should create a document', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Laptop', price: 999.99, category: 'electronics' });

      expect(res.status).toBe(201);
      expect(res.body.data.document.name).toBe('Laptop');
      expect(res.body.data.document.price).toBe(999.99);
      expect(res.body.data.document._id).toBeDefined();
    });

    it('should list documents with pagination', async () => {
      // Create multiple
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post(`/api/v1/${projectId}/products`)
          .set('X-API-Key', apiKey)
          .send({ name: `Product ${i}`, price: 10 + i });
      }

      const res = await request(app)
        .get(`/api/v1/${projectId}/products?page=1&limit=2`)
        .set('X-API-Key', apiKey);

      expect(res.status).toBe(200);
      expect(res.body.data.documents).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(3);
      expect(res.body.data.pagination.pages).toBe(2);
    });

    it('should get a document by ID', async () => {
      const createRes = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Phone', price: 499 });

      const docId = createRes.body.data.document._id;

      const res = await request(app)
        .get(`/api/v1/${projectId}/products/${docId}`)
        .set('X-API-Key', apiKey);

      expect(res.status).toBe(200);
      expect(res.body.data.document.name).toBe('Phone');
    });

    it('should update a document', async () => {
      const createRes = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Old Name', price: 100 });

      const docId = createRes.body.data.document._id;

      const res = await request(app)
        .patch(`/api/v1/${projectId}/products/${docId}`)
        .set('X-API-Key', apiKey)
        .send({ name: 'New Name', price: 150 });

      expect(res.status).toBe(200);
      expect(res.body.data.document.name).toBe('New Name');
      expect(res.body.data.document.price).toBe(150);
    });

    it('should delete a document', async () => {
      const createRes = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Delete Me', price: 50 });

      const docId = createRes.body.data.document._id;

      const res = await request(app)
        .delete(`/api/v1/${projectId}/products/${docId}`)
        .set('X-API-Key', apiKey);

      expect(res.status).toBe(200);

      // Verify deleted
      const getRes = await request(app)
        .get(`/api/v1/${projectId}/products/${docId}`)
        .set('X-API-Key', apiKey);

      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/v1/${projectId}/products/${fakeId}`)
        .set('X-API-Key', apiKey);

      expect(res.status).toBe(404);
    });

    it('should return 404 for unknown collection', async () => {
      const res = await request(app)
        .get(`/api/v1/${projectId}/nonexistent`)
        .set('X-API-Key', apiKey);

      expect(res.status).toBe(404);
    });

    it('should reject request without API key', async () => {
      const res = await request(app)
        .get(`/api/v1/${projectId}/products`);

      expect(res.status).toBe(401);
    });

    it('should reject request with invalid API key', async () => {
      const res = await request(app)
        .get(`/api/v1/${projectId}/products`)
        .set('X-API-Key', 'bf_sk_invalidkey12345678');

      expect(res.status).toBe(401);
    });
  });

  describe('Runtime Validation', () => {
    beforeEach(setupProjectWithCollection);

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ description: 'No name or price' });

      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('required');
    });

    it('should reject wrong type for number field', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Test', price: 'not a number' });

      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('number');
    });

    it('should reject invalid enum value', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Test', price: 10, category: 'invalid-category' });

      expect(res.status).toBe(422);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Test', price: 10, email: 'not-an-email' });

      expect(res.status).toBe(422);
    });

    it('should reject invalid URL', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Test', price: 10, website: 'not-a-url' });

      expect(res.status).toBe(422);
    });

    it('should reject non-integer for integer field', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Test', price: 10, quantity: 3.5 });

      expect(res.status).toBe(422);
    });

    it('should reject non-array for array field', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Test', price: 10, tags: 'not-an-array' });

      expect(res.status).toBe(422);
    });

    it('should reject non-object for object field', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Test', price: 10, metadata: 'not-an-object' });

      expect(res.status).toBe(422);
    });

    it('should reject unknown fields', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Test', price: 10, unknownField: 'value' });

      expect(res.status).toBe(422);
    });

    it('should reject negative price (min validation)', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({ name: 'Test', price: -5 });

      expect(res.status).toBe(422);
    });

    it('should accept valid data with all field types', async () => {
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', apiKey)
        .send({
          name: 'Full Product',
          price: 29.99,
          description: 'A complete product',
          inStock: true,
          category: 'electronics',
          email: 'vendor@example.com',
          website: 'https://example.com',
          quantity: 100,
          tags: ['new', 'sale'],
          metadata: { color: 'red', weight: 1.5 },
        });

      expect(res.status).toBe(201);
    });
  });

  describe('Tenant Isolation', () => {
    it('should prevent Project A from accessing Project B data', async () => {
      // Setup Project A
      const userARes = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User A', email: 'usera@test.com', password: 'password123' });
      const tokenA = userARes.body.data.token;

      const projARes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Project A' });
      const projectAId = projARes.body.data.project._id;

      await request(app)
        .post(`/api/projects/${projectAId}/collections`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          name: 'products',
          fields: [{ name: 'name', type: 'string', required: true }],
        });

      const keyARes = await request(app)
        .post(`/api/projects/${projectAId}/api-keys`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Key A' });
      const apiKeyA = keyARes.body.data.apiKey.rawKey;

      // Setup Project B
      const userBRes = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User B', email: 'userb@test.com', password: 'password123' });
      const tokenB = userBRes.body.data.token;

      const projBRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Project B' });
      const projectBId = projBRes.body.data.project._id;

      await request(app)
        .post(`/api/projects/${projectBId}/collections`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          name: 'products',
          fields: [{ name: 'name', type: 'string', required: true }],
        });

      const keyBRes = await request(app)
        .post(`/api/projects/${projectBId}/api-keys`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Key B' });
      const apiKeyB = keyBRes.body.data.apiKey.rawKey;

      // Create data in Project A
      await request(app)
        .post(`/api/v1/${projectAId}/products`)
        .set('X-API-Key', apiKeyA)
        .send({ name: 'Product A' });

      // Create data in Project B
      const docBRes = await request(app)
        .post(`/api/v1/${projectBId}/products`)
        .set('X-API-Key', apiKeyB)
        .send({ name: 'Product B' });
      const docBId = docBRes.body.data.document._id;

      // Project A reads — should only see its own data
      const resA = await request(app)
        .get(`/api/v1/${projectAId}/products`)
        .set('X-API-Key', apiKeyA);

      expect(resA.status).toBe(200);
      expect(resA.body.data.documents).toHaveLength(1);
      expect(resA.body.data.documents[0].name).toBe('Product A');

      // Project B reads — should only see its own data
      const resB = await request(app)
        .get(`/api/v1/${projectBId}/products`)
        .set('X-API-Key', apiKeyB);

      expect(resB.status).toBe(200);
      expect(resB.body.data.documents).toHaveLength(1);
      expect(resB.body.data.documents[0].name).toBe('Product B');

      // Project A tries to access Project B's data with A's key (GET)
      const crossRes = await request(app)
        .get(`/api/v1/${projectBId}/products`)
        .set('X-API-Key', apiKeyA);

      expect(crossRes.status).toBe(403);

      // Project B tries to access Project A's data with B's key (GET)
      const crossRes2 = await request(app)
        .get(`/api/v1/${projectAId}/products`)
        .set('X-API-Key', apiKeyB);

      expect(crossRes2.status).toBe(403);

      // Cross-tenant POST: A's key tries to create in B's project
      const crossPost = await request(app)
        .post(`/api/v1/${projectBId}/products`)
        .set('X-API-Key', apiKeyA)
        .send({ name: 'Injected' });

      expect(crossPost.status).toBe(403);

      // Cross-tenant PATCH: A's key tries to update B's document
      const crossPatch = await request(app)
        .patch(`/api/v1/${projectBId}/products/${docBId}`)
        .set('X-API-Key', apiKeyA)
        .send({ name: 'Hacked' });

      expect(crossPatch.status).toBe(403);

      // Cross-tenant DELETE: A's key tries to delete B's document
      const crossDelete = await request(app)
        .delete(`/api/v1/${projectBId}/products/${docBId}`)
        .set('X-API-Key', apiKeyA);

      expect(crossDelete.status).toBe(403);
    });
  });

  describe('Revoked Key Write Prevention', () => {
    beforeEach(setupProjectWithCollection);

    it('should reject POST with revoked API key', async () => {
      // Create a second key to revoke
      const keyRes = await request(app)
        .post(`/api/projects/${projectId}/api-keys`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Revocable Write Key' });

      const revokeableKey = keyRes.body.data.apiKey.rawKey;
      const revokeableKeyId = keyRes.body.data.apiKey.id;

      // Revoke it
      await request(app)
        .patch(`/api/projects/${projectId}/api-keys/${revokeableKeyId}/revoke`)
        .set('Authorization', `Bearer ${token}`);

      // Try to POST with revoked key
      const res = await request(app)
        .post(`/api/v1/${projectId}/products`)
        .set('X-API-Key', revokeableKey)
        .send({ name: 'Should Fail', price: 10 });

      expect(res.status).toBe(401);
    });
  });

  describe('Additional Field Type Runtime Validation', () => {
    let dateToken, dateProjectId, dateApiKey;

    beforeEach(async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({ name: 'TypeTest', email: 'typetest@test.com', password: 'password123' });
      dateToken = regRes.body.data.token;

      const projRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${dateToken}`)
        .send({ name: 'Type Test Project' });
      dateProjectId = projRes.body.data.project._id;

      await request(app)
        .post(`/api/projects/${dateProjectId}/collections`)
        .set('Authorization', `Bearer ${dateToken}`)
        .send({
          name: 'typed-items',
          fields: [
            { name: 'title', type: 'string', required: true },
            { name: 'publishedAt', type: 'date' },
            { name: 'relatedId', type: 'reference' },
            { name: 'precisePrice', type: 'decimal' },
          ],
        });

      const keyRes = await request(app)
        .post(`/api/projects/${dateProjectId}/api-keys`)
        .set('Authorization', `Bearer ${dateToken}`)
        .send({ name: 'Type Key' });
      dateApiKey = keyRes.body.data.apiKey.rawKey;
    });

    it('should reject invalid date value', async () => {
      const res = await request(app)
        .post(`/api/v1/${dateProjectId}/typed-items`)
        .set('X-API-Key', dateApiKey)
        .send({ title: 'Test', publishedAt: 'not-a-date' });

      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('date');
    });

    it('should accept valid date value', async () => {
      const res = await request(app)
        .post(`/api/v1/${dateProjectId}/typed-items`)
        .set('X-API-Key', dateApiKey)
        .send({ title: 'Test', publishedAt: '2024-01-15T10:00:00.000Z' });

      expect(res.status).toBe(201);
    });

    it('should reject invalid reference ObjectId', async () => {
      const res = await request(app)
        .post(`/api/v1/${dateProjectId}/typed-items`)
        .set('X-API-Key', dateApiKey)
        .send({ title: 'Test', relatedId: 'not-an-objectid' });

      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('ObjectId');
    });

    it('should accept valid reference ObjectId', async () => {
      const res = await request(app)
        .post(`/api/v1/${dateProjectId}/typed-items`)
        .set('X-API-Key', dateApiKey)
        .send({ title: 'Test', relatedId: '507f1f77bcf86cd799439011' });

      expect(res.status).toBe(201);
    });

    it('should reject non-number for decimal field', async () => {
      const res = await request(app)
        .post(`/api/v1/${dateProjectId}/typed-items`)
        .set('X-API-Key', dateApiKey)
        .send({ title: 'Test', precisePrice: 'abc' });

      expect(res.status).toBe(422);
      expect(res.body.error.message).toContain('number');
    });

    it('should accept valid decimal value', async () => {
      const res = await request(app)
        .post(`/api/v1/${dateProjectId}/typed-items`)
        .set('X-API-Key', dateApiKey)
        .send({ title: 'Test', precisePrice: 19.99 });

      expect(res.status).toBe(201);
    });
  });
});

