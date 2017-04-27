const github = require('../services/github')

const SLACK_MAP = {
  '@ShinyChang': 'U3B4ZNH46',
  '@Rhadow': 'U35NABAH5',
  '@albertojg': 'U09DTCYR1',
  '@wmyers': 'U0MB9MSCX',
  '@jessinca': 'U1G7D57DJ',
  '@rnel': 'U0QPR252L',
  '@wangchou': 'U2WJMPA9Z',
  '@kidwm': 'U40J3PKS5',
}

let lastRun = new Date(Date.now());
const GitHubActivityToSlack = () => {
  return github.getRepoActivity().then(activies => {
    return activies.filter(activity => ['IssueCommentEvent', 'PullRequestReviewCommentEvent'].includes(activity.type) && activity.payload.comment.body.includes('@') && lastRun < activity.created_at)
  }).then(activies => {
    if (activies.length) {
      lastRun = activies[0].created_at
    }
    return activies.filter(activity => activity.payload.comment.body.indexOf('@') !== -1)
  }).then(activies => {
    const replies = {}
    activies.map(activity => {
      const content = `${activity.actor.login} mentioned you on ${activity.payload.comment.html_url}\n${activity.payload.comment.body}`;
      const mectionedUsers = activity.payload.comment.body.match(/@\w+/g)
      mectionedUsers.forEach(userKey => {
        if (!replies[userKey]) {
          replies[SLACK_MAP[userKey]] = []
        }
        replies[SLACK_MAP[userKey]].push(content)
      })
    })
    return replies
  }).catch(err => console.log(err))
}

module.exports = GitHubActivityToSlack
