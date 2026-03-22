const request = require('supertest');
const db = require('./setup');
const app = require('../index');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

const AUTH_HEADER = 'test-password';

describe('POST /api/auth/login', () => {
  it('returns 200 with ok:true for correct password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: AUTH_HEADER });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('returns 401 with ok:false for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it('returns 401 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(401);
  });
});
