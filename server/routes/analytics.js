const express = require('express');
const Entry = require('../models/Entry');

const router = express.Router();

const EFFECT_KEYS = [
  'painRelief',
  'headache',
  'energy',
  'creative',
  'stressRelief',
  'dryMouth',
  'sleepy',
  'anxious',
  'crampRelief',
  'dryEyes',
  'lazy',
  'focused',
  'relaxation',
  'hungry',
  'uplifted',
  'peaceful',
];

const analyticsPipeline = [
  {
    $facet: {
      strainFrequency: [
        { $unwind: { path: '$strains' } },
        { $group: { _id: '$strains.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
        { $project: { _id: 0, strain: '$_id', count: 1 } },
      ],
      avgRatings: [
        { $unwind: { path: '$strains' } },
        {
          $group: {
            _id: '$strains.type',
            medicalRating: { $avg: '$medicalRating' },
            recreationalRating: { $avg: '$recreationalRating' },
          },
        },
        {
          $project: {
            _id: 0,
            strainType: '$_id',
            medicalRating: 1,
            recreationalRating: 1,
          },
        },
      ],
      effectsAvg: [
        {
          $group: {
            _id: null,
            ...Object.fromEntries(
              EFFECT_KEYS.map((key) => [key, { $avg: `$effects.${key}` }])
            ),
          },
        },
        { $project: { _id: 0 } },
      ],
      spendingOverTime: [
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$createdAt' },
            },
            total: { $sum: { $ifNull: ['$price', 0] } },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, month: '$_id', total: 1 } },
      ],
      formBreakdown: [
        { $match: { cannabisForm: { $ne: '' } } },
        { $group: { _id: '$cannabisForm', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, cannabisForm: '$_id', count: 1 } },
      ],
      methodBreakdown: [
        { $match: { consumptionMethod: { $ne: '' } } },
        { $group: { _id: '$consumptionMethod', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, consumptionMethod: '$_id', count: 1 } },
      ],
      topTerpenes: [
        { $unwind: { path: '$terpenes.dominant' } },
        { $group: { _id: '$terpenes.dominant', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
        { $project: { _id: 0, terpene: '$_id', count: 1 } },
      ],
    },
  },
];

router.get('/', async (req, res) => {
  try {
    const [facetResult] = await Entry.aggregate(analyticsPipeline);
    const effectsRow = (facetResult.effectsAvg && facetResult.effectsAvg[0]) || {};
    const effectsAvg = Object.fromEntries(
      EFFECT_KEYS.map((key) => [key, effectsRow[key] ?? null])
    );

    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      strainFrequency: facetResult.strainFrequency || [],
      avgRatings: facetResult.avgRatings || [],
      effectsAvg,
      spendingOverTime: facetResult.spendingOverTime || [],
      formBreakdown: facetResult.formBreakdown || [],
      methodBreakdown: facetResult.methodBreakdown || [],
      topTerpenes: facetResult.topTerpenes || [],
    });
  } catch (err) {
    console.error('GET /api/analytics:', err);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router;
