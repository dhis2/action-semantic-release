const path = require('path')
const git = require('@semantic-release/git')
const fs = require('fs-extra')

exports.gitPlugin = ({ packages }) => [
    git,
    {
        assets: [
            'CHANGELOG.md',
            packages,
            packages
                .map(pkgJsonPath =>
                    path.join(path.dirname(pkgJsonPath), 'yarn.lock')
                )
                .filter(fs.existsSync),
        ],
        message:
            'chore(release): cut ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
]
