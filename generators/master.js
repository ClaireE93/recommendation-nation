const historic = require('./historic.js');
const db = require('../db/purchases/index.js');
//
// const setupParams = {
//   users: 50000,
//   products: 10000,
//   categories: 1000,
//   purchases: 5000000,
// };
// 37 seconds for 1M
// 87 seconds for 2M
// 218 seconds for 5M

const setupParams = {
  users: 10,
  products: 20,
  categories: 5,
  purchases: 50,
};


let start;
let end;

historic.initialSetup(setupParams)
  .then(() => {
    start = Date.now();
    console.log('initial setup done at', new Date(start));
    return historic.genPurchases(setupParams.purchases, setupParams.users, setupParams.products);
  })
  .then(() => {
    end = Date.now();
    console.log('first setup done at', new Date(end));
    console.log('total ms for first is', end - start);
    start = Date.now();
    return historic.genPurchases(setupParams.purchases, setupParams.users, setupParams.products);
  })
  .then(() => {
    end = Date.now();
    console.log('second setup done at', new Date(end));
    console.log('total ms for second is', end - start);
    db.indexAll();
  })
  .catch((err) => {
    throw err;
  });
