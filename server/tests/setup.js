'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Satisfy index.js env-var gate when no .env file is present
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

let mongoServer;

const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

const closeDatabase = async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
};

module.exports = { connect, clearDatabase, closeDatabase };
