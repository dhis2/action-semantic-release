const core = require('@actions/core')
const semanticRelease = require('semantic-release')
const { plugins } = require('./plugins/index.js')

//const github = require('@actions/github')

// setup the inputs
const changelog = core.getInput('changelog-file')
const cwd = core.getInput('cwd')
const dryRun = core.getBooleanInput('dry-run')
const ci = core.getBooleanInput('ci')
const debug = core.getBooleanInput('debug')

const apphub = {}
apphub.token = core.getInput('apphub-token')
apphub.baseUrl = core.getInput('apphub-baseurl')
apphub.channel = core.getInput('apphub-channel')
apphub.publish = core.getBooleanInput('publish-apphub')

core.startGroup('App Hub configuration')
core.info(`Token: ${apphub.token}`)
core.info(`Base URL: ${apphub.baseUrl}`)
core.info(`Channel: ${apphub.channel}`)
core.info(`Publish: ${apphub.publish}`)
core.endGroup()

const github = {}
github.token = core.getInput('github-token')
github.publish = core.getBooleanInput('publish-github')

core.startGroup('GitHub configuration')
core.info(`Token: ${github.token}`)
core.info(`Publish: ${github.publish}`)
core.endGroup()

const npm = {}
npm.token = core.getInput('npm-token')
npm.allowSameVersion = core.getBooleanInput('npm-allow-same-version')
npm.publish = core.getBooleanInput('publish-npm')

core.startGroup('NPM configuration')
core.info(`Token: ${npm.token}`)
core.info(`Allow Same Version: ${npm.allowSameVersion}`)
core.info(`Publish: ${npm.publish}`)
core.endGroup()

const main = async () => {
    core.info(`Use ${cwd} as current working directory`)

    /* rely on defaults for configuration, except for plugins as they
     * need to be custom.
     *
     * https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md
     */
    const options = {
        plugins: await plugins({
            cwd,
            apphub,
            github,
            npm,
            changelog,
        }),
        dryRun,
        ci,
        // this adds "main" branch to the default branches from the version of semantic-release that we use
        // default list is here: https://github.com/semantic-release/semantic-release/blob/v17.4.4/docs/usage/configuration.md#branches
        branches: ['+([0-9])?(.{+([0-9]),x}).x', 'master', 'main', 'next', 'next-major', {name: 'beta', prerelease: true}, {name: 'alpha', prerelease: true}]
    }

    

    const config = {
        env: {
            ...process.env,
            NPM_CONFIG_ALLOW_SAME_VERSION: npm.allowSameVersion, // Ensure we still publish even though we've already updated the package versions
            D2_APP_HUB_TOKEN: apphub.token,
            NPM_TOKEN: npm.token,
            GH_TOKEN: github.token,
            GITHUB_TOKEN: github.token,
        },
        cwd,
    }

    core.info(`options for semantic-release: ${options}`)
    core.info(`config for semantic-release: ${config}`)

    try {
        if (debug) {
            core.info('debug logs enabled for semantic-release')
            require('debug').enable('semantic-release:*')
        }

        const result = await semanticRelease(options, config)

        if (result) {
            const { lastRelease, commits, nextRelease, releases } = result

            if (nextRelease) {
                core.info(
                    `Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`
                )

                core.setOutput('new-version', nextRelease.version)
            }

            if (lastRelease) {
                core.info(`The last release was "${lastRelease.version}".`)
                core.setOutput('old-version', lastRelease.version)
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
