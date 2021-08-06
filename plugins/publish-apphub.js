const path = require('path')
const apphub = require('../custom/semantic-release-apphub.js')

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
exports.apphubPlugin = ({ baseUrl, channel, packages }) =>
    packages.map(pkgJsonPath => [
        apphub,
        {
            pkgRoot: basedir(pkgJsonPath),
            baseUrl,
            channel,
        },
    ])
