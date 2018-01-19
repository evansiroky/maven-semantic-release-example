/**
 * Most of this code is copied and modified from
 * https://github.com/semantic-release/semantic-release
 */

require('debug').enable('semantic-release:*')
const envCi = require('env-ci')
const marked = require('marked')
const TerminalRenderer = require('marked-terminal')
const getCommits = require('semantic-release/lib/get-commits')
const getConfig = require('semantic-release/lib/get-config')
const {gitHead: getGitHead, isGitRepo} = require('semantic-release/lib/git')
const logger = require('semantic-release/lib/logger')
const getNextVersion = require('semantic-release/lib/get-next-version')

/* eslint-disable complexity */
/**
 * Run script to potentially release the project
 */
module.exports = async function release (opts) {
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

  const config = await getConfig(opts, logger)
  const {plugins, options} = config

  if (branch !== options.branch) {
    logger.log(
      `This test run was triggered on the branch ${branch}, while semantic-release is configured to only publish from ${
        options.branch
      }, therefore a new version won’t be published.`
    )
    return
  }

  logger.log('Run automated release from branch %s', options.branch)

  // TODO: verify conditions of release
  logger.log('Call plugin %s', 'verify-conditions')
  await plugins.verifyConditions({options, logger})

  // TODO: verify conditions of release
  logger.log('Call plugin %s', 'get-last-release')
  const {commits, lastRelease} = await getCommits(
    await plugins.getLastRelease({options, logger}),
    options.branch,
    logger
  )

  // TODO: verify conditions of release
  logger.log('Call plugin %s', 'analyze-commits')
  const type = await plugins.analyzeCommits({
    options,
    logger,
    lastRelease,
    commits: commits.filter(commit => !/\[skip\s+release\]|\[release\s+skip\]/i.test(commit.message))
  })
  if (!type) {
    logger.log('There are no relevant changes, so no new version is released.')
    return
  }
  const version = getNextVersion(type, lastRelease, logger)
  const nextRelease = {type, version, gitHead: await getGitHead(), gitTag: `v${version}`}

  // TODO: verify conditions of release
  logger.log('Call plugin %s', 'verify-release')
  await plugins.verifyRelease({options, logger, lastRelease, commits, nextRelease})

  const generateNotesParam = {options, logger, lastRelease, commits, nextRelease}

  // TODO: verify conditions of release
  if (options.dryRun) {
    logger.log('Call plugin %s', 'generate-notes')
    const notes = await plugins.generateNotes(generateNotesParam)
    marked.setOptions({renderer: new TerminalRenderer()})
    logger.log('Release note for version %s:\n', nextRelease.version)
    process.stdout.write(`${marked(notes)}\n`)
  } else {
    logger.log('Call plugin %s', 'generateNotes')
    nextRelease.notes = await plugins.generateNotes(generateNotesParam)

    logger.log('Call plugin %s', 'publish')
    await plugins.publish({options, logger, lastRelease, commits, nextRelease}, async prevInput => {
      const newGitHead = await getGitHead()
      // If previous publish plugin has created a commit (gitHead changed)
      if (prevInput.nextRelease.gitHead !== newGitHead) {
        nextRelease.gitHead = newGitHead
        // Regenerate the release notes
        logger.log('Call plugin %s', 'generateNotes')
        nextRelease.notes = await plugins.generateNotes(generateNotesParam)
      }
      // Call the next publish plugin with the updated `nextRelease`
      return {options, logger, lastRelease, commits, nextRelease}
    })
    logger.log('Published release: %s', nextRelease.version)
  }
  return true
}
