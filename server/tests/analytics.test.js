const request = require('supertest');
const db = require('./setup');
const app = require('../index');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

const AUTH_HEADER = 'test-password';

const ANALYTICS_KEYS = [
  'strainFrequency',
  'avgRatings',
  'effectsAvg',
  'spendingOverTime',
  'formBreakdown',
  'methodBreakdown',
  'topTerpenes',
];

const createEntry = (body) =>
  request(app)
    .post('/api/entries')
    .set('x-auth-password', AUTH_HEADER)
    .send(body);

describe('Analytics API', () => {
  it('returns analytics shape with no entries', async () => {
    const res = await request(app).get('/api/analytics');

    expect(res.status).toBe(200);
    for (const key of ANALYTICS_KEYS) {
      expect(res.body).toHaveProperty(key);
    }
    expect(res.body.strainFrequency).toEqual([]);
    expect(res.body.spendingOverTime).toEqual([]);
    expect(res.body.formBreakdown).toEqual([]);
    expect(res.body.methodBreakdown).toEqual([]);
    expect(res.body.topTerpenes).toEqual([]);
  });

  it('returns computed analytics with entries', async () => {
    await createEntry({
      productName: 'Strain A',
      strains: [{ name: 'Sour Diesel', type: 'sativa' }],
      cannabisForm: 'flower',
      consumptionMethod: 'smoke',
      effects: { painRelief: 8, energy: 6 },
      medicalRating: 7,
      price: 50,
      terpenes: { dominant: ['Myrcene', 'Limonene'] },
    });

    await createEntry({
      productName: 'Strain B',
      strains: [{ name: 'Blue Dream', type: 'hybrid' }],
      cannabisForm: 'edible',
      consumptionMethod: 'ingest',
      effects: { painRelief: 4, energy: 2 },
      medicalRating: 5,
      price: 30,
      terpenes: { dominant: ['Myrcene'] },
    });

    const res = await request(app).get('/api/analytics');

    expect(res.status).toBe(200);
    expect(res.body.strainFrequency.length).toBeGreaterThanOrEqual(1);
    expect(res.body.formBreakdown.length).toBeGreaterThanOrEqual(1);
    expect(res.body.topTerpenes.length).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.effectsAvg.painRelief).toBe('number');
    expect(typeof res.body.effectsAvg.energy).toBe('number');
  });
});
