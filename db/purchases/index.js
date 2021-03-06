const pgp = require('pg-promise')({
  capSQL: true, // generate capitalized SQL
});
const { cn } = require('../../config/psql.js');

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
  const insert = `${pgp.helpers.insert(array, csPurchases)} ON CONFLICT ON CONSTRAINT no_duplicate_purchase DO UPDATE SET rating = EXCLUDED.rating`;
  return db.none(insert);
};

const heapInsertUsers = (array) => {
  const insert = `${pgp.helpers.insert(array, csUsers)} ON CONFLICT (user_id) DO NOTHING`;
  return db.none(insert);
};

const heapInsertCategories = (array) => {
  const insert = `${pgp.helpers.insert(array, csCategories)} ON CONFLICT (category_id) DO NOTHING`;
  return db.none(insert);
};

const heapInsertProducts = (array) => {
  const insert = `${pgp.helpers.insert(array, csProducts)} ON CONFLICT (product_id) DO NOTHING`;
  return db.none(insert);
};

const getAllUsers = () => (
  db.any('SELECT * FROM users')
);

const getUserCount = () => (
  db.any('SELECT count(*) from users')
);

const getOneUser = user => (
  db.any(`SELECT * FROM users WHERE user_id='${user}'`)
);

const getAllProducts = () => (
  db.any('SELECT * FROM products')
);

const getOneProduct = product => (
  db.any(`SELECT * FROM products WHERE product_id='${product}'`)
);

const getAllCategories = () => (
  db.any('SELECT * FROM categories')
);

const getOneCategory = category => (
  db.any(`SELECT * FROM categories WHERE category_id='${category}'`)
);

const addUser = user => (
  db.none('INSERT INTO users (user_id) VALUES ($/user/) ON CONFLICT (user_id) DO NOTHING', { user })
);

const addProduct = (product, category) => (
  db.none('INSERT INTO products (product_id, category) VALUES ($/product/, $/category/) ON CONFLICT (product_id) DO NOTHING', { product, category })
);

const addCategory = category => (
  db.none('INSERT INTO categories (category_id) VALUES ($/category/) ON CONFLICT (category_id) DO NOTHING', { category })
);

// NOTE: This function overwrites duplicate purchases so only the most recent
// purchase and rating are stored
const addPurchase = (ind, product, user, rating) => (
  db.none(`INSERT INTO purchase (user_id, product_id, rating)
  VALUES ('${user}', '${product}', '${rating}')
  ON CONFLICT ON CONSTRAINT no_duplicate_purchase DO UPDATE SET rating = EXCLUDED.rating
  `)
);

const removeIndexes = () => (
  db.tx(t => t.batch([
    t.none('DROP INDEX IF EXISTS category_idx'),
    t.none('DROP INDEX IF EXISTS products_idx'),
    t.none('DROP INDEX IF EXISTS users_idx'),
    t.none('DROP INDEX IF EXISTS user_idx'),
    t.none('DROP INDEX IF EXISTS product_idx'),
  ]))
);

const deleteAll = () => (
  removeIndexes()
    .then(() => (
      db.tx(t => t.batch([
        t.none('DELETE FROM purchase'),
        t.none('DELETE FROM products'),
        t.none('DELETE FROM categories'),
        t.none('DELETE FROM users'),
      ]))
    ))
);

const dropTables = () => (
  db.tx(t => t.batch([
    t.none('DROP TABLE IF EXISTS purchase'),
    t.none('DROP TABLE IF EXISTS products'),
    t.none('DROP TABLE IF EXISTS categories'),
    t.none('DROP TABLE IF EXISTS users'),
  ]))
);

const indexAll = () => (
  db.tx(t => t.batch([
    t.none('CREATE INDEX category_idx ON products (category)'),
    t.none('CREATE INDEX products_idx ON products (product_id)'),
    t.none('CREATE INDEX users_idx ON users (user_id)'),
    t.none('CREATE INDEX user_idx ON purchase (user_id)'),
    t.none('CREATE INDEX product_idx ON purchase (product_id)'),
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
  addUser,
  addProduct,
  addCategory,
  addPurchase,
  deleteAll,
  indexAll,
  getOneUser,
  getOneProduct,
  getOneCategory,
  getUserCount,
  dropTables,
};
