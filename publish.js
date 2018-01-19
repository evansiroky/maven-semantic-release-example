const execa = require('execa')
const fs = require('fs-extra')
const SemanticReleaseError = require('@semantic-release/error')

const config = require('./config.json')

module.exports = publish

publish({}, {options: {}, logger: console, nextRelease: { version: '1.0.0' } })

async function publish (pluginConfig, {options, logger, lastRelease, commits, nextRelease}) {
  // configure git to allow pushing
  await configureGit(logger)

  // set and commit version number in pom.xml
  await commitVersionInPomXml(nextRelease.version, logger)

  // publish to maven
  logger.log('Deploying version %s with maven', nextRelease.version);
  try {
    const shell = await execa('mvn', ['deploy']);
    process.stdout.write(shell.stdout);
  } catch (e) {
    throw new SemanticReleaseError('failed to deploy to maven')
  }

  // update version to next snapshot version
  const nextSnapshotVersion = nextRelease.version.split('.').map(s => parseInt(s, 10))
  nextSnapshotVersion[2] += 1
  await commitVersionInPomXml(`${nextSnapshotVersion.join('.')}-SNAPSHOT`, logger)

  // make a commit bumping to snapshot version
}

/**
 * Configure git settings.  Copied from this guide: https://gist.github.com/willprice/e07efd73fb7f13f917ea
 */
async function configureGit (logger) {
  let shell = await execa(
    'git',
    ['config', '--global', 'user.email', '"travis@travis-ci.org"']
  )
  process.stdout.write(shell.stdout)
  shell = await execa(
    'git',
    ['config', '--global', 'user.name', '"Travis CI"']
  )
  process.stdout.write(shell.stdout)
  try {
    shell = await execa(
      'git',
      [
        'remote',
        'add',
        'origin',
        `https://${config.GH_TOKEN}@github.com/evansiroky/resources.git`
      ]
    )
    process.stdout.write(shell.stdout)
  } catch (e) {
    if (!(e.message.indexOf('remote origin already exists') > -1)) {
      throw e
    }
  }
}

async function commitVersionInPomXml (versionStr, logger) {
  let pomLines
  try {
    pomLines = (await fs.readFile('./pom.xml', 'utf8')).split('\n')
  } catch (e) {
    logger.error(e)
    throw new SemanticReleaseError('Error reading pom.xml')
  }

  // manually iterate through lines and make edits to
  // preserve formatting and comments of file
  for (let i = 0; i < pomLines.length; i++) {
    const line = pomLines[i]
    if (line.indexOf('<!-- semantic-release-version-line -->') > -1) {
      // edit version field
      pomLines[i] = line.replace(/<version>(.*)<\/version>/, `<version>${versionStr}</version>`)
      break
    }
  }

  await fs.writeFile('./pom.xml', pomLines.join('\n'))

  const commitMessage = versionStr.indexOf('SNAPSHOT') > -1
    ? `Prepare next development iteration ${versionStr}`
    : versionStr

  logger.log('adding pom.xml to a commmit')
  let shell = await execa('git', ['add', 'pom.xml'])
  process.stdout.write(shell.stdout)

  logger.log('committing changes')
  shell = await execa('git', ['commit', '-m', commitMessage])
  process.stdout.write(shell.stdout)
  process.stdout.write('\n')

  logger.log('changes committed')
}
