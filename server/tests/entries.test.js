const request = require('supertest');
const mongoose = require('mongoose');
const db = require('./setup');
const app = require('../index');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

const AUTH_HEADER = 'test-password';

const makeEntry = (overrides = {}) => ({
  productName: 'Test Strain',
  strains: [{ name: 'OG Kush', type: 'indica' }],
  ...overrides,
});

const post = (body) =>
  request(app)
    .post('/api/entries')
    .set('x-auth-password', AUTH_HEADER)
    .send(body);

describe('Entries API', () => {
  // -- CRUD -----------------------------------------------------------------

  it('creates entry with valid data', async () => {
    const res = await post(makeEntry());

    expect(res.status).toBe(201);
    expect(res.body.entry._id).toBeDefined();
    expect(res.body.entry.productName).toBe('Test Strain');
  });

  it('rejects create without auth', async () => {
    const res = await request(app)
      .post('/api/entries')
      .send(makeEntry());

    expect(res.status).toBe(401);
  });

  it('rejects create missing productName', async () => {
    const res = await post(makeEntry({ productName: '' }));

    expect(res.status).toBe(400);
  });

  it('lists entries with condensed fields', async () => {
    await post(makeEntry({ productName: 'Entry A' }));
    await post(makeEntry({ productName: 'Entry B' }));

    const res = await request(app).get('/api/entries');

    expect(res.status).toBe(200);
    expect(res.body.entries).toHaveLength(2);

    const entry = res.body.entries[0];
    expect(entry._id).toBeDefined();
    expect(entry.productName).toBeDefined();
    expect(entry.flowerImageUrl).toBeDefined();
    expect(entry.terpenes).toBeDefined();
    expect(entry.createdAt).toBeDefined();
    // Condensed projection should omit heavyweight fields
    expect(entry.brand).toBeUndefined();
    expect(entry.effects).toBeUndefined();
  });

  it('paginates correctly', async () => {
    for (let i = 0; i < 3; i++) {
      await post(makeEntry({ productName: `Strain ${i}` }));
    }

    const res = await request(app).get('/api/entries?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.pages).toBe(2);
    expect(res.body.entries).toHaveLength(2);
  });

  it('gets single entry with full data', async () => {
    const createRes = await post(
      makeEntry({ brand: 'TestBrand', effects: { painRelief: 5 } })
    );
    const { _id } = createRes.body.entry;

    const res = await request(app).get(`/api/entries/${_id}`);

    expect(res.status).toBe(200);
    expect(res.body.entry.productName).toBe('Test Strain');
    expect(res.body.entry.brand).toBe('TestBrand');
    expect(res.body.entry.effects).toBeDefined();
  });

  it('returns 404 for non-existent entry', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/entries/${fakeId}`);

    expect(res.status).toBe(404);
  });

  it('updates entry with auth', async () => {
    const createRes = await post(makeEntry());
    const { _id } = createRes.body.entry;

    const res = await request(app)
      .put(`/api/entries/${_id}`)
      .set('x-auth-password', AUTH_HEADER)
      .send({ brand: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.entry.brand).toBe('Updated');
  });

  it('rejects update without auth', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/entries/${fakeId}`)
      .send({ brand: 'Updated' });

    expect(res.status).toBe(401);
  });

  it('deletes entry with auth', async () => {
    const createRes = await post(makeEntry());
    const { _id } = createRes.body.entry;

    const delRes = await request(app)
      .delete(`/api/entries/${_id}`)
      .set('x-auth-password', AUTH_HEADER);

    expect(delRes.status).toBe(200);
    expect(delRes.body.ok).toBe(true);

    const getRes = await request(app).get(`/api/entries/${_id}`);
    expect(getRes.status).toBe(404);
  });

  it('rejects delete without auth', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/entries/${fakeId}`);

    expect(res.status).toBe(401);
  });

  // -- Search ---------------------------------------------------------------

  it('searches entries', async () => {
    await post(makeEntry({ productName: 'Purple Haze' }));

    const res = await request(app).get('/api/entries/search?q=Purple');

    expect(res.status).toBe(200);
    expect(res.body.entries.length).toBeGreaterThanOrEqual(1);
    expect(res.body.entries[0].productName).toBe('Purple Haze');
  });

  // -- Validation -----------------------------------------------------------

  it('validates strain type enum', async () => {
    const res = await post(
      makeEntry({ strains: [{ name: 'X', type: 'invalid' }] })
    );

    expect(res.status).toBe(400);
  });

  it('validates cannabisForm enum', async () => {
    const res = await post(makeEntry({ cannabisForm: 'invalid' }));

    expect(res.status).toBe(400);
  });

  it('validates consumptionMethod enum', async () => {
    const res = await post(makeEntry({ consumptionMethod: 'invalid' }));

    expect(res.status).toBe(400);
  });

  it('validates aroma strength range', async () => {
    const res = await post(
      makeEntry({ aromas: [{ name: 'Test', strength: 15 }] })
    );

    expect(res.status).toBe(400);
  });

  it('validates flavor strength range', async () => {
    const res = await post(
      makeEntry({ flavors: [{ name: 'Test', strength: 0 }] })
    );

    expect(res.status).toBe(400);
  });

  it('validates effects range', async () => {
    const res = await post(makeEntry({ effects: { painRelief: 11 } }));

    expect(res.status).toBe(400);
  });

  it('validates cannabinoid range', async () => {
    const res = await post(makeEntry({ cannabinoids: { thc: 101 } }));

    expect(res.status).toBe(400);
  });

  it('accepts valid medicalRating', async () => {
    const res = await post(makeEntry({ medicalRating: 7.3 }));

    expect(res.status).toBe(201);
  });

  it('rejects medicalRating out of range', async () => {
    const res = await post(makeEntry({ medicalRating: 11 }));

    expect(res.status).toBe(400);
  });

  it('requires customCannabisForm when form is other', async () => {
    const res = await post(
      makeEntry({ cannabisForm: 'other', customCannabisForm: '' })
    );

    expect(res.status).toBe(400);
  });

  it('requires customConsumptionMethod when method is other', async () => {
    const res = await post(
      makeEntry({ consumptionMethod: 'other', customConsumptionMethod: '' })
    );

    expect(res.status).toBe(400);
  });
});
