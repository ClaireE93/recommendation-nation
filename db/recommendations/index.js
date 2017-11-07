const { Recs } = require('./setup.js');

// Update/add record
const add = (recObj = {}, user = 0, count = 0, mae) => (
  new Promise((resolve) => {
    const updateObj = mae === undefined ? { recommendations: recObj, count } : { mae };
    Recs.update(
      { user },
      updateObj,
      { upsert: true, setDefaultsOnInsert: true },
      () => {
        resolve();
      }
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

const removeRecs = () => (
  new Promise((resolve, reject) => {
    Recs.remove({}, (err, data) => {
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
  removeRecs,
};
