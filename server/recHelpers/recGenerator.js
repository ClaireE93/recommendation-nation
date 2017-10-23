const Recommender = require('likely');
const db = require('../../db/purchases/index.js');
const mongo = require('../../db/recommendations/index.js');

const userObj = {}; // Mapping user id to matrix index
const productObj = {}; // Mapping product id to matrix index
const matrix = [];

const generateMatrix = () => {

};

const generateRecs = () => {
  const rowLabels = [];
  const colLabels = [];
  const Model = Recommender.buildModel(matrix, rowLabels, colLabels);
  // TODO: Get recs for every user and store to mongo
  //   const recommendations = Model.recommendations('User0');
};

const populateRecommendations = () => {
  generateMatrix();
  generateRecs();
};

module.exports = {
  populateRecommendations,
};
