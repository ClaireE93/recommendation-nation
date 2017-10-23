const db = require('../db/purchases/index.js');

// NOTE: Use these for live data generation
let totalUsers;
let totalProducts;
let totalCategories;

const genUsers = (numUsers) => {
  const promiseArr = [];
  for (let i = 1; i <= numUsers; i += 1) {
    const func = db.addUser(i);
    promiseArr.push(func);
  }

  return Promise.all(promiseArr);
};

const genCategories = (numCategories) => {
  const promiseArr = [];
  for (let i = 1; i <= numCategories; i += 1) {
    const func = db.addCategory(i);
    promiseArr.push(func);
  }

  return Promise.all(promiseArr);
};

const genProducts = (numProducts, numCategories) => {
  const promiseArr = [];
  for (let i = 1; i <= numProducts; i += 1) {
    const category = Math.ceil(Math.random() * numCategories);
    const func = db.addProduct(i, category);
    promiseArr.push(func);
  }

  return Promise.all(promiseArr);
};

const genPurchases = (numPurchases, numUsers, numProducts) => {
  const promiseArr = [];
  for (let i = 1; i <= numPurchases; i += 1) {
    const product = Math.ceil(Math.random() * numProducts);
    const user = Math.ceil(Math.random() * numUsers);
    const rating = Math.ceil(Math.random() * 5);
    const func = db.addPurchase(product, user, rating);
    promiseArr.push(func);
  }

  return Promise.all(promiseArr);
};

const setup = (numUsers, numProducts, numCategories, numPurchases) => {
  totalUsers = numUsers;
  totalProducts = numProducts;
  totalCategories = numCategories;
  // Generate users, then categories, then products, then purchases
  return genUsers(numUsers)
    .then(() => (
      genCategories(numCategories)
    ))
    .then(() => (
      genProducts(numProducts, numCategories)
    ))
    .then(() => (
      genPurchases(numPurchases, numUsers, numProducts)
    ))
    .catch((err) => {
      throw err;
    });
};

const getUsers = () => (
  totalUsers
);

const getProducts = () => (
  totalUsers
);

const getCategories = () => (
  totalUsers
);

module.exports = {
  setup,
  getUsers,
  getProducts,
  getCategories,
};
