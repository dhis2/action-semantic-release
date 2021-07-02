const changelog = require('@semantic-release/changelog')

exports.changelogPlugin = ({ changelogFile }) => [
    changelog,
    {
        changelogFile,
    },
]
