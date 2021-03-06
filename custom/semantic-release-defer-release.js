const analyzeCommits = (config, context) => {
    const { logger, commits } = context

    if (commits && commits.length > 0) {
        const { message, commit } = commits[0]
        const defer = /\[(defer|skip)[ -]release\]/gi

        if (message.match(defer)) {
            logger.warn(
                `This release has been deferred by commit ${commit.short}`
            )
            logger.complete('Halting release process...')
            process.exit(0)
        }
    } else {
        logger.info('No commits to analyze.')
    }
}

module.exports = { analyzeCommits }
