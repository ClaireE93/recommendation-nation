const { Pool } = require('pg');

// See https://github.com/brianc/node-pg-pool for possible url parsing issues
// NOTE: Fix this for deployment
const pool = new Pool({
  database: 'purchases',
  user: 'mtakano',
  password: null,
  port: 5432,
  // ssl: true,
  max: 20, // set pool max size to 20
  idleTimeoutMillis: 1000, // close idle clients after 1 second
});

const getAllUsers = () => (
  pool.query('SELECT * FROM users')
);

const getAllProducts = () => (
  pool.query('SELECT * FROM products')
);

const getAllCategories = () => (
  pool.query('SELECT * FROM categories')
);

const getAllPurchases = () => (
  pool.query('SELECT * FROM purchases')
);

const addUser = user => (
  pool.query(`INSERT INTO users (user_id) VALUES ('${user}')`)
);

const addProduct = product => (
  pool.query(`INSERT INTO products (product_id) VALUES ('${product}')`)
);

const addCategory = category => (
  pool.query(`INSERT INTO categories (category_id) VALUES ('${category}')`)
);

const addPurchase = (product, user, rating) => (
  pool.query(`INSERT INTO purchases (product_id, user_id, rating) VALUES ('${product}', '${user}', '${rating}')`)
);

module.exports = {
  getAllUsers,
  getAllProducts,
  getAllCategories,
  getAllPurchases,
  addUser,
  addProduct,
  addCategory,
  addPurchase,
};
