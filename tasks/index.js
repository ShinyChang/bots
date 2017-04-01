const createMessage = require('../formater/createMessage')

const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const sayHi = () => {
  return Promise.resolve('hi')
}

const tasks = [
  // {interval: 5 * SEC, job: sayHi}
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
  setInterval(() => {
    tasks.forEach(task => {
      const lastRun = new Date(task.lastRun || null).getTime()
      if (Date.now() - lastRun > task.interval) {
        task.job().then(content => {
          sendMessageToOwner(content)
        }).catch(err => console.log(err))
        task.lastRun = Date.now()
      }
    })
  }, SEC)
}
module.exports = heartbeat
