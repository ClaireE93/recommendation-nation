// This file should be run ONCE to seed databases

const { seedDB } = require('../generators/master.js'); // Seed PSQL db
const { setup } = require('../db/purchases/setup.js'); // Setup PSQL db tables
const { initIndex, initMapping } = require('../server/elasticsearch'); // Create elasticsearch index and mapping
const { populateRecommendations } = require('../server/recHelpers/recGenerator.js'); // Seed initial recommendations

setup()
  .then(seedDB)
  .then(initIndex)
  .then(initMapping)
  .then(populateRecommendations)
  .catch((err) => {
    throw err;
  });
