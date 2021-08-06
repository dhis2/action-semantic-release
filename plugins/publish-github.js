const plugin = require('@semantic-release/github')

exports.githubPlugin = ({ github }) => (github.publish ? [plugin] : [])
