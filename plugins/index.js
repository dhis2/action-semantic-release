const path = require('path')
const core = require('@actions/core')
const fs = require('fs-extra')
const getWorkspacePackages = require('../support/getWorkspacePackages.js')
const { changelogPlugin } = require('./changelog.js')
const { commitAnalyzerPlugin } = require('./commit-analyzer.js')
const { deferReleasePlugin } = require('./defer-release.js')
const { gitPlugin } = require('./git.js')
const { appHubPlugin } = require('./publish-app-hub.js')
const { githubPlugin } = require('./publish-github.js')
const { npmPlugin } = require('./publish-npm.js')
const { releaseNotesPlugin } = require('./release-notes.js')
const { updateDepsPlugin } = require('./update-deps.js')

const packageIsPublishable = pkgJsonPath => {
    try {
        const pkgJson = fs.readJsonSync(pkgJsonPath)
        return !!pkgJson.name && !pkgJson.private
    } catch (e) {
        return false
    }
}

function publisher({ publish, packages, apphub }) {
    const basedir = fp => path.dirname(fp)

    switch (publish.toLowerCase()) {
        case 'npm': {
            return packages.filter(packageIsPublishable).map(pkgJsonPath =>
                npmPlugin({
                    pkgRoot: basedir(pkgJsonPath),
                })
            )
        }

        case 'app-hub': {
            return packages
                .map(pkgJsonPath => [
                    npmPlugin({
                        pkgRoot: basedir(pkgJsonPath),
                        npmPublish: false,
                    }),
                    appHubPlugin({
                        pkgRoot: basedir(pkgJsonPath),
                        baseUrl: apphub.baseUrl,
                        channel: apphub.channel,
                    }),
                ])
                .reduce((a, b) => a.concat(b))
        }

        default: {
            return packages.map(pkgJsonPath =>
                npmPlugin({
                    pkgRoot: basedir(pkgJsonPath),
                    npmPublish: false,
                })
            )
        }
    }
}

/* order matters in the plugins array !
 *
 * first, semantic-release runs each phase, and if there are multiple
 * plugins for one phase, they are executed in order of the array.
 */
exports.plugins = async ({ publish, changelog, apphub, npm, github, cwd }) => {
    const rootPackageFile = path.join(cwd, 'package.json')

    if (!fs.existsSync(rootPackageFile)) {
        core.setFailed(`root package.json not found: ${rootPackageFile}`)
    }

    const packages = [
        rootPackageFile,
        ...(await getWorkspacePackages(rootPackageFile, cwd)),
    ].map(fp => path.relative(cwd, fp))

    packages.map(p => core.info(p))

    core.info('Identified packages:')
    core.info(packages)

    return [
        deferReleasePlugin(),
        commitAnalyzerPlugin(),
        releaseNotesPlugin(),
        updateDepsPlugin({ packages }),
        changelogPlugin({ changelogFile: changelog }),
        ...publisher({ publish, packages, apphub, npm, cwd }),
        gitPlugin({ packages }),
        githubPlugin({ github }),
    ]
}
