const db = require('../db/purchases/index.js');
const uniqBy = require('lodash.uniqby');

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

const setup = (numUsers, numProducts, numCategories, numPurchases) => {
  // Use these for generating live purchases
  module.exports.totalUsers = numUsers;
  module.exports.totalProducts = numProducts;
  module.exports.totalCategories = numCategories;
  // Clear DB, generate users, then categories, then products, then purchases
  return db.deleteAll()
    .then(() => (
      genUsers(numUsers)
    ))
    .then(() => (
      genCategories(numCategories)
    ))
    .then(() => (
      genProducts(numProducts, numCategories)
    ))
    // .then(() => (
    //   genPurchases(numPurchases, numUsers, numProducts)
    // ))
    // .then(() => {
    //   db.indexAll();
    // })
    .catch((err) => {
      throw err;
    });
};

const initialSetup = (setupParams) => {
  const {
    users,
    products,
    categories,
    purchases,
  } = setupParams;
  const start = Date.now();
  console.log('database seed started at', new Date(start).toString());

  return setup(users, products, categories, purchases)
    .then(() => {
      console.log('Database seed complete');
      const end = Date.now();
      console.log('Database seed complete at', new Date(end).toString());
      console.log('Time elapsed in milliseconds', (end - start));
    })
    .catch((err) => {
      console.log('ERROR in setup', err);
    });
};

// Export functions for testing
module.exports = {
  setup,
  genUsers,
  genProducts,
  genPurchases,
  genCategories,
  initialSetup,
};
