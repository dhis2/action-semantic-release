const changelog = require('@semantic-release/changelog')

/*
 * to ensure that the semantic-release plugin is bundled into the dist
 * artifact ncc produces, we need to require it and reference it in code.
 */
exports.changelogPlugin = ({ changelogFile }) => [
    changelog,
    {
        changelogFile,
    },
]
