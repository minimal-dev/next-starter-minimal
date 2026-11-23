const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    implementation: 'sass-embedded',
    // Turbopack's sass-loader does not always preserve the source file's
    // directory for relative @use resolution. Adding src/styles as a
    // load path lets Sass find local partials (`@use 'settings'`).
    loadPaths: [path.join(__dirname, 'src/styles')],
  },

  turbopack: {
    rules: {
      '*.svg': [
        // *.svg?url -> emit as a static asset and return its URL
        {
          condition: { query: /(^|[?&])url(&|$)/ },
          type: 'asset',
        },
        // Bare *.svg imports -> compile to a React component via SVGR
        {
          condition: { not: { query: /(^|[?&])url(&|$)/ } },
          loaders: [
            {
              loader: '@svgr/webpack',
              options: {
                icon: true,
              },
            },
          ],
          as: '*.js',
        },
      ],
    },
  },
}

module.exports = nextConfig
