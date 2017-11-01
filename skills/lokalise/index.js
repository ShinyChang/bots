const User = require('../../services/user')

const lokaliseConfig = {
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  LOKALISE_API_TOKEN: process.env.LOKALISE_API_TOKEN,
  LOKALISE_BASE_PATH: process.env.LOKALISE_BASE_PATH,
  LOKALISE_PROJECT_ID: process.env.LOKALISE_PROJECT_ID,
}

const lokalise = require('bots-lokalise')(lokaliseConfig)

const handler = ([action, ...rest], actorId) => {
  const actor = User.get(actorId)
  if (!actor || !actor.isAdmin) {
    return Promise.resolve('No Permission')
  }

  switch (action) {
    case 'release':
      return lokalise.handler(rest).then(() => 'released')
    default:
      return Promise.resolve(`usage:
lokalise release`)
  }
}

module.exports = handler

