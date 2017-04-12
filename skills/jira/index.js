const jira = require('../../services/jira')

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
  const assigneeMap = {
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
  return jira.setAssignee(issueKey, assigneeMap[assignee.toLowerCase()]);
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
jira as [issueKey] [assignee]
jira fv [issueKey] [fixVersion]
jira wf [issueKey] [in development|code review|qa review]`)
  }
}

module.exports = handler
