import i18n, { i18n as Ti18n, Resource } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { useStaticQuery, graphql } from 'gatsby'
import { useMemo } from 'react'

interface TranslationNode {
  lang: string
  namespace: string
  content: string
}

export default function initI18n(defaultLang: string, resources: Resource = {}): Ti18n {
  i18n
    /**
     * Detect user language.
     * @see Source {@link https://github.com/i18next/i18next-browser-languageDetector}
     */
    .use(LanguageDetector)
    /**
     * Pass i18n instance to react-i18next.
     */
    .use(initReactI18next)
    /**
     * Initialize i18next configuration.
     * @see Docs {@link https://react.i18next.com/latest/i18next-instance}
     * @see Options {@link https://www.i18next.com/overview/configuration-options}
     */
    .init({
      resources,
      fallbackLng: defaultLang,
      partialBundledLanguages: true,
      debug: process.env.NODE_ENV === 'development',

      interpolation: {
        escapeValue: false // not needed for react!!
      },

      react: {
        useSuspense: false
      }
    })

  return i18n
}

export function LoadLanguage(): Resource {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {
    allTranslation: { nodes }
  } = useStaticQuery<GatsbyTypes.TranslationQuery>(graphql`
    query Translation {
      allTranslation {
        nodes {
          lang
          namespace
          content
        }
      }
    }
  `)

  return useMemo(() => {
    const ressources: Resource = {}
    nodes.forEach((node: TranslationNode) => {
      if (typeof ressources[node.lang] === 'undefined') {
        ressources[node.lang] = {}
      }
      ressources[node.lang][node.namespace] = JSON.parse(node.content)
    })

    return ressources
  }, [nodes])
}
