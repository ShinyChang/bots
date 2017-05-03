const broidSlack = require('@broid/slack')

class Slack {
  constructor(config) {
    this.skills = {};
    this.instance = new broidSlack(config)
  }

  setup() {
    this.instance.connect()
    this.instance.listen().subscribe({
      next: this.onMessage.bind(this),
      error: err => console.error(err),
    })
  }

  onMessage(data) {
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
      const skillNames = Object.keys(this.skills);
      const promises = msgParts.map(cmd => {
        const [skillName, ...rest] = cmd.trim().split(' ')
        
        if (skillNames.includes(skillName)) {
          return this.skills[skillName](rest)
        } else if (skillName === 'help') {
          return `usage:\n${skillNames.map(name => `${name} [command]`).join('\n')}`
        }
      })
      Promise.all(promises).then((replies) => {
        replies.forEach(reply => {
          this.sendMessage(data.target.id, reply)
          reply && this.sendMessage(process.env.SLACK_REPORT_CHANNEL_ID, `Replied to ${data.actor.name}\n${reply}`)
        })
      }).catch(err => console.log(err))
    }
  }

  addSkill(command, reply) {
    this.skills[command] = reply
  }

  sendMessage(id, reply) {
    const target = {
      type: id.indexOf('U') === 0 ? 'Person' : 'Group',
      id
    }

    if (typeof reply === 'string' && reply.length) {
      const content = {
        type: 'Note',
        content: reply
      }
      this.sendMessageRaw(target, content)
    }
    if (typeof reply === 'object') {
      this.sendMessageRaw(target, reply)
    }
  }

  sendMessageRaw(to, object) {
    this.instance.send({
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Create",
      "generator": {
        "id": process.env.BROID_SERVICE_ID,
        "type": "Service",
        "name": "slack"
      },
      object,
      to
    })
  }
}

const slack = new Slack({
  token: process.env.SLACK_TOKEN,
  serviceID: process.env.BROID_SERVICE_ID
})
slack.setup();

module.exports = slack
