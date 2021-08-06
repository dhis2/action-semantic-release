const updateDeps = require('../custom/semantic-release-update-deps.js')

/*
 * to ensure that the semantic-release plugin is bundled into the dist
 * artifact ncc produces, we need to require it and reference it in code.
 */
exports.updateDepsPlugin = ({ packages }) => [
    updateDeps,
    {
        exact: true,
        packages,
    },
]
