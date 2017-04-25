const JiraClient = require('jira-connector')

const jira = new JiraClient( {
  host: 'honestbee.atlassian.net',
  basic_auth: {
    username: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD
  }
})


const handleJiraIssie = (raw) => {
  return { 
    key: raw.key,
    fields: handleJiraFields(raw.fields)
  }
}
const handleJiraFields = (raw) => {
  return {
    issuetype: raw.issuetype.name,
    project: raw.project.name,
    created: raw.created,
    summary: raw.summary,
    description: raw.description,
    priority: raw.priority.name,
    status: raw.status.name,
    labels: raw.labels,
    updated: raw.updated,
    storyPoint: raw.customfield_10005,
    fixVersion: handleJiraFieldFixVersions(raw.fixVersions),
    assignee: handleJiraFieldUser(raw.assignee),
    creator: handleJiraFieldUser(raw.creator),
    reporter: handleJiraFieldUser(raw.reporter),
  }
}

const handleJiraFieldUser = (raw) => {
  return {
    key: raw.key,
    name: raw.displayName
  }
}

const handleJiraFieldFixVersions = (raw) => {
  return raw.map(handleJiraFieldFixVersion).pop()
}

const handleJiraFieldFixVersion = raw => {
  return raw.name
}

class Jira {
  static getIssue(issueKey) {
    return new Promise((resolve, reject) => {
      jira.issue.getIssue({
        issueKey
      }, (err, reply) => {
        reply ? resolve(handleJiraIssie(reply)) : reject(err)
      })
    })
  };

  static setFixVersion(issueKey, fixVersion) {
    return new Promise((resolve, reject) => {
      jira.issue.editIssue({
        issueKey,
        issue: {
          fields: {
            fixVersions: [{name: fixVersion}]
          }
        }
      }, (err, reply) => {
        reply ? resolve(`set fix version: ${fixVersion}`) : reject(err)
      })
    })
  };

  static setStoryPoint(issueKey, storyPoint) {
    return new Promise((resolve, reject) => {
      jira.issue.editIssue({
        issueKey,
        issue: {
          "fields": {
            "customfield_10005": parseFloat(storyPoint)
          }
        }
      }, (err, reply) => {
        reply ? resolve(`set story point: ${storyPoint}`) : reject(err)
      })
    })
  };

  static addLabel(issueKey, label) {
    return new Promise((resolve, reject) => {
      jira.issue.editIssue({
        issueKey,
        issue: {
          "update": {
            "labels": [
              { "add": label }
            ]
          }
        }
      }, (err, reply) => {
        reply ? resolve(`added new lable: ${label}`) : reject(err)
      })
    })
  };  

  static setAssignee(issueKey, assignee) {
    const avaliableAssignee = [
      'arnel.aguinaldo', 
      'chen.heng', 
      'howard.chang', 
      'jessinca.jong', 
      'natalia.kozyura', 
      'shiny.chang',
      'wangchou.lu', 
      'william.myers', 
    ]
    return avaliableAssignee.includes(assignee) ? new Promise(resolve => {
      jira.issue.assignIssue({
        issueKey,
        assignee
      }, (err, reply) => {
        reply ? resolve(`set assignee: ${assignee}`) : reject(err)
      })
    }) : Promise.reject(`Invalid assignee: ${assignee}`)
  }

  static transitionTo(issueKey, transition) {
    const transitionMap = {
      'in development': 121,
      'code review': 111,
      'qa review': 31
    }

    return new Promise((resolve, reject) => {
      jira.issue.transitionIssue({
        issueKey,
        transition: {
          id: transitionMap[transition.toLowerCase()]
        }
      }, (err, reply) => {
        reply ? resolve(`transition to status: ${transition}`) : reject(err)
      })
    })
  }
}

module.exports = Jira;
