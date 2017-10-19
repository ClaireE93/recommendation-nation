const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const Recommender = require('likely');
const path = require('path');
const router = require('./routes');

const app = express();
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '/../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', (req, res) => {
  const rowLabels = [];
  const colLabels = [];
  const inputMatrix = [];
  for (let i = 0; i < 500; i += 1) {
    rowLabels.push(`User${i}`);
    colLabels.push(`Item${i}`);
    const cur = [];
    for (let j = 0; j < 500; j += 1) {
      const hasBought = Math.random() >= 0.25;
      if (hasBought) {
        const rating = Math.ceil(Math.random() * 5);
        cur.push(rating);
      } else {
        cur.push(0);
      }
    }
    inputMatrix.push(cur);
  }

  // const inputMatrix = [
  //   [1, 2, 3, 0],
  //   [4, 0, 5, 6],
  //   [7, 8, 0, 9],
  // ];
  // const rowLabels = ['John', 'Sue', 'Joe'];
  // const colLabels = ['Red', 'Blue', 'Green', 'Purple'];
  // console.log('input is', JSON.stringify(inputMatrix));
  const Model = Recommender.buildModel(inputMatrix, rowLabels, colLabels);
  const recommendations = Model.recommendations('User0');

  res.send(`recommendations are ${JSON.stringify(recommendations)}`);
});

app.use('/', router);


const port = process.env.PORT || 3000;
app.listen(port, () => {});

module.exports = app;
