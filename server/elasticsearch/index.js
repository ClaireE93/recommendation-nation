const { elasticClient } = require('./setup.js');

const indexName = 'recs';

const deleteIndex = () => (
  elasticClient.indices.delete({
    index: indexName,
  })
);

const initIndex = () => (
  elasticClient.indices.create({
    index: indexName,
  })
);

const indexExists = () => (
  elasticClient.indices.exists({
    index: indexName,
  })
);



// Initialize index mapping
const initMapping = () => (
  elasticClient.indices.putMapping({
    index: indexName,
    type: 'recommendation',
    body: {
      properties: {
        number: { type: 'integer' },
        user: { type: 'integer' },
        mae: { type: 'float' },
      },
    },
  })
);

const initElasticsearch = () => {
  indexExists()
    .then((exists) => {
      if (exists) {
        return deleteIndex();
      }
      return exists;
    })
    .then(initIndex)
    .then(initMapping)
    .catch((err) => {
      throw err;
    });
};

// Add record to elasticsearch
const addRec = rec => (
  elasticClient.index({
    index: indexName,
    type: 'recommendation',
    id: rec.user_id,
    body: {
      number: rec.number,
      user: rec.user_id,
      mae: rec.mae,
    },
  })
);

module.exports = {
  deleteIndex,
  initIndex,
  indexExists,
  initMapping,
  addRec,
  initElasticsearch,
};
