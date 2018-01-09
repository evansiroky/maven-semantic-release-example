/**
 * Most of this code is copied and modified from
 * https://github.com/semantic-release/semantic-release
 */

const envCi = require('env-ci')
const {gitHead: getGitHead, isGitRepo} = require('semantic-release/lib/git')
const logger = require('semantic-release/lib/logger')

async function release (opts) {
  const {isCi, branch, isPr} = envCi()

  if (!isCi && !opts.dryRun && !opts.noCi) {
    logger.log('This run was not triggered in a known CI environment, running in dry-run mode.')
    opts.dryRun = true
  }

  if (isCi && isPr && !opts.noCi) {
    logger.log("This run was triggered by a pull request and therefore a new version won't be published.")
    return
  }

  if (!await isGitRepo()) {
    logger.error('Semantic-release must run from a git repository.')
    return
  }

  logger.log('TODO: complete')
}

release({})
