const github = require('@semantic-release/github')

/*
 * to ensure that the semantic-release plugin is bundled into the dist
 * artifact ncc produces, we need to require it and reference it in code.
 */
exports.githubPlugin = () => [
    github,
    {
        assets: [
            {
                path: 'build/bundle/*.zip',
                label: 'DHIS2 compatible application archive',
            },
        ],
    },
]
