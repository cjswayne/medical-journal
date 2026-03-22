const express = require('express');
const CustomOption = require('../models/CustomOption');
const authCheck = require('../middleware/authCheck');

const router = express.Router();

const DEFAULT_OPTION_NAMES = [
  'Nutty',
  'Sweet',
  'Fruity',
  'Citrusy',
  'Floral',
  'Herbal',
  'Woody',
  'Musky',
  'Pungent',
  'Spicy',
];

router.get('/', async (req, res) => {
  try {
    const type = req.query.type;
    if (type !== 'aroma' && type !== 'flavor') {
      return res.status(400).json({ error: 'Query parameter type must be aroma or flavor' });
    }

    const customs = await CustomOption.find({ type }).select('name').lean();
    const byName = new Map();
    DEFAULT_OPTION_NAMES.forEach((name) => byName.set(name, { name }));
    customs.forEach((row) => {
      const trimmed = String(row.name || '').trim();
      if (trimmed && !byName.has(trimmed)) {
        byName.set(trimmed, { name: trimmed });
      }
    });

    const options = Array.from(byName.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    res.json({ options });
  } catch (err) {
    console.error('GET /api/options:', err);
    res.status(500).json({ error: 'Failed to load options' });
  }
});

router.post('/', authCheck, async (req, res) => {
  try {
    const { type, name } = req.body || {};
    if (type !== 'aroma' && type !== 'flavor') {
      return res.status(400).json({ error: 'type must be aroma or flavor' });
    }
    if (name === undefined || name === null || !String(name).trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const option = await CustomOption.create({ type, name: String(name).trim() });
    res.status(201).json({ option });
  } catch (err) {
    console.error('POST /api/options:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Option already exists' });
    }
    if (err.name === 'ValidationError') {
      const msg =
        Object.values(err.errors)
          .map((e) => e.message)
          .join(', ') || err.message;
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: 'Failed to create option' });
  }
});

module.exports = router;
