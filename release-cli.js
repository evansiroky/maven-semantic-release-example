const envCi = require('env-ci')

const release = require('./release')

const releaseCfg = {
  getLastRelease: ['./get-last-release'],
  publish: ['./publish'],
  verifyConditions: ['@semantic-release/github', '@semantic-release/condition-travis']
}

// allow publishing from either master or dev branches.  If dev, publish a snapshot.
// semantic release requires specifying an exact branch other than master to publish.
const {branch} = envCi()

if (branch === 'master' || branch === 'dev') {
  releaseCfg.branch = branch
}

release(releaseCfg)
