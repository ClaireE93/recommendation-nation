const pg = require('pg');
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const { Writable } = require('stream');
const PythonShell = require('python-shell');
const db = require('../../db/purchases/index.js');
const { setupParams } = require('../../generators/config.js');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/purchases';
const client = new pg.Client(connectionString);

let userObj = {}; // Mapping user id to matrix index
let userArr = []; // Mapping matrix index to user id
let productObj = {}; // Mapping product id to matrix index
let productArr = []; // Mapping matrix index to product id
let matrix = [];

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
      userArr.push(users[i].user_id);
      matrix[i] = Array(m).fill(0);
    }
    for (let i = 0; i < products.length; i += 1) {
      productObj[products[i].product_id] = i;
      productArr.push(products[i].product_id);
    }
    // Clear for garbage collection
    users = null;
    products = null;
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
    .then(() => {
      userObj = null;
      productObj = null;
    })
    .catch((err) => {
      throw err;
    });
};

const generateRecs = () => {
  PythonShell.defaultOptions = { scriptPath: __dirname };
  const path = 'svd.py';
  const pyshell = new PythonShell(path);
  const chunking = 5000;

  // Slice array down and send
  const cuts = Math.ceil(matrix.length / chunking);
  const toSend = [];
  const multiplier = setupParams.users / cuts;
  for (let i = 0; i < cuts; i += 1) {
    const startInd = Math.floor(multiplier * i);
    const endInd = Math.floor(multiplier * (i + 1));
    toSend.push(matrix.slice(startInd, endInd));
  }

  matrix = null;
  pyshell.send(JSON.stringify(setupParams.categories));
  pyshell.send(JSON.stringify(userArr));
  userArr = null;
  pyshell.send(JSON.stringify(productArr));
  productArr = null;
  for (let i = 0; i < toSend.length; i += 1) {
    let obj = JSON.stringify(toSend[i]);
    pyshell.send(obj);
    obj = null;
    toSend[i] = null;
  }
  // pyshell.on('message', (message) => {
  //   // received a message sent from the Python script (a simple "print" statement)
  //   console.log('message: ', message);
  // });


  // end the input stream and allow the process to exit
  pyshell.end((err) => {
    if (err) {
      throw err;
    }
  });
};

const populateRecommendations = () => {
  generateMatrix()
    .then(() => (
      generateRecs()
    ));
};

// populateRecommendations();

module.exports = {
  populateRecommendations,
};
