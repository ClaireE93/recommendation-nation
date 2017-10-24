const { Pool } = require('pg');
const pgp = require('pg-promise')({
  capSQL: true, // generate capitalized SQL
});

// See https://github.com/brianc/node-pg-pool for possible url parsing issues
// NOTE: Fix this for deployment
const cn = {
  database: 'purchases',
  user: 'mtakano',
  password: null,
  port: 5432,
  // ssl: true,
  max: 20, // set pool max size to 20
  idleTimeoutMillis: 1000, // close idle clients after 1 second
};

const pool = new Pool(cn);

const db = pgp(cn);

// Array must be [{ product_id: <int>, user_id: <int>, rating: <float> }, ...]
const heapInsertPurchases = (array) => {
  const csPurchases = new pgp.helpers.ColumnSet([
    'product_id',
    'user_id',
    'rating',
  ], { table: 'purchase' });
  const insert = pgp.helpers.insert(array, csPurchases);
  return db.none(insert);
};
// EXAMPLE for upsert:
// let query = this.pgp.helpers.insert(collection, col_set)
// + ' ON CONFLICT ON CONSTRAINT constraint_name_goes_here DO UPDATE SET modified_date = now()'

const heapInsertUsers = (array) => {
  const csUsers = new pgp.helpers.ColumnSet([
    'user_id',
  ], { table: 'users' });
  const insert = pgp.helpers.insert(array, csUsers);
  return db.none(insert);
};

const heapInsertCategories = (array) => {
  const csCategories = new pgp.helpers.ColumnSet([
    'category_id',
  ], { table: 'categories' });
  const insert = pgp.helpers.insert(array, csCategories);
  return db.none(insert);
};

const heapInsertProducts = (array) => {
  const csProducts = new pgp.helpers.ColumnSet([
    'product_id',
    'category',
  ], { table: 'products' });
  const insert = pgp.helpers.insert(array, csProducts);
  return db.none(insert);
};

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
  pool.query('CREATE INDEX category_idx ON products (category)')
    .then(() => (
      pool.query('CREATE INDEX user_idx ON purchase (user_id)')
    ))
    .then(() => (
      pool.query('CREATE INDEX product_idx ON purchase (product_id)')
    ))
    .catch((err) => {
      throw err;
    })
);

module.exports = {
  heapInsertPurchases,
  heapInsertUsers,
  heapInsertCategories,
  heapInsertProducts,
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
