const github = require('../services/github')
const jira = require('../services/jira')

const WORKFLOW = ['Backlog', 'In Development', 'Code Review', 'QA Review']
const ASSIGNEE_MAP = {
  'ShinyChang': 'shiny.chang',
  'Rhadow': 'howard.chang',
  'albertojg': 'alberto.gosal',
  'wmyers': 'william.myers',
  'jessinca': 'jessinca.jong',
  'rnel': 'arnel.aguinaldo',
  'wangchou': 'wangchou.lu',
  'kidwm': 'chen.heng',
}

const extendJiraFields = raw => {
  let status = 'Backlog'
  if (raw.merged) {
    status = 'QA Review'
  } else if (raw.state === 'open') {
    status = 'Code Review'
  }
  const jira = {
    issueKey: raw.title.match(/CWEB-\d+/)[0],
    fixVersion: raw.milestone && raw.milestone.match(/((\d+\.)+\d+)/)[0],
    status,
    assignee: raw.user.login
  };
  raw.jira = jira
  return raw
}

const syncGitHubToJira = () => {
  return github.getRecentPRs().then(prs => {
    return prs.map(extendJiraFields)
  }).then(prs => {
    const prPromises = prs.map(pr => {
      const {
        issueKey,
        fixVersion,
        status,
        assignee
      } = pr.jira
      return jira.getIssue(issueKey).then(issue => {
        const actionPromises = []
        if (fixVersion && !issue.fields.fixVersion) {
          actionPromises.push(jira.setFixVersion(issue.key, fixVersion))
        }
        if (status) {
          const currentStage = WORKFLOW.indexOf(issue.fields.status)
          const expectStage = WORKFLOW.indexOf(status)
          if (currentStage !== -1) {
            for (var i = currentStage + 1; i <= expectStage; i++) {
              if (WORKFLOW[i] === 'Code Review') {
                actionPromises.push(jira.transitionTo(issue.key, WORKFLOW[i]).then(reply => {
                  return jira.setAssignee(issue.key, ASSIGNEE_MAP[assignee]).then(() => {
                    return reply
                  })
                }))
              } else {
                actionPromises.push(jira.transitionTo(issue.key, WORKFLOW[i]))
              }
            }
          }
        }
        if (ASSIGNEE_MAP[assignee] !== issue.fields.assignee.key) {
          actionPromises.push(jira.setAssignee(issue.key, ASSIGNEE_MAP[assignee]))
        }

        if (actionPromises.length) {
          actionPromises.push(Promise.resolve(`
${pr.url}
https://honestbee.atlassian.net/browse/${issueKey}
`))
        }
        return Promise.all(actionPromises)
      }).then(res => {
        return res.filter(r => !!r).join('\n')
      })
    })
    return Promise.all(prPromises)
  }).then(res => {
    return res.filter(r => !!r).join('\n')
  }).catch(err => console.log(err))
}

module.exports = syncGitHubToJira
