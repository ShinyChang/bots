const jira = require('../../services/jira')
const user = require('../../services/user')

const addBlackholeLabel = ([issueKey, ...rest]) => {
  return jira.addLabel(issueKey, 'black_hole')
}

const setStroyPoints = ([issueKey, storyPoint, ...rest]) => {
  return jira.setStoryPoint(issueKey, storyPoint)
}

const setFixVersion = ([issueKey, fixVersion, ...rest]) => {
  return jira.setFixVersion(issueKey, fixVersion)
}

const setAssignee = ([issueKey, assignee, ...rest]) => {
  const jiraAssignee = user.getServiceId(assignee, 'jira')
  return jira.setAssignee(issueKey, jiraAssignee);
}

const setWorkflow = ([issueKey, ...rest]) => {
  const workflow = rest.join(' ').trim().toLowerCase()
  return jira.transitionTo(issueKey, workflow);
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
jira as [issueKey] [@user]
jira fv [issueKey] [fixVersion]
jira wf [issueKey] [in development|code review|qa review]`)
  }
}

module.exports = handler
