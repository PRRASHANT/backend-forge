const request = require('supertest');
const { setupTestDB, clearDatabase, teardownTestDB, app } = require('./helpers');

describe('Collections & Schema', () => {
  let token, projectId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'password123' });
    token = regRes.body.data.token;

    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project' });
    projectId = projRes.body.data.project._id;
  });

  describe('Collection CRUD', () => {
    it('should create a collection with valid fields', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Products',
          fields: [
            { name: 'title', type: 'string', required: true, maxLength: 200 },
            { name: 'price', type: 'number', required: true, min: 0 },
            { name: 'inStock', type: 'boolean', default: true },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.collection.name).toBe('Products');
      expect(res.body.data.collection.slug).toBe('products');
      expect(res.body.data.collection.fields).toHaveLength(3);
    });

    it('should reject duplicate collection name in same project', async () => {
      await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Products',
          fields: [{ name: 'title', type: 'string', required: true }],
        });

      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Products',
          fields: [{ name: 'name', type: 'string', required: true }],
        });

      expect(res.status).toBe(409);
    });

    it('should reject reserved collection name', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'users',
          fields: [{ name: 'name', type: 'string', required: true }],
        });

      expect(res.status).toBe(400);
    });

    it('should reject empty fields', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Empty', fields: [] });

      expect(res.status).toBe(422);
    });

    it('should reject unsupported field type', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Bad',
          fields: [{ name: 'x', type: 'notaType' }],
        });

      expect(res.status).toBe(422);
    });

    it('should list collections', async () => {
      await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Products',
          fields: [{ name: 'title', type: 'string', required: true }],
        });

      const res = await request(app)
        .get(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.collections).toHaveLength(1);
    });

    it('should update collection fields', async () => {
      const createRes = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Products',
          fields: [{ name: 'title', type: 'string', required: true }],
        });

      const collectionId = createRes.body.data.collection._id;

      const res = await request(app)
        .patch(`/api/projects/${projectId}/collections/${collectionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          fields: [
            { name: 'title', type: 'string', required: true },
            { name: 'price', type: 'number', required: true },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.collection.fields).toHaveLength(2);
    });

    it('should delete a collection', async () => {
      const createRes = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Deletable',
          fields: [{ name: 'x', type: 'string' }],
        });

      const collectionId = createRes.body.data.collection._id;

      const res = await request(app)
        .delete(`/api/projects/${projectId}/collections/${collectionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Field Type Validation', () => {
    it('should reject enum without enumValues', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Enums',
          fields: [{ name: 'status', type: 'enum' }],
        });

      expect(res.status).toBe(422);
    });

    it('should accept all 12 field types', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'AllTypes',
          fields: [
            { name: 'f_string', type: 'string' },
            { name: 'f_number', type: 'number' },
            { name: 'f_integer', type: 'integer' },
            { name: 'f_boolean', type: 'boolean' },
            { name: 'f_date', type: 'date' },
            { name: 'f_email', type: 'email' },
            { name: 'f_url', type: 'url' },
            { name: 'f_enum', type: 'enum', enumValues: ['a', 'b', 'c'] },
            { name: 'f_array', type: 'array', itemType: 'string' },
            { name: 'f_object', type: 'object' },
            { name: 'f_reference', type: 'reference' },
            { name: 'f_decimal', type: 'decimal' },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.collection.fields).toHaveLength(12);
    });

    it('should reject duplicate field names', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Dupes',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'title', type: 'number' },
          ],
        });

      expect(res.status).toBe(422);
    });

    it('should reject reserved field name _id', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Reserved',
          fields: [{ name: '_id', type: 'string' }],
        });

      expect(res.status).toBe(422);
    });
  });
});
