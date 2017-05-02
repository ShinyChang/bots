const broidSlack = require('@broid/slack')

const github = require('./skills/github')
const jira = require('./skills/jira')
const ping = require('./skills/ping')
const googl = require('./skills/googl')
const tasks = require('./tasks')
const createMessage = require('./formater/createMessage')


const slack = new broidSlack({
  token: process.env.SLACK_TOKEN,
  serviceID: process.env.BROID_SERVICE_ID
})

const sendMessage = (to, reply) => {
  if (typeof reply === 'string' && reply.length) {
    const content = {
      type: 'Note',
      content: reply
    }
    slack.send(createMessage(to, content))
  }
  if (typeof reply === 'object') {
    slack.send(createMessage(to, reply))
  }
}

slack.connect()
slack.listen().subscribe({
  next: data => {
    // skip bot messages
    if (data.actor.type === 'Application') {
      return
    }

    console.log(`Received message: `, data)
    const msgParts = data.object.content.split('\n')


    if (data.object.type === 'Note') {
      // mentioned in channel
      if (data.target.type === 'Group') {
        if (msgParts[0].trim().indexOf('<@U4J51E8GN>') !== 0) {
          return;
        }
        msgParts[0] = msgParts[0].replace('<@U4J51E8GN>', '')
      }

      const promises = msgParts.map(cmd => {
        const [skill, ...rest] = cmd.trim().split(' ')
        switch (skill) {
          case 'github':
            return github(rest)
          case 'jira':
            return jira(rest)
          case 'ping':
            return ping(rest)
          case 'googl':
            return googl(rest)
          case 'help':
            return Promise.resolve(`usage:
github [command]
jira [command]
ping [command]
googl [url]`)
        }
      })
      Promise.all(promises).then((replies) => {
        console.log(replies)
        replies.forEach(reply => {
          sendMessage(data.target, reply)
        })
      })
    }
  },
  error: err => console.error(err),
})

tasks(slack)

