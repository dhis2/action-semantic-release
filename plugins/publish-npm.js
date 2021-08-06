const path = require('path')
const plugin = require('@semantic-release/npm')

const basedir = fp => path.dirname(fp)

exports.npmPlugin = ({ npm, packages }) =>
    packages.map(pkgJsonPath => [
        plugin,
        {
            pkgRoot: basedir(pkgJsonPath),
            npmPublish: npm.publish,
        },
    ])
