const path = require('path')
const core = require('@actions/core')
const semanticRelease = require('semantic-release')
const { plugins } = require('./plugins/index.js')
const getWorkspacePackages = require('./support/getWorkspacePackages.js')

//const github = require('@actions/github')

// setup the inputs
const changelog = core.getInput('changelog-file')
const cwd = core.getInput('cwd')

const apphub = {}
apphub.token = core.getInput('app-hub-token')
apphub.baseUrl = core.getInput('app-hub-baseurl')
apphub.channel = core.getInput('app-hub-channel')

const github = {}
github.token = core.getInput('github-token')

const npm = {}
npm.token = core.getInput('npm-token')
npm.allowSameVersion = core.getInput('npm-allow-same-version')

const main = async () => {
    const rootPackageFile = path.join(cwd, 'package.json')

    const packages = [
        rootPackageFile,
        ...(await getWorkspacePackages(rootPackageFile)),
    ]

    /* rely on defaults for configuration, except for plugins as they
     * need to be custom.
     *
     * https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md
     */
    const options = {
        plugins: plugins({ cwd, packages, apphub, github, npm, changelog }),
    }

    const config = {
        env: {
            ...process.env,
            NPM_CONFIG_ALLOW_SAME_VERSION: npm.allowSameVersion, // Ensure we still publish even though we've already updated the package versions
            APP_HUB_TOKEN: apphub.token,
        },
    }

    try {
        const result = await semanticRelease(options, config)

        if (result) {
            const { lastRelease, commits, nextRelease, releases } = result

            if (nextRelease) {
                core.info(
                    `Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`
                )
            }

            if (lastRelease) {
                core.info(`The last release was "${lastRelease.version}".`)
            }

            for (const release of releases) {
                core.info(
                    `The release was published with plugin "${release.pluginName}".`
                )
            }
        } else {
            core.info('No release published.')
        }
    } catch (err) {
        core.setFailed(`The automated release failed with ${err}`)
    }
}

main()
