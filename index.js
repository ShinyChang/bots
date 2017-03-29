require('dotenv').config()
const app = require('express')()
const BroidSlack = require('broid-slack')
const github = require('./skills/github')
const jira = require('./skills/jira')



const sendTextMessage = (to, content) => {
  const reply = {
    "type": "Note",
    content
  }
  content && slack.send(createMessage(to, reply))
}

const createMessage = (to, object) => {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    "type": "Create",
    "generator": {
      "id": process.env.BROID_SERVICE_ID,
      "type": "Service",
      "name": "slack"
    },
    object,
    to
  }
}

const slack = new BroidSlack({
  token: process.env.SLACK_TOKEN,
  serviceID: process.env.BROID_SERVICE_ID
})

slack.connect()
slack.listen().subscribe({
  next: data => {
    // skip bot messages
    if (data.actor.type === 'Application') {
      return
    }
    console.log(`Received message: `, data)
    if (data.object.type === 'Note') {
      const promises = data.object.content.split('\n').map(cmd => {
        const [skill, ...rest] = cmd.split(' ')
        switch (skill) {
          case 'github':
            return github(rest)
            break
          case 'jira':
            return jira(rest)
            break
          default:
            return Promise.resolve()
            break
        }
      })
      Promise.all(promises).then((reply) => {
        sendTextMessage(data.actor, reply.join('\n'))
      })
    }
  },
  error: err => console.error(`Something went wrong: ${err.message}`),
})

app.get('/', function (req, res) {
  res.send('Bot is running.')
})
app.listen(process.env.PORT)
