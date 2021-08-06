const path = require('path')
const core = require('@actions/core')
const fs = require('fs-extra')
const getWorkspacePackages = require('../support/getWorkspacePackages.js')
const { changelogPlugin } = require('./changelog.js')
const { commitAnalyzerPlugin } = require('./commit-analyzer.js')
const { deferReleasePlugin } = require('./defer-release.js')
const { gitPlugin } = require('./git.js')
const { apphubPlugin } = require('./publish-apphub.js')
const { githubPlugin } = require('./publish-github.js')
const { npmPlugin } = require('./publish-npm.js')
const { releaseNotesPlugin } = require('./release-notes.js')
const { updateDepsPlugin } = require('./update-deps.js')

/* order matters in the plugins array !
 *
 * first, semantic-release runs each phase, and if there are multiple
 * plugins for one phase, they are executed in order of the array.
 */
exports.plugins = async ({ changelog, apphub, npm, github, cwd }) => {
    const rootPackageFile = path.join(cwd, 'package.json')

    if (!fs.existsSync(rootPackageFile)) {
        core.setFailed(`root package.json not found: ${rootPackageFile}`)
    }

    const packages = [
        rootPackageFile,
        ...(await getWorkspacePackages(rootPackageFile, cwd)),
    ].map(fp => path.relative(cwd, fp))

    core.startGroup('Identified packages:')
    packages.map(p => core.info(p))
    core.endGroup()

    return [
        deferReleasePlugin(),
        commitAnalyzerPlugin(),
        releaseNotesPlugin(),
        updateDepsPlugin({ packages }),
        changelogPlugin({ changelogFile: changelog }),
        ...npmPlugin({ npmPublish: npm.publish, packages }),
        ...(apphub.publish
            ? apphubPlugin({
                  channel: apphub.channel,
                  baseUrl: apphub.baseUrl,
                  packages,
              })
            : []),
        gitPlugin({ packages }),
        ...(github.publish ? [githubPlugin()] : []),
    ]
}
