const elasticsearch = require('elasticsearch');

const elasticClient = new elasticsearch.Client({
  host: process.env.ELASTIC_HOST ? `${process.env.ELASTIC_HOST}:9200` : 'localhost:9200',
  log: 'info',
});

module.exports = {
  elasticClient,
};
