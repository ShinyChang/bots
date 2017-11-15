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

const lokalise = {
  'prod': require('bots-lokalise')(lokaliseProdConfig),
  'staging': require('bots-lokalise')(lokaliseStagingConfig),
  'dev': require('bots-lokalise')(lokaliseDevConfig),
}

const release ([env, ...rest]) {
  switch (env) {
    case 'd':
    case 'dev':
      return lokalise['dev'].handler(rest).then(() => 'released to develop')
    case 's':
    case 'staging':
      return lokalise['staging'].handler(rest).then(() => 'released to staging')
    case 'p':
    case 'prod':
    case 'production':
      return lokalise['prod'].handler(rest).then(() => 'released to production')
    default:
      return Promise.resolve(`usage:
lokalise release dev
lokalise release staging
lokalise release production`)
  }
}

const handler = ([action, ...rest], actorId) => {
  const actor = User.get(actorId)
  if (!actor || !actor.isAdmin) {
    return Promise.resolve('No Permission')
  }

  switch (action) {
    case 'release':
      return release(rest);
    default:
      return Promise.resolve(`usage:
lokalise release [env]`)
  }
}

module.exports = handler

