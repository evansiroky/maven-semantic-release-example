const semanticRelease = require('semantic-release/cli')

/**
 * Add necessary arguments to run semantic release for maven projects
 */
async function run () {
  process.argv.push(...[
    '--get-last-release',
    './get-last-release',
    '--publish',
    './publish',
    '--verify-conditions',
    '@semantic-release/github,@semantic-release/condition-travis'
  ])

  await semanticRelease()
}

// allow invocation using node command
if (require.main === module) {
  run()
}

module.exports = run
