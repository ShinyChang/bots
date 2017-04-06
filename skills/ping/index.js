const fetch = require('node-fetch')

const option = {
  headers: {
    Accept: 'application/vnd.honestbee+json;version=2'
  }
}

const pingProduction = () => {
  const url = 'https://core.honestbee.com/api/brands/available_services?countryCode=SG'
  const start = Date.now()
  return fetch(url, option).then(res => res.json()).then(data => {
    const diff = (Date.now() - start) / 1000
    return `Spent: ${diff}s`
  })
}

const pingStaging = () => {
  const url = 'https://core-staging.honestbee.com/api/brands/available_services?countryCode=SG'
  const start = Date.now()
  return fetch(url, option).then(res => res.json()).then(data => {
    const diff = (Date.now() - start) / 1000
    return `Spent: ${diff}s`
  })
}

const pingDevelop = () => {
  const url = 'https://core-dev.honestbee.com/api/brands/available_services?countryCode=SG'
  const start = Date.now()
  return fetch(url, option).then(res => res.json()).then(data => {
    const diff = (Date.now() - start) / 1000
    return `Spent: ${diff}s`
  })
}

const handler = ([action, ...rest]) => {
  switch (action) {
    case 'p':
    case 'prod':
    case 'production':
      return pingProduction(rest)
    case 's':
    case 'st':
    case 'staging':
      return pingStaging(rest)
    case 'd':
    case 'dev':
    case 'develop':
      return pingDevelop(rest)
    default:
      return Promise.resolve(`usage:
ping production
ping staging
ping develop`)
  }
}

module.exports = handler
