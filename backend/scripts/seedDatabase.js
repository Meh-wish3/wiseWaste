/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDb = require('../config/db');
const Household = require('../models/Household');
const Collector = require('../models/Collector');
const PickupRequest = require('../models/PickupRequest');
const Incentive = require('../models/Incentive');
const { seedUsers } = require('./seedUsers');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
  try {
    await connectDb();

    const householdsRaw = fs.readFileSync(
      path.join(__dirname, '..', 'data', 'householdsSeed.json'),
      'utf-8'
    );
    const collectorsRaw = fs.readFileSync(
      path.join(__dirname, '..', 'data', 'collectorsSeed.json'),
      'utf-8'
    );

    const households = JSON.parse(householdsRaw);
    const collectors = JSON.parse(collectorsRaw);

    await Household.deleteMany({});
    await Collector.deleteMany({});
    await PickupRequest.deleteMany({});
    await Incentive.deleteMany({});

    await Household.insertMany(households);
    await Collector.insertMany(collectors);

    console.log('✅ Database seeded with households and collectors.');
    
    // Seed test users for authentication
    await seedUsers();
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();

