const Github = require('../services/github')
const Jira = require('../services/jira')
const User = require('../services/user')
const Slack = require('../services/slack')
const TravisCI = require('../services/travis-ci')

const WORKFLOW = ['Backlog', 'In Development', 'Code Review', 'QA Review']
const regex = new RegExp(`${process.env.JIRA_PROJECT_KEY}-\\d+`)

const extendJiraFields = raw => {
  let status = 'Backlog'
  if (raw.merged) {
    status = 'QA Review'
  } else if (raw.state === 'open') {
    status = 'Code Review'
  }
  const jira = {
    issueKey: raw.title.match(regex)[0],
    fixVersion: raw.milestone && raw.milestone.match(/((\d+\.)+\d+)/)[0],
    status,
    assignee: raw.user.login
  };
  raw.jira = jira
  return raw
}

const syncGitHubToJira = () => {
  return Github.getRecentPRs(process.env.JIRA_PROJECT_KEY).then(prs => {
    return prs.map(extendJiraFields)
  }).then(prs => {
    const prPromises = prs.map(pr => {
      const {
        issueKey,
        fixVersion,
        status,
        assignee
      } = pr.jira
      return Jira.getIssue(issueKey).then(issue => {
        const userId = User.getUserIdByServiceId('github', assignee)
        const userJIRAId = User.getServiceId('jira', userId)
        const actionPromises = []

        // Sync GitHub PR status to JIRA workflow
        if (status) {
          const currentStage = WORKFLOW.indexOf(issue.fields.status)
          const expectStage = WORKFLOW.indexOf(status)
          if (currentStage !== -1) {

            // TODO: promise chain
            for (var i = currentStage + 1; i <= expectStage; i++) {
              // Fix JIRA auto-assignee
              if (WORKFLOW[i] === 'Code Review') {
                actionPromises.push(Jira.transitionTo(issue.key, WORKFLOW[i]).then(reply => {
                  return Jira.setAssignee(issue.key, userJIRAId).then(() => {
                    return reply
                  })
                }))
              } else {
                if (process.env.CUSTOM_WAIT_FOR_CI_PASSED && WORKFLOW[i] === 'QA Review') {
                  TravisCI.addToWatchList({pr.number, issueKey)
                } else {
                  actionPromises.push(Jira.transitionTo(issue.key, WORKFLOW[i]))  
                }
              }
            }
          }
        }

        // Sync fixVersion
        if (fixVersion && !issue.fields.fixVersion) {
          actionPromises.push(Jira.setFixVersion(issue.key, fixVersion))
        }

        // Sync JIRA assignee
        if (userJIRAId !== issue.fields.assignee.key) {
          actionPromises.push(Jira.setAssignee(issue.key, userJIRAId))
        }

        // Fix GitHub assignee
        if (!pr.assignees.length) {
          actionPromises.push(Github.addAssignees(pr.number, assignee))
        }

        if (actionPromises.length) {
          actionPromises.unshift(Promise.resolve(`
${issueKey}: ${issue.fields.summary}
> PR: ${pr.url}
> Jira: https://${process.env.JIRA_HOST}/browse/${issueKey}
actions:
`))
        }
        return Promise.all(actionPromises)
      }).then(res => {
        return res.filter(r => !!r).join('\n')
      })
    })
    return Promise.all(prPromises)
  }).then(res => {
    return res.filter(r => !!r).join('\n\n')
  }).then(content => {
    Slack.sendMessage(process.env.SLACK_REPORT_CHANNEL_ID, content)
  }).catch(err => console.log(err))
}

module.exports = syncGitHubToJira
