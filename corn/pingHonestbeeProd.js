const https = require('https')
const Slack = require('../services/slack')

const THRESHOLD = 8000
let pastTimes = []

const pingHonestbeeProd = () => {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    https.get(`https://honestbee.tw`, (res) => {
      const end = Date.now()
      resolve(end - start)
    }).on('error', (e) => {
      const end = Date.now()
      resolve(end - start)
    });
  }).then(time => {
    pastTimes.unshift(time)
    pastTimes = pastTimes.slice(0, 10)
    const count = pastTimes.reduce((carry, current) => {
      return current > THRESHOLD ? carry + 1 : carry
    }, 0)
    if (time > THRESHOLD && count >= 3) {
      const average = pastTimes.reduce((carry, current) => {
        return (current + carry) / 2
      }, 0)
      return `Production high latency\nPast times:\n${pastTimes.join('\n')}\nAverage: ${average}`
    }
  }).then(content => {
    Slack.sendMessage(process.env.SLACK_REPORT_CHANNEL_ID, content)
  })
}

module.exports = pingHonestbeeProd
