const http = require("http")
const slack = require('../services/slack')
  
const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const tasks = [
  {interval: 30 * SEC, job: require('./syncGitHubToJira')},
  {interval: 1 * MIN, job: require('./pingHonestbeeProd')},
  {interval: 30 * SEC, job: require('./GitHubActivityToSlack')},
]

const heartbeat = () => {
  const sendMessageToUser = (userId, content) => {
    const owner = {
      type: 'Person',
      id: userId
    }
    const reply = {
      "type": "Note",
      content
    }
    content && slack.send(owner, reply)
  }

  setInterval(() => {
    tasks.forEach(task => {
      const lastRun = new Date(task.lastRun || null).getTime()
      if (Date.now() - lastRun > task.interval) {
        task.job().then(content => {
          if (typeof content === 'string') {
            sendMessageToUser(process.env.SLACK_USER_ID, content)

          // FIXME: integration with user service
          } else if (typeof content === 'object') {
            Object.keys(content).forEach((userId) => {
              sendMessageToUser(userId, content[userId].join('\n'))
            })
          }
        }).catch(err => console.log(err))
        task.lastRun = Date.now()
      }
    })
  }, SEC)
}

module.exports = heartbeat
