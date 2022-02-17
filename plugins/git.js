const git = require('@semantic-release/git')

/*
 * to ensure that the semantic-release plugin is bundled into the dist
 * artifact ncc produces, we need to require it and reference it in code.
 */
exports.gitPlugin = () => [
    git,
    {
        assets: [
            'CHANGELOG.md',
            'API.md',
            '**/*/API.md',
            '**/*/yarn.lock',
            '**/*/package.json',
        ],
        message:
            'chore(release): cut ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
]
