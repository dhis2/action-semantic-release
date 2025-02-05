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
        logger.warn(`Failed to locate d2.config.js file, does it exist in ${path.resolve(
                pkgRoot
        )}?`)
        logger.warn('d2.config.js is necessary to automatically publish to the App Hub. Skipping', pkgRoot)
        return
    }

    const d2Config = require(configPath)

    if (d2Config.type === 'lib') {
        logger.log('App Hub publish will be skipped for library', pkgRoot)
        return
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

    if (!env.D2_APP_HUB_TOKEN) {
        throw new SemanticReleaseError(
            "'D2_APP_HUB_TOKEN' missing from environment",
            'EMISSINGTOKEN',
            'The D2_APP_HUB_TOKEN must be set to the environment to publish to the App Hub'
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

    const configPath = path.join(basePath, 'd2.config.js')
    const d2Config = require(configPath)

    if (d2Config.type === 'lib') {
        logger.log('App Hub publish skipped for library', pkgRoot)
        return
    }

    if (semver.lt(pkg.version, nextRelease.version)) {
        throw new SemanticReleaseError(
            `Wrong version detected in ${packagePath}, expected ${nextRelease.version} but got ${pkg.version}.`,
            'EPACKAGEVERSION',
            'The version in package.json should be updated to the next release version before publishing.'
        )
    }

    try {
        await fs.emptyDir('build/bundle')
        logger.info(
            'build/bundle was cleared before repacking bundle and publish.'
        )
    } catch (err) {
        logger.warn(
            'Failed to clear the build/bundle directory before publish.'
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

    return {
        name: 'AppHub release',
        url: new URL(`app/${d2Config.id}`, baseUrl).href,
        channel,
    }
}

exports.success = (config, context) => {
    const { logger } = context

    logger.log('Published successfully to the App Hub')
}

exports.fail = (config, context) => {
    const { logger } = context

    logger.log('Published to the App Hub failed')
}
