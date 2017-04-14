const fetch = require('node-fetch')

const shortUrl = ([longUrl, ...rest]) => {
  const url = `https://www.googleapis.com/urlshortener/v1/url?key=${process.env.SHORTENER_KEY}`
  const option = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      longUrl: longUrl.replace(/[<>]/g, '')
    })
  }
  return fetch(url, option).then(res => res.json()).then(data => {
    return {
      type: 'Image',
      url: `${data.id}.qr`,
      content: data.id
    }
  })
}


const handler = ([action, ...rest]) => {
  switch (action) {
    default:
      return shortUrl(rest)
  }
}

module.exports = handler
