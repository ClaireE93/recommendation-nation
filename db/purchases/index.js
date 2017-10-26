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

const db = pgp(cn);

const csPurchases = new pgp.helpers.ColumnSet([
  'product_id',
  'user_id',
  'rating',
], { table: 'purchase' });

const csUsers = new pgp.helpers.ColumnSet([
  'user_id',
], { table: 'users' });

const csCategories = new pgp.helpers.ColumnSet([
  'category_id',
], { table: 'categories' });

const csProducts = new pgp.helpers.ColumnSet([
  'product_id',
  'category',
], { table: 'products' });

// Array must be [{ product_id: <int>, user_id: <int>, rating: <float> }, ...]
const heapInsertPurchases = (array) => {
  const insert = `${pgp.helpers.insert(array, csPurchases, 'purchase')} ON CONFLICT ON CONSTRAINT no_duplicate_purchase DO UPDATE SET rating = EXCLUDED.rating`;
  return db.none(insert);
};

const heapInsertUsers = (array) => {
  const insert = pgp.helpers.insert(array, csUsers);
  return db.none(insert);
};

const heapInsertCategories = (array) => {
  const insert = pgp.helpers.insert(array, csCategories);
  return db.none(insert);
};

const heapInsertProducts = (array) => {
  const insert = pgp.helpers.insert(array, csProducts);
  return db.none(insert);
};

const getAllUsers = () => (
  return db.any('SELECT * FROM users')
);

const getAllProducts = () => (
  return db.any('SELECT * FROM products')
);

const getAllCategories = () => (
  return db.any('SELECT * FROM categories')
);

const getAllPurchases = () => (
  return db.any('SELECT * FROM purchases')
);

const addUser = user => (
  return db.none(`INSERT INTO users (user_id) VALUES ($/user/) ON CONFLICT (user_id) DO NOTHING`, {user})
);

const addProduct = (product, category) => (
  return db.none(`INSERT INTO products (product_id, category) VALUES ($/product/, $/category/) ON CONFLICT (product_id) DO NOTHING`, {product, category})
);

const addCategory = category => (
  return db.none(`INSERT INTO categories (category_id) VALUES ($/category/) ON CONFLICT (category_id) DO NOTHING`, {category})
);

// NOTE: This function overwrites duplicate purchases so only the most recent
// purchase and rating are stored
const addPurchase = (ind, product, user, rating) => (
  return db.tx(t => t.batch([
      t.none(`UPDATE purchase SET rating=$/rating/ WHERE user_id=$/user/ AND product_id=$/product/`, {product, user, rating}),
      t.none(`INSERT INTO purchase (product_id, user_id, rating)
      SELECT $/product/, $/user/, $/rating/
      WHERE NOT EXISTS (SELECT 1 FROM purchase WHERE user_id=$/user/ AND product_id=$/product/)
      `, {user, product, rating})
  ]))
);

const deleteAll = () => (
  return db.tx(t => t.batch([
      t.none('DELETE FROM purchase'),
      t.none('DELETE FROM products'),
      t.none('DELETE FROM users')
  ]))
);

const indexAll = () => (
  return db.tx(t => t.batch([
      t.none('CREATE INDEX category_idx ON products (category)'),
      t.none('CREATE INDEX user_idx ON purchase (user_id)'),
      t.none('CREATE INDEX product_idx ON purchase (product_id)')
  ]))
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
