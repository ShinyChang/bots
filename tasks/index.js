const createMessage = require('../formater/createMessage')
const http = require("http")
  
const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const pingOBuy = () => {
  return new Promise(resolve => {
    http.get(`http://obuy.shinychang.net/`, res => {
      resolve('obuy is alive')
    })
  })
}

const tasks = [
  {interval: 5 * MIN, job: pingOBuy}
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
