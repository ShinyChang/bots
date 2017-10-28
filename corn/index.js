const http = require("http")
  
const SEC = 1000
const MIN = 60 * SEC
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const tasks = [
  {interval: 30 * SEC, job: require('./syncGitHubToJira')}, // 6 api calls, 12/min, 720/hr
  {interval: 1 * MIN, job: require('./pingHonestbeeProd')},
  {interval: 5 * SEC, job: require('./GitHubActivityToSlack')}, // 1 api call, 12/min, 720/hr
  {interval: 30 * SEC, job: require('./syncTravisCIToJira')},
  // {interval: 30 * SEC, job: require('./informEBDeployed')},
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
