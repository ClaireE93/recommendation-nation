const AWS = require('aws-sdk');
const { PURCHASE_URL } = require('../config/messageUrls.js');
const { setupParams } = require('./config.js');
const mongo = require('../db/recommendations');

AWS.config.loadFromPath('./config/development.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// This function ensures that at least one purchase is from a recommendation
// which is needed to calculate MAE. If this is not hard coded, the permutations
// of purchases is too high to calculate a true MAE
const shuffle = (arr) => {
  const result = arr.slice();
  let cur = arr.length;
  while (cur) {
    const i = Math.floor(Math.random() * cur);
    cur -= 1;
    [result[i], result[cur]] = [result[cur], result[i]];
  }

  return result;
};

const addCategoryOnePurchase = (isRandom, cart) => {
  const obj = {
    category: Math.ceil(Math.random() * setupParams.categories), // This doesn't matter
    rating: Math.ceil(Math.random() * 5),
  };
  if (isRandom) {
    // obj.
  }
}

const calcPurchases = (recs) => {
  const cart = [];
  const numFromRecs = Math.ceil(Math.random() * 10);
  let nonRecs = Math.ceil(Math.random() * 15) - numFromRecs;
  const shuffledRecs = shuffle(Object.keys(recs));
  let pointer = 0;
  while (pointer < numFromRecs && shuffledRecs[pointer] !== undefined) {
    const purchase = {
      productId: Number(shuffledRecs[pointer]),
      category: Math.ceil(Math.random() * setupParams.categories), // This doesn't matter
      rating: Math.ceil(Math.random() * 5),
    };
    cart.push(purchase);
    pointer += 1;
  }

  while (nonRecs > 0) {
    const purchase = {
      productId: Math.ceil(Math.random() * setupParams.products),
      category: Math.ceil(Math.random() * setupParams.categories), // This doesn't matter
      rating: Math.ceil(Math.random() * 5),
    };
    cart.push(purchase);
    nonRecs -= 1;
  }

  return cart;
};

const generateCart = () => {
  const result = {
    user_id: Math.ceil(Math.random() * setupParams.users),
  };
  const cart = [];
  let recs;
  mongo.fetch(result.user_id)
    .then((data) => {
      recs = data.recommendations;
      console.log('recs are', recs);
      return calcPurchases(recs);
    })
    .then((cart) => {
      console.log('cart is', cart);
    })

  const tot = Math.ceil(Math.random() * 10); // Pick a random number of items for cart
  for (let i = 0; i < tot; i += 1) {
    const obj = {
      productId: Math.ceil(Math.random() * setupParams.products),
      category: Math.ceil(Math.random() * setupParams.categories),
      rating: Math.ceil(Math.random() * 5),
    };
    cart.push(obj);
  }
  result.shopping_cart = cart;
  return JSON.stringify(result);
};

const createPurchase = () => {
  const params = {
    DelaySeconds: 10,
    MessageBody: generateCart(),
    QueueUrl: PURCHASE_URL,
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = {
  createPurchase,
};
