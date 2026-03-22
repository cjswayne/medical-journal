const crypto = require('crypto');
const express = require('express');

const router = express.Router();

router.post('/login', (req, res) => {
  try {
    const expected = process.env.AUTH_PASSWORD;
    const provided = req.body?.password;

    if (!expected || typeof provided !== 'string') {
      return res.status(401).json({ ok: false });
    }

    const expectedBuf = Buffer.from(expected, 'utf8');
    const providedBuf = Buffer.from(provided, 'utf8');

    if (expectedBuf.length !== providedBuf.length) {
      return res.status(401).json({ ok: false });
    }

    if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) {
      return res.status(401).json({ ok: false });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('auth login:', err);
    return res.status(401).json({ ok: false });
  }
});

module.exports = router;
