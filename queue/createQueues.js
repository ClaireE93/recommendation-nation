// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('./config/development.json');
// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });


const doesQueueExist = name => (
  new Promise((resolve) => {
    const params = {
      QueueName: name,
    };

    sqs.getQueueUrl(params, (err, data) => {
      if (err) {
        resolve(false);
      } else {
        resolve(data.QueueUrl);
      }
    });
  })
);

const createQueue = name => (
  new Promise((resolve, reject) => {
    const params = {
      QueueName: name,
      Attributes: {
        DelaySeconds: '60',
        MessageRetentionPeriod: '86400',
      },
    };

    sqs.createQueue(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.QueueUrl);
      }
    });
  })
);


const init = (name) => {
  let url;
  return doesQueueExist(name)
    .then(() => {
      if (url) {
        return url;
      }
      return createQueue(name);
    });
};

module.exports = {
  init,
}
