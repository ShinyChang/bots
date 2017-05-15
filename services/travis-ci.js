const fetch = require('node-fetch')
const Database = require('./database')

// https://developer.travis-ci.com/authentication
const repo = `${process.env.GITHUB_OWNER}%2F${process.env.GITHUB_REPO}`
const baseURL = `https://${process.env.TRAVIS_CI_HOST}`
const option = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Travis-API-Version': 3,
    'User-Agent': 'My-Cool-TravisCI-App',
    Authorization: `token ${process.env.TRAVIS_CI_TOKEN}`
  }
}

let store = {}
Database.ref('/travis-ci').on('value', (snapshot) => {
  store = snapshot.val()
})

class TravisCI {
  static getWatchList() {
    return store
  }

  static addToWatchList(prNumber, issueKey) {
    Database.ref(`/travis-ci/${prNumber}`).set(issueKey)
  }

  static removeFromWatchList(prNumber) {
    Database.ref(`/travis-ci/${prNumber}`).remove()
  }

  static getRecentBranchMergedBuilds(branch, status) {
    const statusParam = status ? `&${status}` : ''
    return fetch(`${baseURL}/repo/${repo}/builds?event_type=push&branch.name=${branch}&limit=5${statusParam}`, option)
      .then(res => res.json())
      .then(data => data.builds.filter(build => build.commit.message.startsWith('Merge pull request #')))
      .catch(err => console.log(err))
  }
}

module.exports = TravisCI
