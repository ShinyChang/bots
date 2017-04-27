const http = require("http")
const createMessage = require('../formater/createMessage')
  
const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const tasks = [
  {interval: 30 * SEC, job: require('./syncGitHubToJira')},
  {interval: 1 * MIN, job: require('./pingHonestbeeProd')},
  {interval: 30 * SEC, job: require('./GitHubActivityToSlack')},
]

const heartbeat = (bot) => {
  const sendMessageToOwner = (content) => {
    const owner = {
      type: 'Person',
      id: process.env.SLACK_USER_ID
    }
    const reply = {
      "type": "Note",
      content
    }
    content && bot.send(createMessage(owner, reply))
  }
  const sendMessageToUser = (userId, content) => {
    const owner = {
      type: 'Person',
      id: userId
    }
    const reply = {
      "type": "Note",
      content
    }
    content && bot.send(createMessage(owner, reply))
  }
  setInterval(() => {
    tasks.forEach(task => {
      const lastRun = new Date(task.lastRun || null).getTime()
      if (Date.now() - lastRun > task.interval) {
        task.job().then(content => {
          if (typeof content === 'string') {
            sendMessageToOwner(content)
          } else if (typeof content === 'object') {
            Object.keys(content).forEach((contents, userId) => {
              sendMessageToUser(userId, contents.join('\n'))
            })
          }
        }).catch(err => console.log(err))
        task.lastRun = Date.now()
      }
    })
  }, SEC)
}

module.exports = heartbeat
