// const url = process.env.MONGO_URL || 'mongodb://localhost/recs';
const url = process.env.MONGO_URL
  ? `mongodb://${process.env.MONGO_URL}:27017/recs`
  : 'mongodb://localhost/recs';

module.exports = { url };
