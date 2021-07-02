const appHub = require('../custom/semantic-release-app-hub.js')

exports.appHubPlugin = ({ pkgRoot, baseUrl, channel }) => [
    appHub,
    {
        pkgRoot,
        baseUrl,
        channel,
    },
]
