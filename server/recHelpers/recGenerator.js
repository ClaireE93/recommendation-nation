const Recommender = require('likely');
const pg = require('pg');
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const { Writable } = require('stream');
const db = require('../../db/purchases/index.js');
const mongo = require('../../db/recommendations/index.js');
// const elastic = require('../elasticsearch.js');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/purchases';
const client = new pg.Client(connectionString);

const userObj = {}; // Mapping user id to matrix index
const productObj = {}; // Mapping product id to matrix index
const matrix = [];

class MatrixWriteable extends Writable {
  constructor(inputMatrix) {
    super(inputMatrix);
    this.matrix = inputMatrix;
  }

  _write(chunk, encoding, next) {
    const chunkStr = chunk.toString();
    let objStr = '';
    let pointer = 0;
    while (pointer < chunkStr.length && chunkStr[pointer] !== '{') {
      pointer += 1;
    }
    objStr = chunkStr.slice(pointer);
    if (objStr.length < 2) {
      next();
      return;
    }
    const obj = JSON.parse(objStr);
    const row = userObj[obj.user_id];
    const col = productObj[obj.product_id];
    this.matrix[row][col] = obj.rating;
    next();
  }
}

const getPurchases = () => (
  new Promise((resolve) => {
    client.connect();
    const query = new QueryStream('SELECT * FROM purchase');
    const stream = client.query(query);
    stream.on('end', () => {
      client.end();
      resolve();
    });
    stream.pipe(JSONStream.stringify()).pipe(new MatrixWriteable(matrix));
  })
);

const generateMatrix = () => {
  let users;
  let products;

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

  return db.getAllUsers()
    .then((data) => {
      users = data;
      return db.getAllProducts();
    })
    .then((data) => {
      products = data;
      buildMatrix();
      return getPurchases();
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
      start = Date.now();
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
