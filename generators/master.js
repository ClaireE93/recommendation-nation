const historic = require('./historic.js');

// const setupParams = {
//   users: 50000,
//   products: 10000,
//   categories: 1000,
//   purchases: 10000000,
// };
const setupParams = {
  users: 1000,
  products: 10000,
  categories: 300,
  purchases: 10000,
};

historic.initialSetup(setupParams);
