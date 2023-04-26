/** @type {import('next').NextConfig} */

const path = require('path')
const withClassnamesMinifier = require('next-classnames-minifier').default

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
  experimental: {
    appDir: true,
    // serverComponentsExternalPackages: ['react-bootstrap'],
  },

  webpack(config, options) {
    const { isServer } = options

    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    )

    const path = 'static/svg/'

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        // issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
              // expandProps: false
            },
          },
        ],
      }
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
}

module.exports =
  (isCloudBuild && isProductionDeployment) ||
  (!isCloudBuild && isProductionBuild)
    ? withClassnamesMinifier(nextConfig)
    : nextConfig
