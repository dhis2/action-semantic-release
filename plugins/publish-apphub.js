const path = require('path')
const plugin = require('../custom/semantic-release-apphub.js')

const basedir = fp => path.dirname(fp)

exports.apphubPlugin = ({ apphub, packages }) =>
    packages.map(pkgJsonPath => [
        plugin,
        {
            pkgRoot: basedir(pkgJsonPath),
            baseUrl: apphub.baseUrl,
            channel: apphub.channel,
        },
    ])
