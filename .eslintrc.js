module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@next/next/recommended',
    'plugin:react/recommended',
    'plugin:json/recommended',
    'prettier',
  ],
  plugins: ['react', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'arrow-body-style': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 'warn',
    'react/forbid-prop-types': 'off',
    'import/prefer-default-export': 'off',
    'react/state-in-constructor': 'off',
    camelcase: ['warn', { ignoreImports: true }],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'id-match': [
      'error',
      '^[a-zA-Z0-9_$]*$',
      {
        properties: true,
        onlyDeclarations: false,
      },
    ],
  },
}
