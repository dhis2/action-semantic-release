const path = require('path')
const npm = require('@semantic-release/npm')

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
exports.npmPlugin = ({ npmPublish, packages }) =>
    packages.map(pkgJsonPath => [
        npm,
        {
            pkgRoot: basedir(pkgJsonPath),
            npmPublish,
        },
    ])
