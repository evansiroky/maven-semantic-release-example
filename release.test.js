const config = require('./config.json')
const release = require('./release-cli')

/**
 * Test a release using a config file to simulate an environment with environment variables
 */
async function testRelease () {
  Object.keys(config).forEach(key => {
    process.env[key] = config[key]
  })
  process.argv.push(...[
    '--branch',
    'dev',
    '--debug'
  ])
  await release()
}

testRelease()
