const express = require('express');
const mongoose = require('mongoose');
const Entry = require('../models/Entry');
const authCheck = require('../middleware/authCheck');

const router = express.Router();

const CONDENSED_SELECT = '_id productName productType flowerImageUrl strains purchaseDate dispensary.location cannabinoids.thc cannabinoids.cbd medicalRating recreationalRating terpenes.dominant terpenes.secondary effects createdAt';

// Cache for detail/search reads only; list endpoint uses no-cache to avoid stale data after writes
function setPublicCache(res) {
  res.set('Cache-Control', 'public, max-age=60');
}

function setNoCache(res) {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
    const skip = (page - 1) * limit;

    const [total, entries] = await Promise.all([
      Entry.countDocuments(),
      Entry.find()
        .select(CONDENSED_SELECT)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    setNoCache(res);
    const pages = total === 0 ? 1 : Math.ceil(total / limit);
    res.json({ entries, total, page, pages });
  } catch (err) {
    console.error('GET /api/entries:', err);
    res.status(500).json({ error: 'Failed to list entries' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const entries = await Entry.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .select(CONDENSED_SELECT)
      .sort({ score: { $meta: 'textScore' } })
      .lean();

    setPublicCache(res);
    res.json({ entries });
  } catch (err) {
    console.error('GET /api/entries/search:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const entry = await Entry.findById(id).lean();
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    setPublicCache(res);
    res.json({ entry });
  } catch (err) {
    console.error('GET /api/entries/:id:', err);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

function validateOtherFields(body) {
  if (body.cannabisForm === 'other') {
    const v = body.customCannabisForm;
    if (v === undefined || v === null || !String(v).trim()) {
      return 'customCannabisForm is required when cannabisForm is other';
    }
  }
  if (body.consumptionMethod === 'other') {
    const v = body.customConsumptionMethod;
    if (v === undefined || v === null || !String(v).trim()) {
      return 'customConsumptionMethod is required when consumptionMethod is other';
    }
  }
  return null;
}

router.post('/', authCheck, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.productName || !String(body.productName).trim()) {
      return res.status(400).json({ error: 'productName is required' });
    }

    const otherErr = validateOtherFields(body);
    if (otherErr) {
      return res.status(400).json({ error: otherErr });
    }

    const entry = await Entry.create(body);
    res.status(201).json({ entry });
  } catch (err) {
    console.error('POST /api/entries:', err);
    if (err.name === 'ValidationError') {
      const msg =
        Object.values(err.errors)
          .map((e) => e.message)
          .join(', ') || err.message;
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

router.put('/:id', authCheck, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const existing = await Entry.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const merged = { ...existing, ...(req.body || {}) };
    const otherErr = validateOtherFields(merged);
    if (otherErr) {
      return res.status(400).json({ error: otherErr });
    }

    const entry = await Entry.findByIdAndUpdate(id, req.body || {}, {
      new: true,
      runValidators: true,
    });
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ entry });
  } catch (err) {
    console.error('PUT /api/entries/:id:', err);
    if (err.name === 'ValidationError') {
      const msg =
        Object.values(err.errors)
          .map((e) => e.message)
          .join(', ') || err.message;
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

router.delete('/:id', authCheck, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const deleted = await Entry.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/entries/:id:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
