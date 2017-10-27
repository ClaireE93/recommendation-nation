const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const elastic = require('./elasticsearch');
const mongo = require('../db/recommendations');
const { createPurchase } = require('../generators/livePurchases.js');
const { createRequest } = require('../generators/liveRequests.js');
const { receivePurchases, receiveRequests } = require('../queue/fetchMessages.js');

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
    })
    .then(elastic.initIndex)
    .then(elastic.initMapping)
    .catch((err) => {
      throw err;
    });
};

// initElasticsearch();
createPurchase();
createRequest();
receivePurchases();

// Generate purchase every minute
// setInterval(createPurchase, 60000);

// Generate request every minute
// setInterval(createRequest, 60000);


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
  // Generate initial recs
  // Populate rec DB
};

const updatePurchases = () => {
  // TODO: Grab messages from message bus, parse, update db
  // update recommendations
  // EXTRA: Run analysis on recs
};

const checkForRequests = () => {
  // TODO: Check message bus for requests for user recommendations
};

const port = process.env.PORT || 3000;
app.listen(port, () => {});

module.exports = app;
