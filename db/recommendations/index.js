const { Recs } = require('./setup.js');
// const mongoose = require('mongoose');
//
// mongoose.connect('mongodb://localhost/recs', { useMongoClient: true });
//
// const db = mongoose.connection;
// db.on('error', (err) => { throw err; });
// db.once('open', () => {
//   console.log('mongoose connected');
// });
//
// const recSchema = mongoose.Schema({
//   user: { type: Number, index: true, required: true },
//   recommendations: {},
//   count: Number,
// });
//
// const Recs = mongoose.model('Recs', recSchema);


const add = (recObj = {}, user = 0, count = 0, mae = 0) => (
  new Promise((resolve) => {
    Recs.update(
      { user },
      { recommendations: recObj, count, mae },
      { upsert: true, setDefaultsOnInsert: true },
      () => {
        resolve();
      },
    );
  })
);

const fetch = (user = 0) => (
  new Promise((resolve, reject) => {
    Recs.findOne({ user }, (err, data) => {
      if (err) {
        reject();
      } else {
        resolve(data);
      }
    });
  })
);


module.exports = {
  add,
  fetch,
};
