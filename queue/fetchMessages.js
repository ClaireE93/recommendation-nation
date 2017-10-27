const AWS = require('aws-sdk');
const { REC_REQUEST_URL, PURCHASE_URL, REC_SEND_URL } = require('../config/messageUrls.js');
const db = require('../db/purchases');
const mongo = require('../db/recommendations');
const elastic = require('../server/elasticsearch');

AWS.config.loadFromPath('./config/development.json');
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// mongo.add({ 5: 1.5, 3: 4.3 }, 3, 2 });
// MAE = sumAllPurchases(abs(actual - expected)) / total
// Calculate MAE for user
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
// Update user's MAE based on actual purchases
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

// See if all purchase elements exist (user, product, category).
// If they don't exist, add them to DBs
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

// Update purchase DB with new purchases
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

const params = {
  AttributeNames: [
    'SentTimestamp',
  ],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: [
    'All',
  ],
  VisibilityTimeout: 0,
  WaitTimeSeconds: 0,
};

// Check for new purchases
const receivePurchases = () => {
  params.QueueUrl = PURCHASE_URL;

  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      throw err;
    } else {
      const body = JSON.parse(data.Messages[0].Body);
      return updateMAE(body)
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

// Send user recommendations
const sendRecs = (object) => {
  const sendParams = {
    DelaySeconds: 10,
    MessageBody: JSON.stringify(object),
    QueueUrl: REC_SEND_URL,
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(sendParams, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

// TODO: This function should fetch recommendations by user id from mongo
// And publish user and recs to the recResponse message bus
// For now, hard code the user so it pulls the one user that's in the mogno DB
// Replace with actual user once recommendation service works!
// Receive requests for user recommendations
const receiveRequests = () => {
  params.QueueUrl = REC_REQUEST_URL;

  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      throw err;
    } else {
      const user = JSON.parse(data.Messages[0].Body).user_id;
      // mongo.fetch(user)
      mongo.fetch(3) // FIXME: Remove for live data
        .then((recData) => {
          if (recData) {
            return sendRecs(recData);
          }
          const emptyResp = {
            user_id: user,
            recommendations: {},
            mae: 0,
            count: 0,
          };
          return sendRecs(emptyResp);
        })
        .then(() => {
          const deleteParams = {
            QueueUrl: REC_REQUEST_URL,
            ReceiptHandle: data.Messages[0].ReceiptHandle,
          };
          return deleteMessage(deleteParams);
        });
    }
  });
};

// Go through all incoming messages for given bus
const processAllMessages = isPurchase => (
  new Promise((resolve, reject) => {
    const QueueUrl = isPurchase ? PURCHASE_URL : REC_REQUEST_URL;
    const func = isPurchase ? receivePurchases : receiveRequests;
    sqs.getQueueAttributes({ AttributeNames: ['ApproximateNumberOfMessages'], QueueUrl }, (err, data) => {
      const num = data.Attributes.ApproximateNumberOfMessages;
      const promiseArr = [];
      for (let i = 0; i < num; i += 1) {
        promiseArr.push(func());
      }
      Promise.all(promiseArr)
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  })
);

const purgeQueue = (url) => {
  const purgeParams = {
    QueueUrl: url,
  };
  return new Promise((resolve, reject) => {
    sqs.purgeQueue(purgeParams, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = {
  receiveRequests,
  receivePurchases,
  processAllMessages,
  purgeQueue,
};
