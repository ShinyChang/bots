require('dotenv').config()
require('newrelic')

const http = require("http")
const app = require('express')()

app.get('/', (req, res) => {
  res.send('Bot is running.')
})
app.listen(process.env.PORT)

require('./bot')
require('./corn')()
