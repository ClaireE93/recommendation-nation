const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const Recommender = require('likely');
const db = require('../db/purchases/index');
const historic = require('../generators/historic');
// const router = require('./routes');

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


historic.setup(10, 10, 3, 10)
  .then(() => {
    console.log('DONE with setup');
  })
  .catch((err) => {
    console.log('ERROR in setup', err);
  });


// app.use('/', (req, res) => {
//   const rowLabels = [];
//   const colLabels = [];
//   const inputMatrix = [];
//   // Create results object for performance measuring
//   const results = {};
//   results.pre = (new Date()).toString();
//   for (let i = 0; i < 500; i += 1) {
//     rowLabels.push(`User${i}`);
//     colLabels.push(`Item${i}`);
//     const cur = [];
//     for (let j = 0; j < 500; j += 1) {
//       const hasBought = Math.random() >= 0.25;
//       if (hasBought) {
//         const rating = Math.ceil(Math.random() * 5);
//         cur.push(rating);
//       } else {
//         cur.push(0);
//       }
//     }
//     inputMatrix.push(cur);
//   }
//
//   // const inputMatrix = [
//   //   [1, 2, 3, 0],
//   //   [4, 0, 5, 6],
//   //   [7, 8, 0, 9],
//   // ];
//   // const rowLabels = ['John', 'Sue', 'Joe'];
//   // const colLabels = ['Red', 'Blue', 'Green', 'Purple'];
//   // console.log('input is', JSON.stringify(inputMatrix));
//   results.start = (new Date()).toString();
//   // This is the slow part! (~8 minutes for 500 x 500 matrix)
//   const Model = Recommender.buildModel(inputMatrix, rowLabels, colLabels);
//   // This part is fast
//   const recommendations = Model.recommendations('User0');
//   results.rec1 = recommendations;
//   results.time1 = (new Date()).toString();
//   const rec2 = Model.recommendations('User1');
//   results.rec2 = rec2;
//   results.time2 = (new Date()).toString();
//
//   res.send(`recommendations are ${JSON.stringify(results)}`);
// });

const port = process.env.PORT || 3000;
app.listen(port, () => {});

module.exports = app;
