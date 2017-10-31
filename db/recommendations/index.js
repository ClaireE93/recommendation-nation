const { Recs } = require('./setup.js');

const add = (recObj = {}, user = 0, count = 0, mae) => (
  new Promise((resolve) => {
    let updateObj;
    if (mae === undefined) {
      updateObj = { recommendations: recObj, count };
    } else {
      // updateObj = { recommendations: recObj, count, mae };
      updateObj = { mae };
    }
    Recs.update(
      { user },
      updateObj,
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
