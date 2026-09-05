const request = require('supertest');
const { setupTestDB, clearDatabase, teardownTestDB, app } = require('./helpers');

describe('Projects & RBAC', () => {
  let token, userId;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  async function registerAndLogin(name = 'Test User', email = 'test@example.com') {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name, email, password: 'password123' });
    return { token: res.body.data.token, userId: res.body.data.user.id };
  }

  describe('Project CRUD', () => {
    beforeEach(async () => {
      const data = await registerAndLogin();
      token = data.token;
      userId = data.userId;
    });

    it('should create a project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'My Project', description: 'A test project' });

      expect(res.status).toBe(201);
      expect(res.body.data.project.name).toBe('My Project');
      expect(res.body.data.project.slug).toBe('my-project');
    });

    it('should list projects for authenticated user', async () => {
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Project 1' });

      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Project 2' });

      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.projects).toHaveLength(2);
    });

    it('should get a project by ID', async () => {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Detail Project' });

      const projectId = createRes.body.data.project._id;

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.project.name).toBe('Detail Project');
      expect(res.body.data.role).toBe('owner');
    });

    it('should update a project', async () => {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Name' });

      const projectId = createRes.body.data.project._id;

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.project.name).toBe('New Name');
    });

    it('should delete a project', async () => {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Delete Me' });

      const projectId = createRes.body.data.project._id;

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should not create project without auth', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({ name: 'No Auth' });

      expect(res.status).toBe(401);
    });
  });

  describe('Project Authorization', () => {
    it('should prevent user B from accessing user A\'s project', async () => {
      const userA = await registerAndLogin('User A', 'usera@test.com');
      const userB = await registerAndLogin('User B', 'userb@test.com');

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userA.token}`)
        .send({ name: 'Private Project' });

      const projectId = createRes.body.data.project._id;

      // User B tries to access User A's project
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${userB.token}`);

      expect(res.status).toBe(403);
    });

    it('should prevent non-owner from deleting project', async () => {
      const owner = await registerAndLogin('Owner', 'owner@test.com');
      const member = await registerAndLogin('Member', 'member@test.com');

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ name: 'Owner Project' });

      const projectId = createRes.body.data.project._id;

      // Add member as developer
      await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ email: 'member@test.com', role: 'developer' });

      // Developer tries to delete
      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${member.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('RBAC Members', () => {
    let ownerToken, projectId;

    beforeEach(async () => {
      const owner = await registerAndLogin('Owner', 'owner@test.com');
      ownerToken = owner.token;

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'RBAC Project' });

      projectId = createRes.body.data.project._id;
    });

    it('should add a member', async () => {
      await registerAndLogin('Dev', 'dev@test.com');

      const res = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'dev@test.com', role: 'developer' });

      expect(res.status).toBe(201);
      expect(res.body.data.membership.role).toBe('developer');
    });

    it('should list members', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.members.length).toBeGreaterThanOrEqual(1);
    });

    it('should prevent viewer from managing collections', async () => {
      const viewer = await registerAndLogin('Viewer', 'viewer@test.com');

      await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'viewer@test.com', role: 'viewer' });

      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${viewer.token}`)
        .send({
          name: 'products',
          fields: [{ name: 'title', type: 'string', required: true }],
        });

      expect(res.status).toBe(403);
    });

    it('should prevent developer from managing API keys', async () => {
      const dev = await registerAndLogin('Dev', 'dev@test.com');

      await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'dev@test.com', role: 'developer' });

      const res = await request(app)
        .post(`/api/projects/${projectId}/api-keys`)
        .set('Authorization', `Bearer ${dev.token}`)
        .send({ name: 'Test Key' });

      expect(res.status).toBe(403);
    });

    it('should allow developer to manage collections', async () => {
      const dev = await registerAndLogin('Dev', 'dev@test.com');

      await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'dev@test.com', role: 'developer' });

      const res = await request(app)
        .post(`/api/projects/${projectId}/collections`)
        .set('Authorization', `Bearer ${dev.token}`)
        .send({
          name: 'products',
          fields: [{ name: 'title', type: 'string', required: true }],
        });

      expect(res.status).toBe(201);
    });

    it('should prevent viewer from updating project', async () => {
      const viewer = await registerAndLogin('Viewer2', 'viewer2@test.com');

      await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'viewer2@test.com', role: 'viewer' });

      const res = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${viewer.token}`)
        .send({ name: 'Hacked Name' });

      expect(res.status).toBe(403);
    });

    it('should prevent viewer from deleting project', async () => {
      const viewer = await registerAndLogin('Viewer3', 'viewer3@test.com');

      await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'viewer3@test.com', role: 'viewer' });

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${viewer.token}`);

      expect(res.status).toBe(403);
    });
  });
});
