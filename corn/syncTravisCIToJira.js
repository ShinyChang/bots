const Jira = require('../services/jira')
const Slack = require('../services/slack')
const TravisCI = require('../services/travis-ci')

const WORKFLOW = ['Backlog', 'In Development', 'Code Review', 'QA Review']
const syncTravisCIToJira = () => {
  const watchedList = TravisCI.getWatchList()
  const watchedPRNumbers = Object.keys(watchedList)
  if (!watchedPRNumbers.length) {
    return
  }

  TravisCI.getRecentBranchMergedBuilds(process.env.GITHUB_BASE_BRANCH, 'passed').then(builds => {
    return builds.map(build => {
      const matches = build.commit.message.match(/Merge pull request #(\d+)/)
      if (matches) {
        return matches[1]
      }
    })
  }).then(buildPassedPRNumbers => {
    return Promise.all(buildPassedPRNumbers.map(number => {

      // passed CI
      if (watchedPRNumbers.includes(number)) {
        const url = `https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/pull/${number}`
        const issueKey = watchedList[number]
        const header = `> PR: ${url}
> Jira: https://${process.env.JIRA_HOST}/browse/${issueKey}
actions:`
        return Jira.transitionTo(issueKey, 'QA Review').then(content => `${header}\n${content}`)
      }
    })).then(res => res.filter(r => !!r).join('\n'))
  }).then(content => {
    Slack.sendMessage(process.env.SLACK_REPORT_CHANNEL_ID, content)
  })
  .catch(err => console.log(err))
}

module.exports = syncTravisCIToJira
