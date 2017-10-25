const pg = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/purchases';
const client = new pg.Client(connectionString);
client.connect();
client.query('CREATE TABLE users(id SERIAL, user_id INTEGER PRIMARY KEY)')
  .then(() => (
    client.query('CREATE TABLE categories(id SERIAL, category_id INTEGER PRIMARY KEY)')
  ))
  .then(() => (
    client.query('CREATE TABLE products(id SERIAL, product_id INTEGER PRIMARY KEY, category INTEGER REFERENCES categories (category_id))')
  ))
  .then(() => (
    client.query(`CREATE TABLE purchase
      (id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES products (product_id),
      user_id INTEGER REFERENCES users (user_id),
      rating FLOAT(8),
      CONSTRAINT no_duplicate_purchase UNIQUE (product_id, user_id)) `)
  ))
  // .then(() => (
  //   client.query(`CREATE TABLE purchase
  //     (id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES products (product_id),
  //     user_id INTEGER REFERENCES users (user_id),
  //     rating FLOAT(8)) `)
  // ))
  .then(() => {
    client.end();
  })
  .catch((err) => {
    client.end();
    throw err;
  });
