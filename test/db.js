/* eslint-env mocha */
const pg = require('pg');
const { expect } = require('chai');
const db = require('../db/purchases/index.js');
const mongo = require('../db/recommendations/index.js');
const { Recs } = require('../db/recommendations/setup.js');

describe('Purchases Database Tests', () => {
  let client;
  const connectionString = 'postgres://localhost:5432/purchases';

  beforeEach((done) => {
    client = new pg.Client(connectionString);
    client.connect(done);
  });

  afterEach(() => {
    client.end();
  });

  it('Should add a user', (done) => {
    db.addUser(5)
      .then(() => {
        const queryStr = "SELECT * FROM users WHERE user_id = '5'";
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(1);
        done();
      });
  });

  it('Should add a category', (done) => {
    db.addCategory(5)
      .then(() => {
        const queryStr = "SELECT * FROM categories WHERE category_id = '5'";
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(1);
        done();
      });
  });

  it('Should add a product', (done) => {
    const product = 5;
    const category = 3;
    db.addCategory(category)
      .then(() => (
        db.addProduct(product, category)
      ))
      .then(() => {
        const queryStr = "SELECT * FROM products WHERE product_id = '5'";
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(1);
        done();
      });
  });

  it('Should add a purchase', (done) => {
    const product = 5;
    const category = 3;
    const user = 1;
    db.addCategory(category)
      .then(() => (
        db.addProduct(product, category)
      ))
      .then(() => (
        db.addUser(user)
      ))
      .then(() => (
        db.addPurchase(null, product, user, 5)
      ))
      .then(() => {
        const queryStr = "SELECT * FROM purchase WHERE user_id = '1' AND product_id = '5'";
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(1);
        expect(results.rows[0].product_id).to.equal(product);
        done();
      });
  });

  it('Should overwrite duplicate purchases', (done) => {
    const product = 5;
    const category = 3;
    const user = 1;
    db.addCategory(category)
      .then(() => (
        db.addProduct(product, category)
      ))
      .then(() => (
        db.addUser(user)
      ))
      .then(() => (
        db.addPurchase(null, product, user, 5)
      ))
      .then(() => {
        const queryStr = "SELECT * FROM purchase WHERE user_id = '1' AND product_id = '5'";
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(1);
        return expect(results.rows[0].rating).to.equal(5);
      })
      .then(() => (
        db.addPurchase(null, product, user, 1)
      ))
      .then(() => {
        const queryStr = "SELECT * FROM purchase WHERE user_id = '1' AND product_id = '5'";
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(1);
        expect(results.rows[0].rating).to.equal(1);
        done();
      });
  });

  it('Should heap insert', (done) => {
    const products = [];
    const categories = [];
    const users = [];
    const purchases = [];
    for (let i = 1; i <= 20; i += 1) {
      products.push({ product_id: i, category: Math.ceil(Math.random() * 20) });
      categories.push({ category_id: i });
      users.push({ user_id: i });
      purchases.push({
        user_id: i,
        product_id: i,
        rating: Math.ceil(Math.random() * 5),
      });
    }

    db.heapInsertUsers(users)
      .then(() => {
        const queryStr = "SELECT * FROM users WHERE user_id = '10'";
        return client.query(queryStr);
      })
      .then(results => (
        expect(results.rows.length).to.equal(1)
      ))
      .then(() => (
        db.heapInsertCategories(categories)
      ))
      .then(() => {
        const queryStr = "SELECT * FROM categories WHERE category_id = '10'";
        return client.query(queryStr);
      })
      .then(results => (
        expect(results.rows.length).to.equal(1)
      ))
      .then(() => (
        db.heapInsertProducts(products)
      ))
      .then(() => {
        const queryStr = "SELECT * FROM products WHERE product_id = '10'";
        return client.query(queryStr);
      })
      .then(results => (
        expect(results.rows.length).to.equal(1)
      ))
      .then(() => (
        db.heapInsertPurchases(purchases)
      ))
      .then(() => {
        const queryStr = "SELECT * FROM purchase WHERE user_id = '10' AND product_id = '10'";
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(1);
        done();
      });
  });
});

describe('Recommendation Database Tests', () => {
  it('Should add a recommendation', (done) => {
    Recs.update(
      { user: 5 },
      { user: 5, recommendations: { 5: 1.3 }, count: 1 },
      { upsert: true, setDefaultsOnInsert: true },
      () => {
        Recs.findOne({ user: 5 }, (err, result) => {
          expect(result.user).to.equal(5);
          expect(result.recommendations).to.deep.equal({ 5: 1.3 });
          done();
        });
      },
    );
  });

  it('Should have a working add and fetch function', (done) => {
    mongo.add({ 1: 1.5 }, 10, 1)
      .then(() => {
        const user = 10;
        return mongo.fetch(user);
      })
      .then((data) => {
        expect(data.recommendations).to.deep.equal({ 1: 1.5 });
        expect(data.user).to.equal(10);
        done();
      });
  });
});
