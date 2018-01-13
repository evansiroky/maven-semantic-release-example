const release = require('./release')

release({
  getLastRelease: ['./get-last-release'],
  verifyConditions: ['@semantic-release/github', '@semantic-release/condition-travis']
})
