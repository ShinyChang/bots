const fetch = require('node-fetch')
const GitHubApi = require('github')

const owner = 'honestbee'
const repo = 'HB-Consumer-Web'
const filter_users = ['ShinyChang', 'kidwm', 'Rhadow', 'wangchou']
var github = new GitHubApi({
  // debug: true,
  protocol: "https",
  host: "api.github.com",
  headers: {
    "user-agent": "My-Cool-GitHub-App"
  }
})

github.authenticate({
  type: "token",
  token: process.env.GITHUB_TOKEN,
})

const handleUser = (raw) => {
  return {
    login: raw.login,
    avatar_url: raw.avatar_url
  }
}

const handleLabel = (raw) => {
  return raw.name
}

const handleLabels = (raw) => {
  return raw.map(handleLabel)
}

const handleUsers = (raw) => {
  return raw.map(handleUser)
}

const handleMilestone = (raw) => {
  return raw ? raw.title : null
}

const handleIssue = (raw) => {
  return {
    number: raw.number,
    title: raw.title,
    labels: raw.labels ? handleLabels(raw.labels) : [],
    state: raw.state,
    user: handleUser(raw.user),
    assignees: handleUsers(raw.assignees),
    milestone: handleMilestone(raw.milestone),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  }
}

const handlePR = (raw) => {
  return {
    number: raw.number,
    title: raw.title,
    state: raw.state,
    user: handleUser(raw.user),
    assignees: handleUsers(raw.assignees),
    milestone: handleMilestone(raw.milestone),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    isConflicted: raw.mergeable_state === 'dirty',
    isCIFailed: raw.mergeable_state === 'unstable',
  }
}

const handleActivity = (raw) => {
  return {
    id: raw.id,
    actor: handleUser(raw.actor),
    event: raw.event,
    issue: handleIssue(raw.issue),
    created_at: raw.created_at
  }
}

const check = ([type, ...rest]) => {
  switch (type) {
    case 'pr':
      return new Promise(resolve => {
        github.search.issues({
          q: 'is:pr+is:private+state:open+repo:honestbee/HB-Consumer-Web+label:need-review',
          sort: 'created',
          per_page: 100
        }, (err, res) => {
          resolve(res.data.items);
        })
      }).then(issues => {
        const promises = issues.map((issue) => {
          return new Promise(resolve => {
            github.pullRequests.get({owner, repo, number: issue.number}, (err, res) => {
              const pr = handlePR(res.data)
              resolve(Object.assign({}, issue, pr))
            })
          })
        })
        return Promise.all(promises)
      }).then(prs => {
        return prs.filter(pr => pr.mergeable !== null && (pr.isConflicted || pr.isCIFailed)).reduce((users, pr) => {
          users[pr.user.login] = users[pr.user.login] || []
          users[pr.user.login].push(pr)
          return users
        }, {})
      }).then(users => {
        return Object.keys(users).map((user) => {
          const prString = users[user].map(pr => {
            const status = [];
            pr.isConflicted && status.push('`Conflicted`')
            pr.isCIFailed && status.push('`CI failed`')
            return `
#${pr.number} ${pr.title} ${status}
> https://github.com/${owner}/${repo}/pull/${pr.number}
`
          }).join('')
          return `
${user}${prString}
`
        }).join('')
      })
      break
    default:
      return Promise.resolve()
  }
}


const handler = ([action, ...rest]) => {
  switch (action) {
    case 'check':
      return check(rest)
    default:
      return Promise.resolve()
  }
}

module.exports = handler

