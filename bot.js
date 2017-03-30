const broidSlack = require('broid-slack')

const github = require('./skills/github')
const jira = require('./skills/jira')


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

const slack = new broidSlack({
  token: process.env.SLACK_TOKEN,
  serviceID: process.env.BROID_SERVICE_ID
})

const sendTextMessage = (to, content) => {
  const reply = {
    "type": "Note",
    content
  }
  content && slack.send(createMessage(to, reply))
}

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
          case 'jira':
            return jira(rest)
          default:
            return Promise.resolve(`usage:
github [command]
jira [command]`)
        }
      })
      Promise.all(promises).then((reply) => {
        sendTextMessage(data.actor, reply.join('\n'))
      })
    }
  },
  error: err => console.error(`Something went wrong: ${err.message}`),
})


