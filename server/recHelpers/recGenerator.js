const Recommender = require('likely');
const pg = require('pg');
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const { Writable } = require('stream');
const PythonShell = require('python-shell');
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
  // const path = __dirname + '/svd.py';
  const path = 'svd.py';
  const pyshell = new PythonShell(path);
  const arr =[];
  for (let i = 0; i < 5; i += 1) {
    const cur = [];
    for (let j = 0; j < 5; j += 1) {
      cur.push(Math.random());
    }
    arr.push(cur);
  }
  const numCategories = 3 // FIXME: Get actual count from DB
  let [uStr, sigmaStr, vtStr] = ['', '', ''];
  let [isU, isSigma, isVT] = [false, false, false];
  let u;
  let sigma;
  let vt;
  // let uStr = '';
  // let sigmaStr = '';
  // let vtStr = '';
  // let isU = false;
  // let isSigma = false;
  // let isVT = false;

  // pyshell.send(JSON.stringify(arr)); // NOTE: Example of how to send something
  pyshell.send(JSON.stringify([numCategories, arr]));

  pyshell.on('message', (message) => {
    // received a message sent from the Python script (a simple "print" statement)
    console.log('MESSAGE IS', message); //JSON, must parse
    if (message === 'U') {
      isU = true;
    } else if (message === 'SIGMA') {
      isU = false;
      isSigma = true;
    } else if (message === 'VT') {
      isSigma = false;
      isVT = true;
    } else if (message === 'DONE') {
      isVT = false;
    } else if (isU) {
      uStr += message;
    } else if (isSigma) {
      sigmaStr += message;
    } else if (isVT) {
      vtStr += message;
    }
  });


  // end the input stream and allow the process to exit
  pyshell.end((err) => {
    if (err) {
      throw err;
    };
    u = JSON.parse(uStr);
    sigma = JSON.parse(sigmaStr);
    vt = JSON.parse(vtStr);
  });
  // const options = {
  //   mode: 'text',
  //   pythonPath: '/usr/bin/python',
  //   pythonOptions: ['-u'],
  //   scriptPath: __dirname,
  //   args: ['value1', 'value2', 'value3'],
  // };
  //
  // PythonShell.run('svd.py', options, (err, results) => {
  //   if (err) throw err;
  //   // results is an array consisting of messages collected during execution
  //   console.log('results: %j', results);
  // });




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
