const db = require('../db/purchases/index.js');
const uniqBy = require('lodash.uniqby');

// Generate and heap insert users, categories, products, and purchases
const genUsers = (numUsers) => {
  const final = [];
  for (let i = 1; i <= numUsers; i += 1) {
    const obj = { user_id: i };
    final.push(obj);
  }

  return db.heapInsertUsers(final);
};

const genCategories = (numCategories) => {
  const final = [];
  for (let i = 1; i <= numCategories; i += 1) {
    const obj = { category_id: i };
    final.push(obj);
  }

  return db.heapInsertCategories(final);
};

const genProducts = (numProducts, numCategories) => {
  const final = [];
  for (let i = 1; i <= numProducts; i += 1) {
    const cat = Math.ceil(Math.random() * numCategories);
    const obj = { category: cat, product_id: i };
    final.push(obj);
  }

  return db.heapInsertProducts(final);
};

const genPurchases = (numPurchases, numUsers, numProducts) => {
  const product = () => Math.ceil(Math.random() * numProducts);
  const user = () => Math.ceil(Math.random() * numUsers);
  const rating = () => Math.ceil(Math.random() * 5);
  const heap = [];
  for (let i = 0; i < numPurchases; i += 1) {
    const purchaseObj = {
      product_id: product(),
      user_id: user(),
      rating: rating(),
    };
    heap.push(purchaseObj);
  }

  const result = uniqBy(heap, purchase => [purchase.product_id, purchase.user_id].join());

  return db.heapInsertPurchases(result);
};

// Clear DB, generate users, then categories, then products
const initialSetup = (setupParams) => {
  const {
    users,
    products,
    categories,
  } = setupParams;

  return db.deleteAll()
    .then(() => (
      genUsers(users)
    ))
    .then(() => (
      genCategories(categories)
    ))
    .then(() => (
      genProducts(products, categories)
    ))
    .catch((err) => {
      throw err;
    });
};

// Export functions for testing
module.exports = {
  genUsers,
  genProducts,
  genPurchases,
  genCategories,
  initialSetup,
};
