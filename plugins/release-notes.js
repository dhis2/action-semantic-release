const releaseNotesGenerator = require('@semantic-release/release-notes-generator')

/*
 * to ensure that the semantic-release plugin is bundled into the dist
 * artifact ncc produces, we need to require it and reference it in code.
 */
exports.releaseNotesPlugin = () => [releaseNotesGenerator]
