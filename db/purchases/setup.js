const pg = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/purchases';
const client = new pg.Client(connectionString);
client.connect();
client.query('CREATE TABLE users(id SERIAL PRIMARY KEY)')
  .then(() => (
    client.query('CREATE TABLE categories(id SERIAL PRIMARY KEY)')
  ))
  .then(() => (
    client.query('CREATE TABLE products(id SERIAL PRIMARY KEY, category INTEGER REFERENCES categories (id))')
  ))
  .then(() => (
    client.query(`CREATE TABLE purchase
      (id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES products (id),
      user_id INTEGER REFERENCES users (id),
      rating FLOAT(8))`)
  ))
  .then(() => {
    console.log('all tables made');
    client.end();
  })
  .catch((err) => {
    console.log('ERR ', err);
    client.end();
  });
