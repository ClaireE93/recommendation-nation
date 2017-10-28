const Recommender = require('likely');
const pg = require('pg');
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const { Writable } = require('stream');
const PythonShell = require('python-shell');
const fs = require("fs");
const db = require('../../db/purchases/index.js');
const mongo = require('../../db/recommendations/index.js');
const elastic = require('../elasticsearch/index.js');

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

// NOTE: This function could also parse out any recs below a certain rating
const parseRecs = (recs) => {
  const result = {};
  recs.forEach((rec) => {
    const [product, rating] = rec;
    result[product] = rating;
  });

  return result;
};

// FIXME: This needs to be in Python using Scikit
const generateRecs = () => {
  // const rowLabels = [];
  // const colLabels = [];
  const promiseArr = [];
  // const Model = Recommender.buildModel(matrix);
  // Object.keys(userObj).forEach((user) => {
  //   const recs = Model.recommendations(userObj[user]);
  //   const obj = parseRecs(recs);
  //   const promiseMongo = mongo.add(obj, user, recs.length);
  //   const promiseElastic = elastic.addRec({ user_id: user, number: recs.length, mae: 0 });
  //   promiseArr.push(promiseMongo);
  //   promiseArr.push(promiseElastic);
  // });


  // TODO: Get recs for every user and store to mongo
  // const recommendations = Model.recommendations(0);
  console.log('done making promises!');
  return Promise.all(promiseArr);
};

const populateRecommendations = () => {
  PythonShell.defaultOptions = { scriptPath: __dirname };
  const path = 'svd.py';
  const pyshell = new PythonShell(path);
  const arr = [];
  const users = {};
  const products = {};
  const final = [];
  const totUsers = 10;
  const totProd = 10;
  for (let i = 0; i < totUsers; i += 1) {
    const cur = [];
    users[i + 1] = i; // Map user IDs and products IDs to indeces (done in BuildMatriix)
    products[i + 1] = i;
    for (let j = 0; j < totProd; j += 1) {
      if (Math.random() > 0.5) {
        cur.push((Math.random() * 6).toFixed(5));
      } else {
        cur.push(0);
      }
    }
    arr.push(cur);
  }
  // FIXME: This should be between 20 and 100. This number should increase
  // Using MAE feedback
  const numCategories = 20;
  let predStr = '';
  let isPred = false;
  let predictions;
  const start = Date.now();
  // Slice array down and send
  const cuts = Math.floor(arr.length / 10000)
  const half = arr.slice(0, Math.floor(totUsers / 2));
  const half2 = arr.slice(Math.floor(totUsers / 2));

  pyshell.send(JSON.stringify(numCategories));
  pyshell.send(JSON.stringify(half));
  pyshell.send(JSON.stringify(half2));

  pyshell.on('message', (message) => {
    // received a message sent from the Python script (a simple "print" statement)
    console.log('MESSAGE IS', message);
    if (message === 'PREDICTIONS') {
      isPred = true;
    } else if (message === 'DONE') {
      isPred = false;
    } else if (isPred) {
      final.push(JSON.parse(message));
      // predStr += message;
    }
  });


  // end the input stream and allow the process to exit
  pyshell.end((err) => {
    if (err) {
      throw err;
    }
    // const content = JSON.parse(fs.readFileSync(__dirname + '/../../data.txt').toString());

    console.log('end');
    // predictions = JSON.parse(predStr);
    const end = Date.now();
    console.log('obj is', final)
    // console.log('test retrieval', final[Math.floor(Math.random() * 10000)][Math.floor(Math.random() * 1000)])
    console.log('DONE in ms:', end - start);
  });


  // let start = Date.now();
  // let end;
  // console.log('started at', new Date(start).toString());
  // generateMatrix()
  //   .then(() => {
  //     end = Date.now();
  //     console.log('finished making base matrix', new Date(end).toString());
  //     console.log('finished in ms', end - start);
  //     start = Date.now();
  //     return generateRecs();
  //   })
  //   .then(() => {
  //     end = Date.now();
  //     console.log('finished at', new Date(end).toString());
  //     console.log('finished in ms', end - start)
  //   })
};

populateRecommendations();

module.exports = {
  populateRecommendations,
};
