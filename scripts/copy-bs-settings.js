/* eslint-disable import/no-extraneous-dependencies,no-console */
const fs = require('fs').promises
const prettier = require('prettier')

const srcPath = 'node_modules/bootstrap/scss/_variables.scss'
const destPath = 'src/styles/settings.scss'

// Test if file exists
fs.access(destPath)
  // File already exists
  .then(() => console.log('Bootstrap: settings.scss already exists'))
  // File does not exist
  .catch(() => {
    // Read the file
    fs.readFile(srcPath, { encoding: 'utf-8' })
      // Bootstrap 5.3+ adds `@import "variables-dark"` inside _variables.scss.
      // That import is relative to bootstrap/scss/, so retarget it to the
      // ~bootstrap alias so it resolves from this repo's src/styles/.
      .then((data) =>
        data.replace(
          /@import\s+["']variables-dark["']/,
          "@import '~bootstrap/scss/variables-dark'"
        )
      )
      // Prettier
      .then((data) =>
        prettier
          // Get prettier config
          .resolveConfig(srcPath, {
            config: '.prettierrc',
          })
          // Format the file
          .then((options) =>
            prettier.format(data, { ...options, filepath: srcPath })
          )
      )
      // Write the file to the destination
      .then((formattedData) =>
        fs.writeFile(destPath, formattedData, { encoding: 'utf-8', flag: 'wx' })
      )
      // Log success
      .then(() =>
        console.log('Bootstrap: settings.scss file copied from node_modules')
      )
      // Log error
      .catch((err) => console.error(err))
  })
