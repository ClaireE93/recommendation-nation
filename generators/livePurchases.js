const AWS = require('aws-sdk');
const { PURCHASE_URL } = require('../config/messageUrls.js');
const { setupParams } = require('./config.js');

AWS.config.loadFromPath('./config/development.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const generateCart = () => {
  const result = {
    user_id: Math.ceil(Math.random() * setupParams.users),
  };
  const cart = [];
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
