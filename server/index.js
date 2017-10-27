const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const elastic = require('./elasticsearch');
const mongo = require('../db/recommendations');
const { createPurchase } = require('../generators/livePurchases.js');
const { createRequest } = require('../generators/liveRequests.js');
const { processAllMessages } = require('../queue/fetchMessages.js');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const initElasticsearch = () => {
  elastic.indexExists()
    .then((exists) => {
      if (exists) {
        return elastic.deleteIndex();
      }
      return exists;
    })
    .then(elastic.initIndex)
    .then(elastic.initMapping)
    .catch((err) => {
      throw err;
    });
};

// NOTE: Run this function ONCE on setup to setup ElasticSearch indeces
// FIXME: Move this to another file that is already run once on setup?
// Maybe to db/purchases/setup.js
// initElasticsearch();

// Simulate message bus requests once a minute.
setInterval(() => {
  createPurchase();
  createRequest();
}, 6000);

const DAILY = 1000 * 60 * 60 * 24;

// Process all messages once a day
setInterval(() => {
  processAllMessages(true); // Process purchases
  processAllMessages(false); // Process requests
}, DAILY);

const sendElasticsearchRandom = () => {
  const obj = {
    user_id: Math.ceil(Math.random() * 10000),
    number: Math.ceil(Math.random() * 5),
    mae: Math.random() * 5,
  };

  elastic.addRec(obj);
};

// Generate kibana data
// setInterval(() => {
//   sendElasticsearchRandom();
// }, 1000);

const generateRecommendations = () => {
  // TODO: Create m x n matrix
  // Generate recs
  // Populate rec DB
};

const port = process.env.PORT || 3000;
app.listen(port, () => {});

module.exports = app;
