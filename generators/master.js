const historic = require('./historic.js');
const live = require('./livePurchases.js');

const setupParams = {
  users: 50000,
  products: 10000,
  categories: 1000,
  purchases: 10000000,
};

historic.initialSetup(setupParams);
