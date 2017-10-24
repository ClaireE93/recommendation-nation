// const historic = require('./historic.js');
const db = require('../db/purchases/index.js');

// This is totally random
// TODO: Use category data to make not random
// TODO: This should send a message to the message bus for queueing, not add
// directly to DB

const setupParams = {
  users: 50000,
  products: 10000,
  categories: 1000,
  purchases: 10000000,
};

const createPurchase = (users, products) => {
  const user = Math.ceil(Math.random() * users);
  const product = Math.ceil(Math.random() * products);
  const rating = Math.ceil(Math.random() * 5);
  return db.addPurchase(null, product, user, rating);
};

const generate = (num) => {
  console.log('started at', Date.now());
  for (let i = 0; i < num; i += 1) {
    createPurchase(setupParams.users, setupParams.products)
      .catch((err) => {
        throw err;
      });
  }

  console.log('ended at', Date.now());
};

const interval = 100000;
// const interval = setupParams.purchases / 10;

generate(interval);

module.exports = {
  createPurchase,
};
