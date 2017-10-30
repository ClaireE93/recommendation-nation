const pg = require('pg');
const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');
const { Writable } = require('stream');
const PythonShell = require('python-shell');
const db = require('../../db/purchases/index.js');
// const mongo = require('../../db/recommendations/index.js');
// const elastic = require('../elasticsearch/index.js');

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/purchases';
const client = new pg.Client(connectionString);

const userObj = {}; // Mapping user id to matrix index
const userArr = []; // Mapping matrix index to user id
const productObj = {}; // Mapping product id to matrix index
const productArr = []; // Mapping matrix index to product id
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
      userArr.push(users[i].user_id);
      matrix[i] = Array(m).fill(0);
    }
    for (let i = 0; i < products.length; i += 1) {
      productObj[products[i].product_id] = i;
      productArr.push(products[i].product_id);
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
  const final = [];
  const totUsers = 10; // This can be found by calling userObj keys.length
  const totProd = 5; // This can be found by calling productObj keys.length
  const chunking = 5000;

  // NOTE remove this when integrating with rest of file and real mxn matrix
  // NOTE: productArr and userArr will be an int representing user id or product id
  // This maps id to index since arr[index] = id. This is needed for python dataframe
  for (let i = 0; i < totProd; i += 1) {
    // productArr.push('prod' + (i + 1));
    productArr.push(i + 2);
  }
  for (let i = 0; i < totUsers; i += 1) {
    const cur = [];
    // userArr.push('user' + (i + 1));
    userArr.push(i + 2);
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
  const numCategories = 3;
  let isPred = false;
  const start = Date.now();
  // Slice array down and send
  const cuts = Math.ceil(arr.length / chunking);
  const toSend = [];
  for (let i = 0; i < cuts; i += 1) {
    const startInd = Math.floor((totUsers / cuts) * i);
    const endInd = Math.floor((totUsers / cuts) * (i + 1));
    toSend.push(arr.slice(startInd, endInd));
  }
  pyshell.send(JSON.stringify(numCategories));
  pyshell.send(JSON.stringify(userArr));
  pyshell.send(JSON.stringify(productArr));
  toSend.forEach((chunk) => {
    pyshell.send(JSON.stringify(chunk));
  });
  pyshell.on('message', (message) => {
    // received a message sent from the Python script (a simple "print" statement)
    console.log('MESSAGE IS', message);
    // if (message === 'PREDICTIONS') {
    //   isPred = true;
    // } else if (message === 'DONE') {
    //   isPred = false;
    // } else if (isPred) {
    //   final.push(JSON.parse(message));
    //   // predStr += message;
    // }
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
    // console.log('obj length is', final.length)
    // console.log('obj inner length is', final[0].length)
    // const row = Math.floor(Math.random() * totUsers);
    // const col = Math.floor(Math.random() * totProd);
    // console.log('row col are', row, col);
    // console.log('test retrieval', final[row][col])
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
