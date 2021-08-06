const deferRelease = require('../custom/semantic-release-defer-release.js')

/*
 * to ensure that the semantic-release plugin is bundled into the dist
 * artifact ncc produces, we need to require it and reference it in code.
 */
exports.deferReleasePlugin = () => [deferRelease]
