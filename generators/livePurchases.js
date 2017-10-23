const historic = require('./historic.js');
const db = require('../db/purchases/index.js');

// This is totally random
// TODO: Use category data to make not random
const createPurchase = () => {
  const user = Math.ceil(Math.random() * historic.getUsers());
  const product = Math.ceil(Math.random() * historic.getProducts());
  const rating = Math.ceil(Math.random() * 5);
  return db.addPurchase(product, user, rating);
};

module.exports = {
  createPurchase,
};
