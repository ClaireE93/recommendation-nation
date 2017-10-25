const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const historic = require('../generators/historic.js');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log('historic.users', historic.totalUsers);
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
