// const historic = require('./historic.js');
const db = require('../db/purchases/index.js');

// This is totally random
// TODO: Use category data to make not random
// TODO: This should send a message to the message bus for queueing, not add
// directly to DB

const createPurchase = (users, products) => {
  const user = Math.ceil(Math.random() * users);
  const product = Math.ceil(Math.random() * products);
  const rating = Math.ceil(Math.random() * 5);
  return db.addPurchase(null, product, user, rating);
};


module.exports = {
  createPurchase,
};
