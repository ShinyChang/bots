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

const addBlackholeLabel = ([issueKey, ...rest]) => {
  return new Promise(resolve => {
    jira.issue.editIssue({
      issueKey,
      issue: {
        "update": {
          "labels": [
            { "add": "black_hole" }
          ]
        }
      }
    }, (err, reply) => {
      resolve(`${issueKey} ${reply}`)
    })
  })
}

const setStroyPoints = ([issueKey, storyPoint, ...rest]) => {
  return new Promise(resolve => {
    jira.issue.editIssue({
      issueKey,
      issue: {
        "fields": {
          "customfield_10005": parseFloat(storyPoint)
        }
      }
    }, (err, reply) => {
      resolve(`${issueKey} ${reply}`)
    })
  })
}

const setFixVersion = ([issueKey, fixVersion, ...rest]) => {
  return new Promise(resolve => {
    jira.issue.editIssue({
      issueKey,
      issue: {
        "fields": {
          "fixVersions": [{name: fixVersion}]
        }
      }
    }, (err, reply) => {
      resolve(`${issueKey} ${reply}`)
    })
  })
}

const ASSIGNEE_MAP = {
  'shiny.chang': 'shiny.chang',
  'shiny': 'shiny.chang',
  'shinychang': 'shiny.chang',
  'howard.chang': 'howard.chang',
  'howard': 'howard.chang',
  'rhadow': 'howard.chang',
  'alberto.gosal': 'alberto.gosal',
  'alberto': 'alberto.gosal',
  'william.myers': 'william.myers',
  'will': 'william.myers',
  'wmyers': 'william.myers',
  'william': 'william.myers',
  'jessinca.jong': 'jessinca.jong',
  'jsessinca': 'jessinca.jong',
  'arnel.aguinaldo': 'arnel.aguinaldo',
  'arnel': 'arnel.aguinaldo',
  'natalia.kozyura': 'natalia.kozyura',
  'natalia': 'natalia.kozyura',
  'wangchou.lu': 'wangchou.lu',
  'wang': 'wangchou.lu',
  'wangchou': 'wangchou.lu',
  'chen.heng': 'chen.heng',
  'chen-heng': 'chen.heng',
  'chenheng': 'chen.heng',
  'chen': 'chen.heng',
}
const setAssignee = ([issueKey, assignee, ...rest]) => {
  return new Promise(resolve => {
    jira.issue.assignIssue({
      issueKey,
      assignee: ASSIGNEE_MAP[assignee.toLowerCase()]
    }, (err, reply) => {
      resolve(`${issueKey} ${reply}`)
    })
  })
}

const WORKFLOW_MAP = {
  'in development': 121,
  'code review': 111,
  'qa review': 31
}
const setWorkflow = ([issueKey, ...rest]) => {
  const workflow = rest.join(' ').trim().toLowerCase()
  return new Promise(resolve => {
    jira.issue.transitionIssue({
      issueKey,
      transition: {
        id: WORKFLOW_MAP[workflow]
      }
    }, (err, reply) => {
      resolve(`${issueKey} ${reply}`)
    })
  })
}

const handler = ([action, ...rest]) => {
  switch (action) {
    case 'bh':
      return addBlackholeLabel(rest)
    case 'sp':
      return setStroyPoints(rest)
    case 'as':
      return setAssignee(rest)
    case 'fv':
      return setFixVersion(rest)
    case 'wf':
      return setWorkflow(rest)
    default:
      return Promise.resolve(`usage:
jira bh [issueKey]
jira sp [issueKey] [storyPoint]
jira as [issueKey] [assignee]
jira fv [issueKey] [fixVersion]
jira wf [issueKey] [in development|code review|qa review]`)
  }
}

module.exports = handler
