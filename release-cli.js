const semanticRelease = require('semantic-release/cli')

process.argv.push(...[
  '--get-last-release',
  './getLastRelease',
  '--publish',
  './publish',
  '--verify-conditions',
  '"@semantic-release/github,@semantic-release/condition-travis"'
])

semanticRelease()
