module.exports = {
  client: {
    name: 'hangman-front',
    tagName: 'graphql',
    includes: ['./src/**/*.{ts,tsx}', './types/gatsby-plugin-documents.graphql'],
    service: {
      name: 'GatsbyJS',
      localSchemaFile: './types/gatsby-schema.graphql'
    }
  }
}
