const fs = require('fs-extra')
const path = require('path')

exports.onPostBuild = exports.onCreateDevServer = ({ reporter }) => {
  reporter.info('Copying translation files')
  fs.copySync(path.join(__dirname, '/src/locales'), path.join(__dirname, '/public/locales'))
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type Translation implements Node @infer {
      lang: String!
      namespace: String!
      content: String!
    }
  `
  createTypes(typeDefs)
}

exports.onCreateNode = async function onCreateNode({
  node,
  actions: { createNode, createParentChildLink },
  loadNodeContent,
  createNodeId,
  createContentDigest,
  reporter
}) {
  // We only care about translations content.
  if (node.internal.mediaType !== `application/json` || node.sourceInstanceName !== 'translations') {
    return
  }

  // Retrieve lang
  const langMatches = /\/(\w+)$/.exec(node.dir)
  if (langMatches === null) {
    return
  }
  const lang = langMatches[1]

  const namespace = node.name
  const content = await loadNodeContent(node)
  let parsedContent
  try {
    parsedContent = JSON.parse(content)
  } catch (err) {
    const hint = node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`
    reporter.panicOnBuild(`Unable to parse JSON ${hint}\n${err.message}`)
  }

  const obj = {
    namespace,
    lang,
    content: JSON.stringify(parsedContent)
  }
  const translationNode = {
    id: parsedContent.id ? String(parsedContent.id) : createNodeId(`${node.id} >>> Translation`),
    children: [],
    parent: node.id,
    ...obj,
    internal: {
      contentDigest: createContentDigest(obj),
      type: 'Translation'
    }
  }
  createNode(translationNode)
  createParentChildLink({ parent: node, child: translationNode })
}
