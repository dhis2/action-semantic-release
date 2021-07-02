const updateDeps = require('../custom/semantic-release-update-deps.js')

exports.updateDepsPlugin = ({ packages }) =>
    packages.length > 1
        ? [
              [
                  updateDeps,
                  {
                      exact: true,
                      packages,
                  },
              ],
          ]
        : []
