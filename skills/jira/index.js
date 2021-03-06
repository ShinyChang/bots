const Jira = require('../../services/jira')
const User = require('../../services/user')

const addBlackholeLabel = ([issueKey, ...rest]) => {
  return Jira.addLabel(issueKey, 'black_hole')
}

const setStroyPoints = ([issueKey, storyPoint, ...rest]) => {
  return Jira.setStoryPoint(issueKey, storyPoint)
}

const setFixVersion = ([issueKey, fixVersion, ...rest]) => {
  return Jira.setFixVersion(issueKey, fixVersion)
}

const setAssignee = ([issueKey, assignee, ...rest]) => {
  const JiraAssignee = User.getServiceId('jira', assignee)
  return Jira.setAssignee(issueKey, jiraAssignee)
}

const setWorkflow = ([issueKey, ...rest]) => {
  const workflow = rest.join(' ').trim().toLowerCase()
  return Jira.transitionTo(issueKey, workflow)
}

const release = ([fixVersion, ...rest]) => {
  return Jira.searchIssuesByFixVersion(fixVersion).then(meta => {
    return meta.issues.map(issue => {
      return Jira.setResolutionAsDone(issue.key).then(() => {
        return Jira.transitionTo(issue.key, 'done')  
      })
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
    case 'release':
      return release(rest)
    default:
      return Promise.resolve(`usage:
jira bh [issueKey]
jira sp [issueKey] [storyPoint]
jira as [issueKey] [@user]
jira fv [issueKey] [fixVersion]
jira wf [issueKey] [in development|code review|qa review]
jira release [fixVersion]`)
  }
}

module.exports = handler
