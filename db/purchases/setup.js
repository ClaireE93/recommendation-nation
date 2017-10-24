const pg = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/purchases';
const client = new pg.Client(connectionString);
client.connect();
client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE)')
  .then(() => (
    client.query('CREATE TABLE categories(id SERIAL PRIMARY KEY, category_id INTEGER UNIQUE)')
  ))
  .then(() => (
    client.query('CREATE TABLE products(id SERIAL PRIMARY KEY, product_id INTEGER UNIQUE, category INTEGER REFERENCES categories (category_id))')
  ))
  .then(() => (
    client.query(`CREATE TABLE purchase
      (id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES products (product_id),
      user_id INTEGER REFERENCES users (user_id),
      rating FLOAT(8))`)
  ))
  .then(() => {
    client.end();
  })
  .catch((err) => {
    client.end();
    throw err;
  });
