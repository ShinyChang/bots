const user = require('./services/user')
setTimeout(() => {
  const userId = user.getUserIdByServiceId('github', 'ShinyChang')
  const jiraUserId = user.getServiceId(userId, 'jira')
  console.log(jiraUserId)
}, 3000)

