require('dotenv').config()
require('newrelic')

const http = require("http")
const app = require('express')()

app.get('/', (req, res) => {
  res.send('Bot is running.')
})
app.listen(process.env.PORT)

// keep alive
setInterval(() => {
  http.get(`http://${process.env.HEROKU_APP_ID}.herokuapp.com`)
}, 5 * 60 * 1000)

require('./bot')
