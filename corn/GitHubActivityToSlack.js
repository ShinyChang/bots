const Github = require('../services/github')
const Slack = require('../services/slack')

let lastRun = new Date(Date.now()).toISOString();
const GitHubActivityToSlack = () => {
  return Github.getRepoActivity().then(activies => {
    return activies.filter(activity => {
      return (['IssueCommentEvent', 'PullRequestReviewCommentEvent'].includes(activity.type) 
              && activity.payload.comment.body.includes('@') 
              && lastRun < activity.created_at)
    })
  }).then(activies => {
    if (activies.length) {
      lastRun = activies[0].created_at
    }
    return activies.filter(activity => activity.payload.comment.body.indexOf('@') !== -1)
  }).then(activies => {
    const replies = {}
    activies.map(activity => {
      const slackActor = User.getUserIdByServiceId('github', activity.actor.login)
      const caller = slackActor && `<@${slackActor}>` || activity.actor.login
      const commentBody = activity.payload.comment.body.replace(/@(\w+)/g, (text, match) => {
        const mentionedUser = User.getUserIdByServiceId('github', match)
        mentionedUser && mectionedUsers.push(mentionedUser)
        return mentionedUser && `<@${slackActor}>` || text
      })
      const content = `${caller} mentioned you on ${activity.payload.comment.html_url}\n${commentBody}`
      mectionedUsers.forEach(slackUserId => {
        if (!replies[slackUserId]) {
          replies[slackUserId] = []
        }
        replies[slackUserId].push(content)
      })
    })
    return replies
  }).then(userContents => {
    Object.keys(userContents).forEach((slackUserId) => {
      Slack.sendMessage(slackUserId, userContents[slackUserId].join('\n'))
      Slack.sendMessage(process.env.SLACK_REPORT_CHANNEL_ID, userContents[slackUserId].join('\n'))
    })
  }).catch(err => console.log(err))
}

module.exports = GitHubActivityToSlack
