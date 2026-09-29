/** @type {import('next').NextConfig} */

const path = require('path')
const withBundleAnalyzer = require('@next/bundle-analyzer')

const isProductionBuild = process.env.NODE_ENV === 'production'

const isCloudBuild = process.env.VERCEL

const nextConfig = {
  trailingSlash: false,
  sassOptions: {
    implementation: 'sass-embedded',
    // Turbopack's sass-loader does not always preserve the source file's
    // directory for relative @import resolution. Adding src/styles as a
    // load path lets Sass find local partials (`@import 'settings'`).
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

module.exports = () => {
  const plugins = []

  const bundleAnalyzerCondition = !isCloudBuild && isProductionBuild

  if (bundleAnalyzerCondition)
    plugins.push(
      withBundleAnalyzer({
        enabled: bundleAnalyzerCondition,
      })
    )

  return plugins.reduce((acc, next) => next(acc), nextConfig)
}
