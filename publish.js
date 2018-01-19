const execa = require('execa')
const fs = require('fs-extra')
const SemanticReleaseError = require('@semantic-release/error')

module.exports = async function (pluginConfig, {options, logger, lastRelease, commits, nextRelease}) {
  // set version number in pom.xml
  await setVersionInPomXml(nextRelease.version)

  // publish to maven
  logger.log('Publishing version %s to npm registry', nextRelease.version);
  const shell = await execa('mvn', ['deploy']);
  process.stdout.write(shell.stdout);

  // update version to next snapshot version
  const nextSnapshotVersion = nextRelease.version.split('.').map(s => parseInt(s, 10))
  nextSnapshotVersion[2] += 1
  await setVersionInPomXml(`${nextSnapshotVersion.join('.')}-SNAPSHOT`)

  // make a commit bumping to snapshot version
}

setVersionInPomXml('1.0.0', console)

async function setVersionInPomXml (versionStr, logger) {
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
}
