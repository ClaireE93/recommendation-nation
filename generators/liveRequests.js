const AWS = require('aws-sdk');
const { REC_REQUEST_URL } = require('../config/messageUrls.js');

// const REC_REQUEST_URL = 'https://sqs.us-east-2.amazonaws.com/402690953069/recRequests';

AWS.config.loadFromPath('./config/development.json');

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const createRequest = () => {
  const params = {
    DelaySeconds: 10,
    MessageBody: JSON.stringify({ user_id: Math.ceil(Math.random() * 50000) }),
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
