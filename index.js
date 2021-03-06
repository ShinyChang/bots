require('dotenv').config()

if (process.env.NODE_ENV === 'production') {
  require('newrelic')
}

const http = require("http")
const app = require('express')()
const JIRA = require('./services/jira');

app.get('/', (req, res) => {
  res.send('Bot is running.')
})

app.get('/jira/:issueKey/status', (req, res) => {
  JIRA.getIssue(req.params.issueKey).then(issue => {
    res.send(issue.fields.status)
  })
})

app.get('/jira/:issueKey/assignee', (req, res) => {
  JIRA.getIssue(req.params.issueKey).then(issue => {
    res.send(issue.fields.assignee.key || 'unassigned')
  })
})

app.get('/jira/:issueKey/summary', (req, res) => {
  JIRA.getIssue(req.params.issueKey).then(issue => {
    res.send(issue.fields.summary)
  })
})


app.listen(process.env.PORT)

// keep alive
setInterval(() => {
  console.log(`http://${process.env.HEROKU_APP_NAME}.herokuapp.com`)
  http.get(`http://${process.env.HEROKU_APP_NAME}.herokuapp.com`)
}, 5 * 60 * 1000);

require('./bot')
require('./cornJobs')()
