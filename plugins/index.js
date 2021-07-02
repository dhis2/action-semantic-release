const path = require('path')
const fs = require('fs-extra')
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
    switch (publish.toLowerCase()) {
        case 'npm': {
            return packages.filter(packageIsPublishable).map(pkgJsonPath =>
                npmPlugin({
                    pkgRoot: path.dirname(pkgJsonPath),
                })
            )
        }

        case 'app-hub': {
            return packages
                .map(pkgJsonPath => [
                    npmPlugin({
                        pkgRoot: path.dirname(pkgJsonPath),
                        npmPublish: false,
                    }),
                    appHubPlugin({
                        pkgRoot: path.dirname(pkgJsonPath),
                        baseUrl: apphub.baseUrl,
                        channel: apphub.channel,
                    }),
                ])
                .reduce((a, b) => a.concat(b))
        }

        default: {
            return packages.map(pkgJsonPath =>
                npmPlugin({
                    pkgRoot: path.dirname(pkgJsonPath),
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
exports.plugins = ({
    publish,
    packages,
    cwd,
    changelog,
    apphub,
    npm,
    github,
}) => [
    deferReleasePlugin(),
    commitAnalyzerPlugin(),
    releaseNotesPlugin(),
    ...updateDepsPlugin({ packages }),
    changelogPlugin({ changelogFile: changelog }),
    ...publisher({ publish, packages, apphub, npm }),
    gitPlugin({ packages, cwd }),
    githubPlugin({ github }),
]
