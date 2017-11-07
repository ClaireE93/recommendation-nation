const express = require('express');
const { createPurchase } = require('../generators/livePurchases.js');
const { createRequest } = require('../generators/liveRequests.js');
const { recRequest, purchaseRequest } = require('../queue/fetchMessages.js');
const { populateRecommendations } = require('./recHelpers/recGenerator.js');

const app = express();

// NOTE WORKFLOW:
// 1) Generate live messages (purchases AND requests)
// 2) Process messages @ given interval
// 3) Run recommendation update script (recHelpers/recGenerator.js) @ interval

// Simulate message bus requests once a minute.
const DAILY = 1000 * 60 * 60 * 24;
const startIntervals = () => {
  recRequest.start();
  purchaseRequest.start();

  setInterval(() => {
    createPurchase();
    createRequest();
  }, 1000);

  // Regenerate recommendations two times a day
  // NOTE: This could be a cron job
  setInterval(() => {
    populateRecommendations()
      .then(() => {
        console.log('Recs reseeded');
      });
  }, DAILY / 2);
};

startIntervals();

const port = process.env.PORT || 3000;
app.listen(port, () => {});

module.exports = app;
