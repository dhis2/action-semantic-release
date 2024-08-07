const fs = require('fs')
const path = require('path')
const AggregateError = require('aggregate-error')
const execa = require('execa')
const normalizeAndValidatePackages = require('../support/normalizeAndValidatePackages.js')

const verifyConditions = (config = {}, context) => {
    const { packages } = config
    const { logger, cwd } = context

    if (!packages || !packages.length || packages.length < 2) {
        logger.info(
            'You must pass at least two package directories to @dhis2/semantic-release-update-deps'
        )
        return
    }

    const [validPackages, errors] = normalizeAndValidatePackages(packages, cwd)

    if (errors.length) {
        throw new AggregateError(errors)
    }

    validPackages.forEach(pkg => {
        pkg.label = pkg.json.name || '<unnamed>'
        logger.log(`Package ${pkg.label} found at ${pkg.path}`)
    })

    context.packages = validPackages
}

const replaceDependencies = ({ pkg, listNames, packageNames, version }) => {
    const dependencies = []
    packageNames.forEach(packageName => {
        listNames.forEach(listName => {
            if (pkg[listName] && pkg[listName][packageName]) {
                pkg[listName][packageName] = version
                dependencies.push(`${packageName} (${listName})`)
            }
        })
    })
    return dependencies
}

const prepare = async (config, context) => {
    if (!context.packages) {
        verifyConditions(config, context)
    }
    const { exact, updatePackageVersion = true, tabSpaces = 4 } = config
    const { nextRelease, logger, packages } = context

    if (!packages) {
        logger.complete(
            'Needs at least two packages to update internal dependencies between them. Skipping...'
        )
        return
    }

    const targetVersion = exact
        ? nextRelease.version
        : `^${nextRelease.version}`

    const names = packages.map(pkg => pkg.json.name).filter(n => n)
    packages.forEach(pkg => {
        const pkgJson = pkg.json
        const relativePath = path.relative(context.cwd, pkg.path)

        if (updatePackageVersion) {
            pkgJson.version = nextRelease.version
            logger.log(
                `Updated version to ${nextRelease.version} for package ${pkg.label} at ${relativePath}`
            )
        }

        replaceDependencies({
            pkg: pkgJson,
            listNames: ['dependencies', 'devDependencies', 'peerDependencies'],
            packageNames: names,
            version: targetVersion,
        }).forEach(dep =>
            logger.log(
                `Upgraded dependency ${dep}@${targetVersion} for ${pkg.label} at ${relativePath}`
            )
        )
        fs.writeFileSync(
            pkg.path,
            JSON.stringify(pkgJson, undefined, tabSpaces) + '\n'
        )
    })

    logger.info('Running yarn install after updating packages')

    const cmd = 'yarn'
    const args = ['install']

    const { pkgRoot, baseUrl, channel } = config
    const { env, stdout, stderr, cwd } = context

    const basePath = pkgRoot ? path.resolve(cwd, pkgRoot) : cwd
    logger.log('basePath', basePath)

    const result = execa(cmd, args, { cwd: basePath, env })
    result.stdout.pipe(stdout, { end: false })
    result.stderr.pipe(stderr, { end: false })
    await result

    logger.info(result)
}

module.exports = { verifyConditions, prepare }
