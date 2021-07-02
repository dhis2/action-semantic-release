const path = require('path')
const fs = require('fs-extra')

const normalizeAndValidatePackages = (packages, cwd) => {
    const errors = []
    const validPackages = []

    packages
        .map(fp => path.join(cwd, fp))
        .forEach(packagePath => {
            let pkgJsonPath
            if (!fs.existsSync(packagePath)) {
                errors.push(`Path ${packagePath} does not exist`)
            } else if (fs.statSync(packagePath).isDirectory()) {
                pkgJsonPath = path.join(packagePath, 'package.json')
            } else if (!packagePath.endsWith('package.json')) {
                errors.push(
                    `Path ${packagePath} is not a package.json file or directory`
                )
            } else {
                pkgJsonPath = packagePath
            }

            if (
                pkgJsonPath &&
                fs.existsSync(pkgJsonPath) &&
                fs.statSync(pkgJsonPath).isFile()
            ) {
                try {
                    const pkgJson = fs.readJsonSync(pkgJsonPath)

                    validPackages.push({
                        path: pkgJsonPath,
                        json: pkgJson,
                    })
                } catch (e) {
                    errors.push({
                        message: `Failed to load package.json at ${pkgJsonPath}`,
                        details: e,
                    })
                }
            } else {
                errors.push(`Package at ${packagePath} not found`)
            }
        })

    return [validPackages, errors]
}

module.exports = normalizeAndValidatePackages
