const updateDeps = require('../custom/semantic-release-update-deps.js')

exports.updateDepsPlugin = ({ packages }) => [
    updateDeps,
    {
        exact: true,
        packages,
    },
]
