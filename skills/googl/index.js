const fetch = require('node-fetch')

const shortUrl = (longUrl) => {
  const url = 'https://www.googleapis.com/urlshortener/v1/url'
  const option = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: {
      longUrl
    }
  }
  return fetch(url, option).then(res => res.json).then(data => {
    return {
      type: 'Image',
      url: `${data.shortUrl}.qr`,
      content: data.shortUrl
    }
  })
}


const handler = ([action, ...rest]) => {
  switch (action) {
    case 'short':
      return shortUrl(rest)
    default:
      return Promise.resolve(`usage:
googl short [url]
`)
  }
}

module.exports = handler
