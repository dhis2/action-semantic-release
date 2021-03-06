const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const glob = require('glob')

// Simplified from https://github.com/yarnpkg/yarn/blob/bb9741af4d1fe00adb15e4a7596c7a3472d0bda3/src/config.js#L814
const globPackageFilePattern = (pattern, cwd) =>
    glob.sync(path.join(cwd, pattern.replace(/\/?$/, '/package.json')), {
        ignore: pattern.replace(/\/?$/, '/node_modules/**/package.json'),
    })

const getWorkspacePackages = async (packageFile, cwd) => {
    try {
        const rootPackage = fs.readJsonSync(packageFile)
        if (rootPackage.workspaces) {
            let workspaces
            if (Array.isArray(rootPackage.workspaces)) {
                workspaces = rootPackage.workspaces
            } else {
                workspaces = rootPackage.workspaces.packages
                if (!workspaces || !Array.isArray(workspaces)) {
                    reporter.warn(
                        '[release::getWorkspacePackage] Invalid workspaces key-value in root package.json'
                    )
                    return []
                }
            }

            return workspaces.reduce(
                (packages, wsPattern) => [
                    ...packages,
                    ...globPackageFilePattern(wsPattern, cwd),
                ],
                []
            )
        }
    } catch (e) {
        reporter.warn(
            `[release::getWorkspacePackage] Failed to load ${packageFile}`,
            e
        )
    }
    return []
}

module.exports = getWorkspacePackages
