const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/recs', { useMongoClient: true });

const db = mongoose.connection;
db.on('error', (err) => { throw err; });
db.once('open', () => {
  console.log('mongoose connected');
});

const recSchema = mongoose.Schema({
  user: { type: Number, index: true, required: true },
  recommendations: {},
});

const Recs = mongoose.model('Recs', recSchema);

const add = (recObj = {}, user = 0, cb) => {
  Recs.update(
    { user },
    { recommendations: recObj },
    { upsert: true, setDefaultsOnInsert: true },
    cb,
  );
};

const fetch = (user = 0, cb) => {
  Recs.findOne({ user }, cb);
};


module.exports = {
  add,
  fetch,
  Recs,
};
