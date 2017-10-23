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

const addProduct = (product, category) => (
  pool.query(`INSERT INTO products (product_id, category) VALUES ('${product}', '${category}')`)
);

const addCategory = category => (
  pool.query(`INSERT INTO categories (category_id) VALUES ('${category}')`)
);

// NOTE: This function overwrites duplicate purchases so only the most recent
// purchase and rating are stored
const addPurchase = (ind, product, user, rating) => (
  pool.query(`UPDATE purchase SET rating='${rating}' WHERE user_id='${user}' AND product_id='${product}'`)
    .then(() => (
      pool.query(`INSERT INTO purchase (product_id, user_id, rating)
      SELECT '${product}', '${user}', '${rating}'
      WHERE NOT EXISTS (SELECT 1 FROM purchase WHERE user_id='${user}' AND product_id='${product}')
      `)
    ))
);

const deleteAll = () => (
  pool.query('DELETE FROM purchase')
    .then(() => (
      pool.query('DELETE FROM products')
    ))
    .then(() => (
      pool.query('DELETE FROM categories')
    ))
    .then(() => (
      pool.query('DELETE FROM users')
    ))
);

const indexAll = () => (
  pool.query('CREATE UNIQUE INDEX category_idx ON products (category)')
    .then(() => (
      pool.query('CREATE UNIQUE INDEX user_idx ON purchase (user_id)')
    ))
    .then(() => (
      pool.query('CREATE UNIQUE INDEX product_idx ON purchase (product_id)')
    ))
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
  deleteAll,
  indexAll,
};
