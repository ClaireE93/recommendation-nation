const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const elastic = require('./elasticsearch');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const initElasticsearch = () => {
  elastic.indexExists()
    .then((exists) => {
      if (exists) {
        return elastic.deleteIndex();
      }
    })
    .then(elastic.initIndex)
    .then(elastic.initMapping)
    .then(() => {
      console.log('elasticsearch initialized');
    })
    .catch((err) => {
      throw err;
    });
};

initElasticsearch();


const sendElasticsearchRandom = () => {
  const obj = {
    user_id: Math.ceil(Math.random() * 10000),
    number: Math.ceil(Math.random() * 5),
  };
  elastic.addRec(obj);
};

setInterval(() => {
  sendElasticsearchRandom();
}, 1000);

const generateRecommendations = () => {
  // TODO: Create m x n matrix
  // Generate initial recs
  // Populate rec DB
};

const updatePurchases = () => {
  // TODO: Grab messages from message bus, parse, update db
  // update recommendations
  // EXTRA: Run analysis on recs
};

const checkForRequests = () => {
  // TODO: Check message bus for requests for user recommendations
};

const port = process.env.PORT || 3000;
app.listen(port, () => {});

module.exports = app;
