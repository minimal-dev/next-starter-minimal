/** @type {import('next').NextConfig} */

const path = require('path')
const withClassnamesMinifier = require('next-classnames-minifier').default
const withBundleAnalyzer = require('@next/bundle-analyzer')

const productionBranchNames = ['master', 'main']

const isProductionBuild = process.env.NODE_ENV === 'production'

const isCloudBuild =
  // Cloudflare
  process.env.CF_PAGES ||
  // Vercel
  process.env.VERCEL

const isProductionDeployment =
  // Cloudflare
  productionBranchNames.includes(process.env.CF_PAGES_BRANCH) ||
  // Vercel
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

const nextConfig = {
  trailingSlash: false,
  sassOptions: {
    implementation: 'sass-embedded',
    // Turbopack's sass-loader does not always preserve the source file's
    // directory for relative @import resolution. Adding src/styles and the
    // Bootstrap scss dir as load paths lets Sass find local partials
    // (`@import 'settings'`) and Bootstrap's intra-package partials
    // (`@import "vendor/rfs"`).
    loadPaths: [
      path.join(__dirname, 'src/styles'),
      path.join(__dirname, 'node_modules/bootstrap/scss'),
    ],
  },
  modularizeImports: {
    'react-bootstrap': {
      transform: 'react-bootstrap/{{member}}',
      preventFullImport: true,
    },
    lodash: {
      transform: 'lodash/{{member}}',
      preventFullImport: true,
    },
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

  if (
    (isCloudBuild && isProductionDeployment) ||
    (!isCloudBuild && isProductionBuild)
  )
    plugins.push(withClassnamesMinifier())

  const bundleAnalyzerCondition = !isCloudBuild && isProductionBuild

  if (bundleAnalyzerCondition)
    plugins.push(
      withBundleAnalyzer({
        enabled: bundleAnalyzerCondition,
      })
    )

  return plugins.reduce((acc, next) => next(acc), nextConfig)
}
