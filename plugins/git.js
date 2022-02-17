const path = require('path')
const git = require('@semantic-release/git')
const fs = require('fs-extra')

/*
 * to ensure that the semantic-release plugin is bundled into the dist
 * artifact ncc produces, we need to require it and reference it in code.
 */
exports.gitPlugin = ({ packages }) => [
    git,
    {
        assets: [
            'CHANGELOG.md',
            'API.md',
            packages,
            packages
                .map(pkgJsonPath =>
                    path.join(path.dirname(pkgJsonPath), 'API.md')
                )
                .filter(fs.existsSync),
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
