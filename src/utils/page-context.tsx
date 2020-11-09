import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export interface PageContext {
  path: string
  originalPath: string
  lang: string
  defaultLanguage: string
}

const RPageContext = React.createContext<PageContext>({
  path: '/',
  originalPath: '/',
  lang: 'en',
  defaultLanguage: 'en'
})

export function usePageContext(): PageContext {
  return React.useContext(RPageContext)
}

export const PageProvider: React.FC<{ value: PageContext; defaultLanguage: string }> = ({
  value,
  defaultLanguage,
  children
}) => {
  const { i18n } = useTranslation()
  const pageLanguage = value.lang || defaultLanguage

  // Set default language
  value.defaultLanguage = defaultLanguage

  // Handle change language
  useEffect(() => {
    if (i18n.isInitialized && i18n.language !== pageLanguage) {
      i18n.changeLanguage(pageLanguage)
    }
  }, [i18n, pageLanguage])

  return <RPageContext.Provider value={value}>{children}</RPageContext.Provider>
}
