const GitHubApi = require('github')

const owner = process.env.GITHUB_OWNER
const repo = process.env.GITHUB_REPO
const branch = process.env.GITHUB_BASE_BRANCH
const label = process.env.GITHUB_TARGET_LABEL

const github = new GitHubApi({
  debug: process.env.NODE_ENV === 'production',
  protocol: 'https',
  host: 'api.github.com',
  headers: {
    'user-agent': 'My-Cool-GitHub-App'
  }
})

github.authenticate({
  type: 'token',
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

const handlePR = (raw) => {
  return {
    number: raw.number,
    title: raw.title,
    state: raw.state,
    merged: raw.merged,
    user: handleUser(raw.user),
    assignees: handleUsers(raw.assignees),
    milestone: handleMilestone(raw.milestone),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    isConflicted: raw.mergeable_state === 'dirty',
    isCIFailed: raw.mergeable_state === 'unstable',
    url: `https://github.com/${owner}/${repo}/pull/${raw.number}`
  }
}
const handleIssue = (raw) => {
  return {
    number: raw.number,
    title: raw.title,
    state: raw.state,
    user: handleUser(raw.user),
    assignees: handleUsers(raw.assignees),
    milestone: handleMilestone(raw.milestone),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    url: `https://github.com/${owner}/${repo}/pull/${raw.number}`
  }
}

const handleEvent = (raw) => {
  return {
    id: raw.id,
    type: raw.type,
    actor: handleUser(raw.actor),
    payload: handlePayload(raw.payload, raw.type),
    created_at: raw.created_at
  }
}

const handlePayload = (raw) => {
  return {
    action: raw.action,
    issue: raw.issue && handleIssue(raw.issue),
    comment: raw.comment && handleComment(raw.comment),
  }
}

const handleComment = (raw) => {
  return {
    id: raw.id,
    user: raw.user,
    html_url: raw.html_url,
    body: raw.body
  }
}

class GitHub {
  static getRecentPRs(title) {
    return new Promise((resolve, reject) => {
      github.search.issues({
        q: `is:pr+repo:${owner}/${repo}+label:${label}+base:${branch}+${title}+in:title`,
        sort: 'updated',
        per_page: 5
      }, (err, res) => {
        err ? reject(err) : resolve(res.data.items);
      })
    }).then(raw => {
      return raw.map(handleIssue)
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
    })
  }

  static getRecentPRsWithDetail() {
    return new Promise((resolve, reject) => {
      github.search.issues({
        q: `is:pr+state:open+repo:${owner}/${repo}+label:${label}`,
        sort: 'updated',
        per_page: 20
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
    })
  }

  static addAssignees(number, assignee) {
    return new Promise((resolve, reject) => {
      github.issues.addAssigneesToIssue({
        owner,
        repo,
        number,
        assignees: [assignee]
      }, (err, res) => {
        err ? reject(err) : resolve(`#${number} added assignee: ${assignee}`)
      })
    })
  }

  static getRepoActivity() {
    return new Promise((resolve, reject) => {
      github.activity.getEventsForRepo({
        owner,
        repo,
      }, (err, res) => {
        resolve(res.data.map(handleEvent))
      })
    })
  }
}

module.exports = GitHub
