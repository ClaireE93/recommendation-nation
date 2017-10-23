const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const historic = require('../generators/historic');
// const live = require('../generators/livePurchases'); //TODO: Move to live generator service
// const router = require('./routes');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const setupParams = {
  users: 10,
  products: 10,
  categories: 3,
  purchases: 10,
};

const initialSetup = () => {
  const {
    users,
    products,
    categories,
    purchases,
  } = setupParams;

  historic.setup(users, products, categories, purchases)
    .then(() => {
      console.log('DONE with setup');
      // TODO: Generate m x n user matrix and recommendations
    })
    .catch((err) => {
      console.log('ERROR in setup', err);
    });
};

const updatePurchases = () => {
  // TODO: Grab messages from message bus, parse, update db
  // update recommendations
  // EXTRA: Run analysis on recs
};

const checkForRequests = () => {
  // TODO: Check message bus for requests for user recommendations
}

initialSetup();

const port = process.env.PORT || 3000;
app.listen(port, () => {});

module.exports = app;
