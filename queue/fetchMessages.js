const AWS = require('aws-sdk');
const Consumer = require('sqs-consumer');
const {
  REC_REQUEST_URL,
  PURCHASE_URL,
  REC_SEND_URL,
  ACCESS_KEY,
  SECRET_KEY,
  REGION,
} = require('../config/messageUrls.js');
const db = require('../db/purchases');
const mongo = require('../db/recommendations');
const elastic = require('../server/elasticsearch');

AWS.config.loadFromPath('./config/development.json');
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

AWS.config.update({
  region: REGION,
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY,
});

// MAE = sumAllPurchases(abs(actual - expected)) / total
// Calculate MAE for user
const calcMAE = (expected = {}, actual = []) => {
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

// Update user's MAE based on actual purchases
const updateMAE = purchases => (
  mongo.fetch(purchases.user_id)
    .then((data) => {
      if (!data) { return null; }
      const mae = calcMAE(data.recommendations, purchases.shopping_cart);
      const arr = [mongo.add(null, data.user, null, mae)];
      arr.push(elastic.addRec({ user_id: data.user, number: data.count, mae }));
      return Promise.all(arr);
    })
);

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
    })
    .catch((err) => {
      throw err;
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

const recRequest = Consumer.create({
  queueUrl: REC_REQUEST_URL,
  handleMessage: (message, done) => {
    const parsedMessage = JSON.parse(message.Body);
    const user = parsedMessage.user_id;
    mongo.fetch(user)
      .then((recData) => {
        if (recData) {
          return sendRecs(recData);
        }
        const emptyResp = {
          user_id: user,
          recommendations: {},
          count: 0,
        };
        return sendRecs(emptyResp);
      })
      .then(() => {
        done();
      });
  },
  sqs: new AWS.SQS(),
});

const purchaseRequest = Consumer.create({
  queueUrl: PURCHASE_URL,
  handleMessage: (message, done) => {
    const body = JSON.parse(message.Body);
    updateMAE(body)
      .then(() => {
        updateDB(body);
      })
      .then(() => {
        done();
      });
  },
  sqs: new AWS.SQS(),
});

recRequest.on('error', (err) => {
  console.error(err.message);
});

purchaseRequest.on('error', (err) => {
  console.error(err.message);
});

// Export functions for unit testing
module.exports = {
  purgeQueue,
  calcMAE,
  checkPurchase,
  recRequest,
  purchaseRequest,
};
