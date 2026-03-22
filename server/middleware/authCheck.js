const crypto = require('crypto');

const unauthorized = (res) => res.status(401).json({ error: 'Unauthorized' });

// Validates x-auth-password against AUTH_PASSWORD (constant-time when lengths match).
function authCheck(req, res, next) {
  try {
    const expected = process.env.AUTH_PASSWORD;
    const provided = req.get('x-auth-password');

    if (!expected || typeof provided !== 'string') {
      return unauthorized(res);
    }

    const expectedBuf = Buffer.from(expected, 'utf8');
    const providedBuf = Buffer.from(provided, 'utf8');

    // timingSafeEqual requires equal lengths; mismatch => reject without calling it
    if (expectedBuf.length !== providedBuf.length) {
      return unauthorized(res);
    }

    if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) {
      return unauthorized(res);
    }

    next();
  } catch (err) {
    console.error('authCheck:', err);
    return unauthorized(res);
  }
}

module.exports = authCheck;
