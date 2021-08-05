const path = require('path')
const SemanticReleaseError = require('@semantic-release/error')
const execa = require('execa')
const fs = require('fs-extra')
const semver = require('semver')

exports.verifyConditions = (config, context) => {
    const { pkgRoot } = config
    const { env, logger, cwd } = context

    const basePath = pkgRoot ? path.resolve(cwd, pkgRoot) : cwd

    logger.log('pkg root', pkgRoot)
    logger.log('semantic-release cwd', cwd)
    logger.log('basePath', basePath)

    const packagePath = path.join(basePath, 'package.json')
    logger.log('packagePath', packagePath)

    if (!fs.existsSync(packagePath)) {
        throw new SemanticReleaseError(
            `Failed to locate package.json file, does it exist in ${path.resolve(
                pkgRoot
            )}?`,
            'EMISSINGPACKAGE',
            'package.json is necessary to automatically publish to the App Hub'
        )
    }

    const configPath = path.join(basePath, 'd2.config.js')
    logger.log('configPath', configPath)

    if (!fs.existsSync(configPath)) {
        throw new SemanticReleaseError(
            `Failed to locate d2.config.js file, does it exist in ${path.resolve(
                pkgRoot
            )}?`,
            'EMISSINGD2CONFIG',
            'd2.config.js is necessary to automatically publish to the App Hub'
        )
    }

    const d2Config = require(configPath)

    if (d2Config.type === 'lib') {
        throw new SemanticReleaseError(
            'App Hub does not support publishing libraries.',
            'EAPPHUBSUPPORT',
            "The type in d2.config.js must not be 'lib'"
        )
    }

    if (!d2Config.id) {
        throw new SemanticReleaseError(
            "'id' field missing from d2.config.js",
            'EMISSINGAPPHUBID',
            'The App Hub application id must be defined in d2.config.js'
        )
    }

    if (!d2Config.minDHIS2Version) {
        throw new SemanticReleaseError(
            "'minDHIS2Version' field missing from d2.config.js",
            'EMISSINGMINDHIS2VERSION',
            'The minimum supported DHIS2 version must be defined in d2.config.js'
        )
    }

    if (!env.APP_HUB_TOKEN) {
        throw new SemanticReleaseError(
            "'APP_HUB_TOKEN' missing from environment",
            'EMISSINGTOKEN',
            'The APP_HUB_TOKEN must be set to the environment to publish to the App Hub'
        )
    }
}

// maybe we can use this step for release channels
// exports.addChannel = (config, context) => {}

exports.publish = async (config, context) => {
    const { pkgRoot, baseUrl, channel } = config
    const { env, nextRelease, logger, stdout, stderr, cwd } = context

    const basePath = pkgRoot ? path.resolve(cwd, pkgRoot) : cwd
    logger.log('basePath', basePath)

    // make sure to read the file from disk since it will have changed
    // in a previous external step (semantic-release/npm), and if we use
    // require here we get a cached result.
    const packagePath = path.join(basePath, 'package.json')
    const pkg = fs.readJsonSync(packagePath)

    if (semver.lt(pkg.version, nextRelease.version)) {
        throw new SemanticReleaseError(
            `Wrong version detected in ${packagePath}, expected ${nextRelease.version} but got ${pkg.version}.`,
            'EPACKAGEVERSION',
            'The version in package.json should be updated to the next release version before publishing.'
        )
    }

    const cmd = 'yarn'
    const args = [
        'd2-app-scripts',
        'publish',
        ...(channel ? ['--channel', channel] : []),
        ...(baseUrl ? ['--baseUrl', baseUrl] : []),
    ]

    const result = execa(cmd, args, { cwd: basePath, env })
    result.stdout.pipe(stdout, { end: false })
    result.stderr.pipe(stderr, { end: false })
    await result

    logger.info(result)
}

exports.success = (config, context) => {
    const { logger } = context

    logger.log('Published successfully to the App Hub')
}

exports.fail = (config, context) => {
    const { logger } = context

    logger.log('Published to the App Hub failed')
}
