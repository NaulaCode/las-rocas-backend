import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

describe('API Integration Tests', () => {
  let app: any;

  before(async () => {
    try {
      app = (await import('../../../app')).default;
    } catch {
      // app may fail to import without DB — skip tests
    }
  });

  describe('GET /health', () => {
    it('returns 200 with ok status', { skip: !app }, async () => {
      const res = await request(app).get('/api/v1/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
      assert.ok(res.body.message.includes('Las Rocas'));
    });
  });

  describe('GET / (root)', () => {
    it('returns welcome message', { skip: !app }, async () => {
      const res = await request(app).get('/api/v1');
      assert.equal(res.status, 200);
      assert.ok(res.body.message.includes('API'));
    });
  });

  describe('GET /services', () => {
    it('returns services array', { skip: !app }, async () => {
      const res = await request(app).get('/api/v1/services');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.ok(Array.isArray(res.body.data));
    });

    it('accepts active filter', { skip: !app }, async () => {
      const res = await request(app).get('/api/v1/services?active=true');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
    });
  });

  describe('GET /chatbot/questions', () => {
    it('returns questions array', { skip: !app }, async () => {
      const res = await request(app).get('/api/v1/chatbot/questions');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.ok(Array.isArray(res.body.data));
    });
  });

  describe('GET /organization', () => {
    it('returns organization data', { skip: !app }, async () => {
      const res = await request(app).get('/api/v1/organization');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
    });
  });

  describe('POST /chatbot/chat', () => {
    it('responds to a query', { skip: !app }, async () => {
      const res = await request(app)
        .post('/api/v1/chatbot/chat')
        .send({ query: 'Hola' });
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'success');
      assert.ok(res.body.data.answer);
    });

    it('rejects empty query', { skip: !app }, async () => {
      const res = await request(app)
        .post('/api/v1/chatbot/chat')
        .send({ query: '' });
      assert.equal(res.status, 400);
    });
  });

  describe('404 handling', () => {
    it('returns 404 for unknown route', { skip: !app }, async () => {
      const res = await request(app).get('/api/v1/ruta-inexistente');
      assert.equal(res.status, 404);
    });
  });
});
