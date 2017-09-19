const User = require('../../services/user')

const listUser = () => {
  return User.list()
}

const addUser = ([userId, ...rest]) => {
  const matches = userId.match(/<@(\w+)>/)
  const slackUserId = matches && matches[1]
  const user = User.get(slackUserId)
  if (!user) {
    User.add(slackUserId)
    return `Added new user: ${userId}`
  }
  return `${userId} already existed`
}

const removeUser = ([userId, ...rest]) => {
  const matches = userId.match(/<@(\w+)>/)
  const slackUserId = matches && matches[1]
  User.remove(slackUserId)
  return `User ${userId} removed`
}

const assignAsAdmin = ([userId, ...rest]) => {
  const matches = userId.match(/<@(\w+)>/)
  const slackUserId = matches && matches[1]
  const user = User.get(slackUserId)
  if (user) {
    User.assignAsAdmin(slackUserId)
    return `User ${userId} is admin now`
  } else {
    return `User ${userId} does not exist, please \`user user add [@user]\` first`
  }
}

const unassignAsAdmin = ([userId, ...rest]) => {
  const matches = userId.match(/<@(\w+)>/)
  const slackUserId = matches && matches[1]
  const user = User.get(slackUserId)
  if (user) {
    User.unassignAsAdmin(slackUserId)
    return `User ${userId} is member now`
  } else {
    return `User ${userId} does not exist`
  }
}

const jira = ([userId, jiraId,...rest]) => {
  const matches = userId.match(/<@(\w+)>/)
  const slackUserId = matches && matches[1]
  const user = User.get(slackUserId)
  if (user) {
    User.addServiceId(slackUserId, 'jira', jiraId)
    return `User ${userId} JIRA ID: ${jiraId}`
  } else {
    return `User ${userId} does not exist, please \`user user add [@user]\` first`
  }
}

const github = ([userId, githubId,...rest]) => {
  const matches = userId.match(/<@(\w+)>/)
  const slackUserId = matches && matches[1]
  const user = User.get(slackUserId)
  if (user) {
    User.addServiceId(slackUserId, 'github', githubId)
    return `User ${userId} GitHub ID: ${githubId}`
  } else {
    return `User ${userId} does not exist, please \`user user add [@user]\` first`
  }
}

const handler = ([action, ...rest], actorId) => {
  const actor = User.get(actorId)
  if (!actor || !actor.isAdmin) {
    return 'No Permission'
  }

  switch (action) {
    case 'list':
      return listUser(rest)
    case 'add':
      return addUser(rest)
    case 'remove':
      return removeUser(rest)
    case 'admin':
      return assignAsAdmin(rest)
    case 'member':
      return unassignAsAdmin(rest)
    case 'jira':
      return jira(rest)
    case 'github':
      return github(rest)
    default:
      return Promise.resolve(`usage:
user list
user add [@user]
user remove [@user]
user admin [@user]
user member [@user]
user jira [@user] [JIRA ID]
user github [@user] [GitHub ID]`)
  }
}

module.exports = handler
