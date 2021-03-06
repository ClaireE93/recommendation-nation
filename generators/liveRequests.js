const AWS = require('aws-sdk');
const { REC_REQUEST_URL } = require('../config/messageUrls.js');
const { setupParams } = require('./config.js');

AWS.config.loadFromPath('./config/development.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// Simulate live requests for user recommendations
const createRequest = () => {
  const params = {
    DelaySeconds: 10,
    MessageBody: JSON.stringify({ user_id: Math.ceil(Math.random() * setupParams.users) }),
    QueueUrl: REC_REQUEST_URL,
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};


module.exports = {
  createRequest,
};
