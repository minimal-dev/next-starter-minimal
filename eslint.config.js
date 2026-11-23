const { defineConfig, globalIgnores } = require('eslint/config')
const { fixupPluginRules } = require('@eslint/compat')
const json = require('@eslint/json').default
const nextPlugin = require('@next/eslint-plugin-next')
const reactPlugin = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const globals = require('globals')
const tseslint = require('typescript-eslint')

module.exports = defineConfig([
  globalIgnores(['.next/', 'out/', 'build/', '.claude/', 'next-env.d.ts']),
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    extends: [
      reactHooks.configs.flat.recommended,
      nextPlugin.configs['core-web-vitals'],
      prettierRecommended,
    ],
    // eslint-plugin-react 7.x still calls context methods removed in ESLint 10.
    plugins: { react: fixupPluginRules(reactPlugin) },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      'react/no-unknown-property': 'off',
      'react/prop-types': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/jsx-filename-extension': ['warn', { extensions: ['.ts', '.tsx'] }],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      camelcase: ['warn', { ignoreImports: true }],
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
  {
    files: ['**/*.json'],
    ignores: ['package-lock.json'],
    language: 'json/json',
    extends: [json.configs.recommended],
  },
])
