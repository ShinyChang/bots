const fetch = require('node-fetch')
const Github = require('../../services/github')

const check = ([type, ...rest]) => {
  switch (type) {
    case 'pr':
      return Github.getRecentPRsWithDetail().then(prs => {
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
> ${pr.url}
`
          }).join('')
          return `
${user}${prString}
`
        }).join('')
      }).catch(err => {
        console.log(err)
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
      return Promise.resolve(`usage:
github check pr`)
  }
}

module.exports = handler

