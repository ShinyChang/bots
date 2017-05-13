const http = require("http")
  
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
  setInterval(() => {
    tasks.forEach(task => {
      const lastRun = new Date(task.lastRun || null).getTime()
      if (Date.now() - lastRun > task.interval) {
        task.job().catch(err => console.log(err))
        task.lastRun = Date.now()
      }
    })
  }, SEC)
}

module.exports = heartbeat
