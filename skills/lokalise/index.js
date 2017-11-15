const User = require('../../services/user')
const Github = require('../../services/github')

const lokaliseBaseConfig = {
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  LOKALISE_API_TOKEN: process.env.LOKALISE_API_TOKEN,
  LOKALISE_BASE_PATH: process.env.LOKALISE_BASE_PATH,
  LOKALISE_PROJECT_ID: process.env.LOKALISE_PROJECT_ID,
}

const lokaliseDevConfig = {...lokaliseBaseConfig, AWS_S3_BUCKET: process.env.AWS_S3_DEV_BUCKET}
const lokaliseStagingConfig = {...lokaliseBaseConfig, AWS_S3_BUCKET: process.env.AWS_S3_STAGING_BUCKET}
const lokaliseProdConfig = {...lokaliseBaseConfig, AWS_S3_BUCKET: process.env.AWS_S3_BUCKET}

const lokaliseProd = require('bots-lokalise')(lokaliseProdConfig)
const lokaliseStaging = require('bots-lokalise')(lokaliseStagingConfig)
const lokaliseDev = require('bots-lokalise')(lokaliseDevConfig)

const handler = ([action, ...rest], actorId) => {
  const actor = User.get(actorId)
  if (!actor || !actor.isAdmin) {
    return Promise.resolve('No Permission')
  }

  switch (action) {
    case 'release prod':
    case 'release production':
      return lokaliseProd.handler(rest).then(() => 'released to production')
    case 'release staging':
      return lokaliseStaging.handler(rest).then(() => 'released to staging')
    case 'release dev':
      return lokaliseDev.handler(rest).then(() => 'released to dev')
    default:
      return Promise.resolve(`usage:
lokalise release [dev|staging|prod]`)
  }
}

module.exports = handler

