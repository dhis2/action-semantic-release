const npm = require('@semantic-release/npm')

exports.npmPlugin = ({ pkgRoot, npmPublish }) => [
    npm,
    {
        pkgRoot,
        npmPublish,
    },
]
