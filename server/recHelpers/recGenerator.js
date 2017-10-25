const Recommender = require('likely');
const db = require('../../db/purchases/index.js');
// const mongo = require('../../db/recommendations/index.js');
// const elastic = require('../elasticsearch.js');

const userObj = {}; // Mapping user id to matrix index
const productObj = {}; // Mapping product id to matrix index
const matrix = [];

const generateMatrix = () => {
  // Get all users
  // Get all products
  // Fill everything in with zeroes
  // get all purchases and fill in matrix
  let users;
  let products;
  let purchases;

  const buildMatrix = () => {
    const m = products.length;
    for (let i = 0; i < users.length; i += 1) {
      userObj[users[i].user_id] = i;
      matrix[i] = Array(m).fill(0);
    }
    for (let i = 0; i < products.length; i += 1) {
      productObj[products[i].product_id] = i;
    }
    // Clear for garbage collection
    users = [];
    products = [];
    return matrix;
  };

  const fillMatrix = () => {
    purchases.forEach((purchase) => {
      const row = userObj[Number(purchase.user_id)];
      const col = productObj[Number(purchase.product_id)];
      matrix[row][col] = purchase.rating;
    });

    purchases = [];
    return matrix;
  };

  return db.getAllUsers()
    .then((data) => {
      users = data.rows;
      return db.getAllProducts();
    })
    .then((data) => {
      products = data.rows;
      buildMatrix();
      return db.getAllPurchases();
    })
    .then((data) => {
      purchases = data.rows;
      fillMatrix();
    })
    .catch((err) => {
      throw err;
    });
};

const generateRecs = () => {
  // const rowLabels = [];
  // const colLabels = [];
  const Model = Recommender.buildModel(matrix);
  // TODO: Get recs for every user and store to mongo
  // const recommendations = Model.recommendations(0);
  console.log('done!');
};

const populateRecommendations = () => {
  let start = Date.now();
  let end;
  console.log('started at', new Date(start).toString());
  generateMatrix()
    .then(() => {
      end = Date.now();
      console.log('finished making base matrix', new Date(end).toString());
      console.log('finished in ms', end - start);
      generateRecs();
      end = Date.now();
      console.log('finished at', new Date(end).toString());
      console.log('finished in ms', end - start)
    });
};

populateRecommendations();

module.exports = {
  populateRecommendations,
};
