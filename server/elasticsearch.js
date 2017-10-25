const elasticsearch = require('elasticsearch');

const elasticClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'info',
});

const indexName = 'recs';

/**
* Delete an existing index
*/
const deleteIndex = () => (
  elasticClient.indices.delete({
    index: indexName,
  })
);

/**
* create the index
*/
const initIndex = () => (
  elasticClient.indices.create({
    index: indexName,
  })
);

/**
* check if the index exists
*/
const indexExists = () => (
  elasticClient.indices.exists({
    index: indexName,
  })
);

const initMapping = () => (
  elasticClient.indices.putMapping({
    index: indexName,
    type: 'recommendation',
    body: {
      properties: {
        number: { type: 'integer' },
        user: { type: 'integer' },
      },
    },
  })
);

const addRec = rec => (
  elasticClient.index({
    index: indexName,
    type: 'recommendation',
    body: {
      number: rec.number,
      user: rec.user_id,
    },
  })
);

module.exports = {
  deleteIndex,
  initIndex,
  indexExists,
  initMapping,
  addRec,
};
