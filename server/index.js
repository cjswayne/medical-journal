const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Validate required env vars on startup
const requiredEnvVars = ['MONGODB_URI', 'AUTH_PASSWORD'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers (CSP relaxed for Google Maps iframe embeds)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'frame-src': ["'self'", 'https://www.google.com'],
      'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'],
    }
  }
}));

app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter for write endpoints (15 req/min per IP, skipped in test)
const isTest = process.env.NODE_ENV === 'test';
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

if (!isTest) {
  app.use('/api/entries', (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      return writeLimiter(req, res, next);
    }
    next();
  });
  app.use('/api/upload', writeLimiter);
  app.use('/api/options', (req, res, next) => {
    if (req.method === 'POST') {
      return writeLimiter(req, res, next);
    }
    next();
  });
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/entries', require('./routes/entries'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/options', require('./routes/options'));
app.use('/api/analytics', require('./routes/analytics'));

// Serve client build in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist, {
  maxAge: '1y',
  immutable: true,
  index: false
}));

// SPA fallback -- serve index.html for non-API routes
app.get('{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Client build not found. Run npm run build in client/' });
    }
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(`Unhandled error: ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Connect to MongoDB and start server (skip in test env)
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
