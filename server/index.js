const express = require('express');
const { createPurchase } = require('../generators/livePurchases.js');
const { createRequest } = require('../generators/liveRequests.js');
const { processAllMessages } = require('../queue/fetchMessages.js');
const { populateRecommendations } = require('./recHelpers/recGenerator.js');

const app = express();

// NOTE WORKFLOW:
// 1) Generate live messages (purchases AND requests)
// 2) Process messages @ given interval
// 3) Run recommendation update script (recHelpers/recGenerator.js) @ interval

// const initElasticsearch = () => {
//   elastic.indexExists()
//     .then((exists) => {
//       if (exists) {
//         return elastic.deleteIndex();
//       }
//       return exists;
//     })
//     .then(elastic.initIndex)
//     .then(elastic.initMapping)
//     .catch((err) => {
//       throw err;
//     });
// };
// initElasticsearch();

// Simulate message bus requests once a minute.

setInterval(() => {
  createPurchase();
  createRequest();
}, 5000);

const DAILY = 1000 * 60 * 60 * 24;
const MINUTE = 1000 * 60;

// Process all messages once a minute
setInterval(() => {
  processAllMessages(true); // Process purchases
  processAllMessages(false); // Process requests
}, MINUTE);

// Regenerate recommendations once a day
setInterval(() => {
  populateRecommendations();
}, DAILY);

const port = process.env.PORT || 3000;
app.listen(port, () => {});

module.exports = app;
