const deferRelease = require('../custom/semantic-release-defer-release.js')

exports.deferReleasePlugin = () => [deferRelease]
