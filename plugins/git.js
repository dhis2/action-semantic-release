const path = require('path')
const git = require('@semantic-release/git')
const fs = require('fs-extra')

exports.gitPlugin = ({ packages, cwd }) => [
    git,
    {
        assets: [
            'CHANGELOG.md',
            packages.map(pkgJsonPath => path.relative(cwd, pkgJsonPath)),
            packages
                .map(pkgJsonPath =>
                    path.join(path.dirname(pkgJsonPath), 'yarn.lock')
                )
                .filter(fs.existsSync)
                .map(pkgJsonPath => path.relative(cwd, pkgJsonPath)),
        ],
        message:
            'chore(release): cut ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
]
