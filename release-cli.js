const semanticRelease = require('semantic-release/cli')

module.exports = async () => {
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
