const config = require('./config.json')
const release = require('./release')

/**
 * Test a release using a config file to simulate an environment with environment variables
 */
async function testRelease () {
  Object.keys(config).forEach(key => {
    process.env[key] = config[key]
  })
  await release({
    branch: 'dev',
    dryRun: false,
    getLastRelease: ['./get-last-release'],
    publish: ['./publish'],
    verifyConditions: ['@semantic-release/github', '@semantic-release/condition-travis']
  })
}

testRelease()
