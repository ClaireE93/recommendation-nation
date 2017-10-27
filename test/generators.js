/* eslint-env mocha */
const pg = require('pg');
const { expect } = require('chai');
const db = require('../db/purchases/index.js');
const gen = require('../generators/historic.js');

describe('Purchases Database Tests', () => {
  let client;
  const connectionString = 'postgres://localhost:5432/purchases';

  beforeEach((done) => {
    client = new pg.Client(connectionString);
    client.connect();
    db.deleteAll()
      .then(() => {
        done();
      })
      .catch((err) => {
        throw err;
      });
  });

  afterEach(() => {
    client.end();
  });

  it('Should generate users', (done) => {
    const testNum = 15;
    gen.genUsers(testNum)
      .then(() => {
        const queryStr = 'SELECT * FROM users';
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(testNum);
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
        const queryStr = 'SELECT * FROM categories';
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(testNum);
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
        const queryStr = 'SELECT * FROM products';
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.equal(testNum);
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
        const queryStr = 'SELECT * FROM purchase';
        return client.query(queryStr);
      })
      .then((results) => {
        expect(results.rows.length).to.be.within(1, testNum);
        done();
      });
  });
});

// describe('Live Message Generators', () => {
//   it('should generate live purchases', () => {
//
//   });
//
//   it('should generate live requests', () => {
//
//   });
//
//   it('should check for purchases', () => {
//
//   });
//
//   it('should check for requests', () => {
//
//   });
//
//   it('should delete messages once they are consumed', () =>{
//
//   });
// });
