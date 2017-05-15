const fetch = require('node-fetch')

// https://developer.travis-ci.com/authentication
const repo = `${process.env.GITHUB_OWNER}%2F${process.env.GITHUB_REPO}`
const baseURL = 'https://api.travis-ci.com'
const option = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Travis-API-Version': 3,
    'User-Agent': 'My-Cool-TravisCI-App',
    Authorization: `token ${process.env.TRAVIS_CI_TOKEN}`
  }
}

class TravisCI {
  static getRecentBranchMergedBuilds(branch) {
    return fetch(`${baseURL}/repo/${repo}/builds?event_type=push&branch.name=${branch}&limit=5`, option)
      .then(res => res.json())
      .then(data => data.builds.filter(build => build.commit.message.startsWith('Merge pull request #')))
      .catch(err => console.log(err))
  }
}

module.exports = TravisCI
