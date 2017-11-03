// This file should be run ONCE to seed databases
const { getUserCount, deleteAll } = require('../db/purchases');
const { seedDB } = require('../generators/master.js'); // Seed PSQL db
const { setup } = require('../db/purchases/setup.js'); // Setup PSQL db tables
const { initIndex, initMapping } = require('../server/elasticsearch'); // Create elasticsearch index and mapping
const { populateRecommendations } = require('../server/recHelpers/recGenerator.js'); // Seed initial recommendations
const { setupParams } = require('../generators/config.js');
const { removeRecs } = require('../db/recommendations');

const seedAll = () => {
  console.log('seeding data');
  setup()
    .then(seedDB)
    .then(initIndex)
    .then(initMapping)
    .then(populateRecommendations)
    .then(() => {
      process.exit();
    })
    .catch((err) => {
      throw err;
    });
};

const reseed = () => {
  console.log('reseeding');
  deleteAll()
    .then(() => (
      seedDB()
    ))
    .then(() => (
      removeRecs()
    ))
    .then(populateRecommendations)
    .then(() => {
      process.exit();
    })
    .catch((err) => {
      throw err;
    });
};

// Check if DBs have entries. If yes, exit. If no, run setup script
getUserCount()
  .then((count) => {
    if (count >= setupParams.users) {
      console.log('data already seeded');
      process.exit();
    } else {
      reseed();
    }
  })
  .catch(() => {
    seedAll();
  });
