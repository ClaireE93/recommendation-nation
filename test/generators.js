/* eslint-env mocha */
const pg = require('pg');
const { expect } = require('chai');
const gen = require('../generators/historic.js');
const { createPurchase } = require('../generators/livePurchases.js');
const { createRequest } = require('../generators/liveRequests.js');
const { url } = require('../config/psql.js');

describe('Seed Generator Tests', () => {
  let client;

  beforeEach((done) => {
    client = new pg.Client(url);
    client.connect(done);
  });

  afterEach(() => {
    client.end();
  });

  it('Should generate users', (done) => {
    const testNum = 15;
    gen.genUsers(testNum)
      .then(() => {
        const queryStr = 'SELECT * FROM users WHERE user_id=15';
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(1);
        done();
      })
      .catch((err) => {
        throw err;
      });
  });

  it('Should generate categories', (done) => {
    const testNum = 15;
    gen.genCategories(testNum)
      .then(() => {
        const queryStr = 'SELECT * FROM categories WHERE category_id=15';
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(1);
        done();
      });
  });

  it('Should generate products', (done) => {
    const testNum = 15;
    const testCat = 5;
    gen.genCategories(testCat)
      .then(() => (
        gen.genProducts(testNum, testCat)
      ))
      .then(() => {
        const queryStr = 'SELECT * FROM products WHERE product_id=15';
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(1);
        done();
      });
  });

  it('Should generate purchases', (done) => {
    const testNum = 15;
    const testProd = 10;
    const testUsers = 15;
    const testCat = 5;
    gen.genCategories(testCat)
      .then(() => (
        gen.genProducts(testProd, testCat)
      ))
      .then(() => (
        gen.genUsers(testUsers)
      ))
      .then(() => (
        gen.genPurchases(testNum, testUsers, testProd)
      ))
      .then(() => {
        const queryStr = 'SELECT * FROM purchase WHERE user_id=15';
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.be.at.least(1);
        done();
      });
  });
});

describe('Live Message Generators', () => {
  it('should generate live purchases', (done) => {
    createPurchase()
      .then((data) => {
        expect(data.MessageId.length).to.be.at.least(1);
        done();
      });
  });

  it('should generate live requests', (done) => {
    createRequest()
      .then((data) => {
        expect(data.MessageId.length).to.be.at.least(1);
        done();
      });
  });
});
