const Slack = require('../services/slack')

// http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ElasticBeanstalk.html
const elasticbeanstalk = require('aws-sdk/clients/elasticbeanstalk')
const eb = new elasticbeanstalk({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  apiVersion: '2010-12-01'
})

const param = {
  EnvironmentName: process.env.AWS_EB_ENV_NAME,
  MaxRecords: 1
}

const UNKNOWN = 'unknown';
const DEPLOYING = 'deploying';
const DEPLOYED = 'deployed';
const MESSAGE_DEPLOYED = 'New application version was deployed to running EC2 instances.'
const MESSAGE_BACK_TO_OK = 'Environment health has transitioned from Warning to Ok.'
const MESSAGE_UPDATE_START = 'Environment update is starting.'
const MESSAGE_DEPLOYING_START = 'Deploying new version to instance(s).'

let status = UNKNOWN;
const informEBDeployed = () => {
  return new Promise(resolve => {
    eb.describeEvents(param, (err, data) => {
      const message = data.Events[0].Message;
      if ([MESSAGE_DEPLOYED, MESSAGE_BACK_TO_OK].some(m => message.startsWith(m))) {
        if (status === DEPLOYING) {
          status = DEPLOYED;
          Slack.sendMessage('G562RLQUD', 'Deployed new version to staging server, please check it.')
        }
      }
      if ([MESSAGE_DEPLOYING_START, MESSAGE_UPDATE_START].some(m => message.startsWith(m))) {
        if (status !== DEPLOYING) {
          status = DEPLOYING;
          Slack.sendMessage('G562RLQUD', 'Deploying new version to staging server, may have downtime caused request failed.')
        }
      }
    })
  })
}

module.exports = informEBDeployed
