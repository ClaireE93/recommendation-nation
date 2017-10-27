const AWS = require('aws-sdk');
const { PURCHASE_URL } = require('../config/messageUrls.js');

// const REC_REQUEST_URL = 'https://sqs.us-east-2.amazonaws.com/402690953069/recRequests';

AWS.config.loadFromPath('./config/development.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const generateCart = () => {
  const result = {
    user_id: Math.ceil(Math.random() * 50000),
  };
  const cart = [];
  const tot = Math.ceil(Math.random() * 10); // Pick a random number of items
  for (let i = 0; i < tot; i += 1) {
    const obj = {
      productId: Math.ceil(Math.random() * 10000),
      category: Math.ceil(Math.random() * 1000),
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

//
//
// // const historic = require('./historic.js');
// const db = require('../db/purchases/index.js');
//
// // This is totally random
// // TODO: Use category data to make not random
// // TODO: This should send a message to the message bus for queueing, not add
// // directly to DB
//
// const createPurchase = (users, products) => {
//   const user = Math.ceil(Math.random() * users);
//   const product = Math.ceil(Math.random() * products);
//   const rating = Math.ceil(Math.random() * 5);
//   return db.addPurchase(null, product, user, rating);
// };


module.exports = {
  createPurchase,
};
