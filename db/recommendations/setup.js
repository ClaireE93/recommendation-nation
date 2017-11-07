const mongoose = require('mongoose');
const { url } = require('../../config/mongo.js');

mongoose.connect(url, { useMongoClient: true });

const db = mongoose.connection;
db.on('error', (err) => { throw err; });
db.once('open', () => {
  console.log('mongoose connected');
});

const recSchema = mongoose.Schema({
  user: { type: Number, index: true, required: true },
  recommendations: {},
  count: Number,
  mae: Number,
});

const Recs = mongoose.model('Recs', recSchema);

module.exports = {
  Recs,
};
