const { resolve } = require('path')

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'standard',
    'standard-react',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
    'prettier/standard'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  globals: {
    GatsbyTypes: 'readonly',
    NodeJS: 'readonly'
  },
  plugins: ['@typescript-eslint', 'react', 'graphql', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },
  rules: {
    'react/prop-types': 'off', // Disable prop-types as we use TypeScript for type checking
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks: '(useSiteMetaData)'
      }
    ],
    'no-use-before-define': 'off',
    'graphql/template-strings': [
      'error',
      {
        env: 'relay',
        tagName: 'graphql',
        schemaJsonFilepath: resolve('types', 'gatsby-introspection.json')
      }
    ]
  },
  overrides: [
    // Override some TypeScript rules just for .js files
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
}
