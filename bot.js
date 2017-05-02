const slack = require('./services/slack')

const github = require('./skills/github')
const jira = require('./skills/jira')
const ping = require('./skills/ping')
const googl = require('./skills/googl')

slack.addSkill('github', github)
slack.addSkill('jira', jira)
slack.addSkill('ping', ping)
slack.addSkill('googl', googl)
