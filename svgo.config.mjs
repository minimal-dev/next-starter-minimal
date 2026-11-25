/** @type {import('svgo').Config} */
const config = {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // `currentColor` must survive: icons inherit their colour.
          convertColors: {
            currentColor: false,
          },
        },
      },
    },
    // Do not add `removeXMLNS`: IDE preview needs `xmlns` on new SVGs.
    'removeDimensions',
    {
      name: 'removeAttrs',
      params: {
        attrs: ['xmlns:xlink', 'data-name'],
      },
    },
    // Gradient/mask ids must stay unique when several inline icons share a page.
    'prefixIds',
    'sortAttrs',
    'removeEmptyContainers',
  ],
}

export default config
