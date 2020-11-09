const fs = require('fs-extra')
const path = require('path')
const config = require('./gatsby-config')

/**
 * Makes sure to create localized paths for each file in the /pages folder.
 * For example, pages/404.js will be converted to /en/404.js and /el/404.js and
 * it will be accessible from https:// .../en/404/ and https:// .../el/404/
 */
exports.onCreatePage = async ({ page, actions: { createPage, deletePage, createRedirect } }) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development'
  const originalPath = page.path
  const is404 = ['/dev-404-page/', '/404/', '/404.html'].includes(originalPath)

  // Delete the original page (since we are gonna create localized versions of it) and add a
  // redirect header
  await deletePage(page)

  // Regardless of whether the original page was deleted or not, create the localized versions of
  // the current page
  await Promise.all(
    config.siteMetadata.supportedLanguages.map(async (lang) => {
      const localizedPath = `/${lang}${page.path}`

      // create a redirect based on the accept-language header
      createRedirect({
        fromPath: originalPath,
        toPath: localizedPath,
        Language: lang,
        isPermanent: false,
        redirectInBrowser: isEnvDevelopment,
        statusCode: is404 ? 404 : 301
      })

      await createPage({
        ...page,
        path: localizedPath,
        ...(originalPath === '/404/' ? { matchPath: `/${lang}/*` } : {}),
        context: {
          ...page.context,
          originalPath,
          lang
        }
      })
    })
  )

  // Create a fallback redirect if the language is not supported or the
  // Accept-Language header is missing for some reason
  createRedirect({
    fromPath: originalPath,
    toPath: `/${config.siteMetadata.defaultLanguage}${page.path}`,
    isPermanent: false,
    redirectInBrowser: isEnvDevelopment,
    statusCode: is404 ? 404 : 301
  })
}

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
