const AWS = require('aws-sdk');
const { PURCHASE_URL } = require('../config/messageUrls.js');
const { setupParams } = require('./config.js');
const mongo = require('../db/recommendations');

AWS.config.loadFromPath('./config/development.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

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

const addOnePurchase = productId => (
  {
    category: Math.ceil(Math.random() * setupParams.categories), // This doesn't matter
    rating: +(Math.random() * 5).toFixed(4),
    productId,
  }
);

// This function ensures that at least one purchase is from a recommendation
// which is needed to calculate MAE. If this is not hard coded, the permutations
// of purchases is so high such that most purchases will not contain a rec and MAE
// will remain undefined/0
const calcPurchases = (recs) => {
  const cart = [];
  const numFromRecs = Math.ceil(Math.random() * 10);
  let nonRecs = Math.ceil(Math.random() * 15) - numFromRecs;
  const shuffledRecs = shuffle(Object.keys(recs));
  let pointer = 0;
  while (pointer < numFromRecs && shuffledRecs[pointer] !== undefined) {
    cart.push(addOnePurchase(Number(shuffledRecs[pointer])));
    pointer += 1;
  }
  while (nonRecs > 0) {
    cart.push(addOnePurchase(Math.ceil(Math.random() * setupParams.products)));
    nonRecs -= 1;
  }
  return cart;
};

// Create cart
async function generateCart() {
  const result = {
    user_id: Math.ceil(Math.random() * setupParams.users),
  };
  const data = await mongo.fetch(result.user_id);
  result.shopping_cart = calcPurchases(data.recommendations);
  return JSON.stringify(result);
}

async function createPurchase() {
  const params = {
    DelaySeconds: 10,
    MessageBody: await generateCart(),
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
}

module.exports = {
  createPurchase,
};
