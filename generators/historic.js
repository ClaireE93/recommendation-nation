const db = require('../db/purchases/index.js');

// NOTE: Use these for live data generation to make non random purchases
let totalUsers;
let totalProducts;
let totalCategories;

const promiseFactory = (end, dbFunc, options) => {
  const promiseArr = [];
  let params = [];
  for (let i = 1; i <= end; i += 1) {
    if (options) {
      params = options.map(func => func());
    }
    const func = dbFunc(i, ...params);
    promiseArr.push(func);
  }

  return Promise.all(promiseArr);
};

const genUsers = numUsers => (
  promiseFactory(numUsers, db.addUser)
);

const genCategories = numCategories => (
  promiseFactory(numCategories, db.addCategory)
);

const genProducts = (numProducts, numCategories) => {
  const category = () => Math.ceil(Math.random() * numCategories);
  const options = [category];
  return promiseFactory(numProducts, db.addProduct, options);
};

const genPurchases = (numPurchases, numUsers, numProducts) => {
  const product = () => Math.ceil(Math.random() * numProducts);
  const user = () => Math.ceil(Math.random() * numUsers);
  const rating = () => Math.ceil(Math.random() * 5);
  const options = [product, user, rating];
  return promiseFactory(numPurchases, db.addPurchase, options);
};

const setup = (numUsers, numProducts, numCategories, numPurchases) => {
  totalUsers = numUsers;
  totalProducts = numProducts;
  totalCategories = numCategories;
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
    .then(() => (
      genPurchases(numPurchases, numUsers, numProducts)
    ))
    .then(() => {
      db.indexAll();
    })
    .catch((err) => {
      throw err;
    });
};

const getUsers = () => (
  totalUsers
);

const getProducts = () => (
  totalProducts
);

const getCategories = () => (
  totalCategories
);


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

  setup(users, products, categories, purchases)
    .then(() => {
      console.log('Database seed complete');
    })
    .catch((err) => {
      console.log('ERROR in setup', err);
    });
};

initialSetup();

module.exports = {
  getUsers,
  getProducts,
  getCategories,
  setup,
};
