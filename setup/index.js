const { getUserCount, dropTables } = require('../db/purchases');
const { seedDB } = require('../generators/master.js'); // Seed PSQL db
const { setup } = require('../db/purchases/setup.js'); // Setup PSQL db tables
const { initElasticsearch } = require('../server/elasticsearch'); // Create elasticsearch index and mapping
const { populateRecommendations } = require('../server/recHelpers/recGenerator.js'); // Seed initial recommendations
const { setupParams } = require('../generators/config.js');
const { removeRecs } = require('../db/recommendations');

const seedAll = () => {
  setup()
    .then(seedDB)
    .then(initElasticsearch)
    .then(populateRecommendations)
    .then(() => {
      console.log('recommendations seeded');
      process.exit();
    })
    .catch((err) => {
      throw err;
    });
};

const reseed = () => (
  dropTables()
    .then(() => (
      removeRecs()
    ))
    .then(() => (
      seedAll()
    ))
    .catch((err) => {
      throw err;
    })
);

// Check if DBs have entries. If yes, exit. If no, run setup script
getUserCount()
  .then((data) => {
    if (data[0].count >= setupParams.users) {
      console.log('data already seeded');
      process.exit();
    } else {
      reseed();
    }
  })
  .catch(() => {
    seedAll();
  });
