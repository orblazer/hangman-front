const { resolve } = require('path')

/**
 * @type import('gatsby-plugin-typegen/types').PluginOptions
 */
const typegenOption = {
  outputPath: 'types/gatsby-types.d.ts',
  emitSchema: {
    'types/gatsby-introspection.json': true
  },
  // TODO: Broken until 'gatsby-plugin-typegen' V3
  emitPluginDocuments: {
    'types/gatsby-plugin-documents.graphql': true
  }
}

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    siteUrl: process.env.URL || 'http://localhost:8000',
    defaultLanguage: 'fr',
    supportedLanguages: ['fr', 'en'],
    title: 'Hangman',
    titleTemplate: '%s | Hangman',
    navbarTitle: 'Hangman',
    description: 'An hangman game with twitch integration',
    contact: '',
    social: {
      twitter: 'https://twitter.com/',
      twitterAt: '@'
    }
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-emotion',
    // Sources
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'translations',
        path: resolve('src', 'locales')
      }
    },
    // Build plugins
    {
      resolve: `gatsby-alias-imports`,
      options: {
        aliases: {
          '@': 'src/'
        }
      }
    },
    {
      resolve: `gatsby-plugin-typescript`,
      options: {
        isTSX: true, // defaults to false
        allExtensions: true // defaults to false
      }
    },
    {
      resolve: 'gatsby-plugin-eslint',
      options: {
        test: /\.js$|\.jsx$/,
        exclude: /(node_modules|.cache|public)/,
        stages: ['develop'],
        options: {
          emitWarning: true,
          failOnError: false
        }
      }
    },
    {
      resolve: 'gatsby-plugin-typegen',
      options: typegenOption
    }
  ]
}
