const AWS = require('aws-sdk');
const { REC_REQUEST_URL, PURCHASE_URL } = require('../config/messageUrls.js');
const db = require('../db/purchases');
const mongo = require('../db/recommendations');
const elastic = require('../server/elasticsearch');

AWS.config.loadFromPath('./config/development.json');
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// mongo.add({ 5: 1.5, 3: 4.3 }, 3, 2 });
// MAE = sumAllPurchases(abs(actual - expected)) / total
const calcMAE = (expected = {}, actual) => {
  let tot = 0;
  const sums = [];

  actual.forEach((purchase) => {
    if (expected[purchase.productId]) {
      sums.push(Math.abs(purchase.rating - expected[purchase.productId]));
      tot += 1;
    }
  });
  if (!sums.length) { return 0; }
  const numerator = sums.reduce((a, b) => (
    a + b
  ));

  return numerator / tot;
};

// FIXME: Uses hardcoded numbers for now
const updateMAE = (purchases) => {
  let curRecs;
  // FIXME: Remove me when it's not dummy data!
  const dummyRec = { 5: 1.5, 3: 4.3 };
  const dummyUser = 3;
  const dummyCount = 2;
  const dummyCart = [{ productId: 5, rating: 3 }, { productId: 3, rating: 5 }];

  // mongo.fetch(purchases.user_id)
  return mongo.add({ 5: 1.5, 3: 4.3 }, 3, 2) // FIXME: Remove with real data
    .then(() => (
      mongo.fetch(dummyUser)
    ))
    .then((data) => {
      if (!data) { return null; }
      // const mae = calcMAE(data.recommendations, purchases.shopping_cart);
      const mae = calcMAE(dummyRec, dummyCart);
      // const arr = mongo.add(null, data.user_id, null, mae);
      const arr = [mongo.add(null, dummyUser, null, mae)];
      // arr.push(elastic.add({ user_id: data.user_id, number: data.count, mae }));
      arr.push(elastic.addRec({ user_id: dummyUser, number: dummyCount, mae }));
      return Promise.all(arr);
    });
};

const checkPurchase = purchase => (
  db.getOneCategory(purchase.category)
    .then((data) => {
      if (!data.rows) {
        return db.addCategory(purchase.category);
      }
      return data;
    })
    .then(() => (
      db.getOneProduct(purchase.productId)
    ))
    .then((data) => {
      if (!data.rows) {
        return db.addProduct(purchase.productId, purchase.category);
      }
      return data;
    })
);

const updateDB = (purchases) => {
  const user = purchases.user_id;
  const cart = purchases.shopping_cart;
  db.getOneUser(user)
    .then((data) => {
      if (!data.rows) {
        return db.addUser(user);
      }
      return data.rows[0];
    })
    .then(() => {
      const arr = [];
      cart.forEach((purchase) => {
        const promise = checkPurchase(purchase, user)
          .then(() => (
            db.addPurchase(null, purchase.productId, user, purchase.rating)
          ));
        arr.push(promise);
      });
      return Promise.all(arr);
    });
};

const deleteMessage = deleteParams => (
  new Promise((resolve, reject) => {
    sqs.deleteMessage(deleteParams, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
);

const receivePurchases = () => {
  const params = {
    AttributeNames: [
      'SentTimestamp',
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
      'All',
    ],
    QueueUrl: PURCHASE_URL,
    VisibilityTimeout: 0,
    WaitTimeSeconds: 0,
  };

  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      throw err;
    } else {
      // console.log('message received', data);
      const body = JSON.parse(data.Messages[0].Body);
      updateMAE(body)
        .then(() => {
          updateDB(body);
        })
        .then(() => {
          const deleteParams = {
            QueueUrl: PURCHASE_URL,
            ReceiptHandle: data.Messages[0].ReceiptHandle,
          };
          return deleteMessage(deleteParams);
        });
    }
  });
};

const receiveRequests = () => {

};

module.exports = {
  receiveRequests,
  receivePurchases,
};
