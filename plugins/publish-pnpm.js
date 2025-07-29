const path = require('path')
const pnpm = require('semantic-release-pnpm')

const basedir = fp => path.dirname(fp)

/*
 * returns an array containing plugin arrays for each package, so needs
 * to be spread on the receiving side into the semantic-release plugins
 * array:
 *
 * [
 *  [ plugin, opts ],
 * ]
 *
 */
exports.pnpmPlugin = ({ npmPublish, packages }) =>
    packages.map(pkgJsonPath => [
        pnpm,
        {
            pkgRoot: basedir(pkgJsonPath),
            npmPublish,
        },
    ])
