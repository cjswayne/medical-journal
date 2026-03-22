const request = require('supertest');
const db = require('./setup');
const app = require('../index');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

const AUTH_HEADER = 'test-password';

const DEFAULT_NAMES = [
  'Citrusy', 'Floral', 'Fruity', 'Herbal', 'Musky',
  'Nutty', 'Pungent', 'Spicy', 'Sweet', 'Woody',
];

const postOption = (body) =>
  request(app)
    .post('/api/options')
    .set('x-auth-password', AUTH_HEADER)
    .send(body);

describe('Options API', () => {
  it('returns default aroma options', async () => {
    const res = await request(app).get('/api/options?type=aroma');

    expect(res.status).toBe(200);
    const names = res.body.options.map((o) => o.name);
    for (const name of DEFAULT_NAMES) {
      expect(names).toContain(name);
    }
  });

  it('returns default flavor options', async () => {
    const res = await request(app).get('/api/options?type=flavor');

    expect(res.status).toBe(200);
    const names = res.body.options.map((o) => o.name);
    for (const name of DEFAULT_NAMES) {
      expect(names).toContain(name);
    }
  });

  it('adds custom aroma', async () => {
    const res = await postOption({ type: 'aroma', name: 'Diesel' });

    expect(res.status).toBe(201);
    expect(res.body.option.name).toBe('Diesel');
  });

  it('adds custom flavor', async () => {
    const res = await postOption({ type: 'flavor', name: 'Chocolate' });

    expect(res.status).toBe(201);
    expect(res.body.option.name).toBe('Chocolate');
  });

  it('custom aroma appears in GET', async () => {
    await postOption({ type: 'aroma', name: 'Diesel' });

    const res = await request(app).get('/api/options?type=aroma');

    expect(res.status).toBe(200);
    const names = res.body.options.map((o) => o.name);
    expect(names).toContain('Diesel');
  });

  it('rejects duplicate custom option', async () => {
    await postOption({ type: 'aroma', name: 'Diesel' });

    const res = await postOption({ type: 'aroma', name: 'Diesel' });

    expect(res.status).toBe(409);
  });

  it('rejects add without auth', async () => {
    const res = await request(app)
      .post('/api/options')
      .send({ type: 'aroma', name: 'Gas' });

    expect(res.status).toBe(401);
  });
});
