const next = require('eslint-config-next/core-web-vitals')
const reactPlugin = require('eslint-plugin-react')
const prettierPlugin = require('eslint-plugin-prettier')
const prettierConfig = require('eslint-config-prettier')
const js = require('@eslint/js')
const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  { ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'] },
  ...next,
  reactPlugin.configs.flat.recommended,
  ...compat.extends('plugin:json/recommended'),
  {
    plugins: { prettier: prettierPlugin },
    settings: { react: { version: 'detect' } },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'react/jsx-filename-extension': [1, { extensions: ['.ts', '.tsx'] }],
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
  },
]
