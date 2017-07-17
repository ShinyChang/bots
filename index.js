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
    res.send(issue.fields.assignee.key)
  })
})

app.get('/jira/:issueKey/summary', (req, res) => {
  JIRA.getIssue(req.params.issueKey).then(issue => {
    res.send(issue.fields.summary)
  })
})


app.listen(process.env.PORT)

require('./bot')
require('./corn')()
