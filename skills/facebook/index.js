const fetch = require('node-fetch')
const qs = require('query-string')

const shortUrl = ([url, ...rest]) => {
  url = url.replace(/[<>]/g, '')
  return fetch('https://graph.facebook.com', {
      method: 'POST', 
      body: qs.stringify({
        id: url.replace(/[<>]/g, ''),   
        scrape: true
      })
  }).then(res => res.json()).then(o => `https://www.facebook.com/sharer/sharer.php?u=${url}`)
}


const handler = ([url, ...rest]) => {
  if (url) {
    return shortUrl([url, ...rest])
  } else {
    return `usage:
facebook [url]`
  }
}

module.exports = handler
