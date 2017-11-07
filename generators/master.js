const historic = require('./historic.js');
const db = require('../db/purchases/index.js');
const { setupParams } = require('./config.js');

let start;
let end;
let chunk;

const seedDB = () => (
  historic.initialSetup(setupParams)
    .then(() => {
      start = Date.now();
      console.log('initial setup done at', new Date(start));
      chunk = Math.ceil(setupParams.purchases / 4);
      return historic.genPurchases(chunk, setupParams.users, setupParams.products);
    })
    .then(() => (
      historic.genPurchases(chunk, setupParams.users, setupParams.products)
    ))
    .then(() => (
      historic.genPurchases(chunk, setupParams.users, setupParams.products)
    ))
    .then(() => (
      historic.genPurchases(chunk, setupParams.users, setupParams.products)
    ))
    .then(() => {
      end = Date.now();
      console.log('second setup done at', new Date(end));
      console.log('total ms for second is', end - start);
      return db.indexAll();
    })
    .catch((err) => {
      throw err;
    })
);

module.exports = { seedDB };
