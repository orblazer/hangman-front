import React from 'react'
import useSiteMetadata from '../hooks/use-site-metadata'
import { Helmet } from 'react-helmet'
import { usePageContext } from '../utils/page-context'

export interface SEOProps {
  title: string
  description?: string
  meta?: React.DetailedHTMLProps<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>[]
}

const SEO: React.FC<SEOProps> = ({ title, description = '', meta = [] }) => {
  const site = useSiteMetadata()
  const { lang } = usePageContext()
  const metaTitle = title === '' ? site.title : site.titleTemplate?.replace('%s', title)
  const metaDescription = description || site.description

  return (
    <Helmet
      htmlAttributes={{
        lang
      }}
      title={title || site.title}
      titleTemplate={title !== '' ? site.titleTemplate : ''}
      meta={[
        {
          name: `description`,
          content: metaDescription
        },
        {
          property: `og:locale`,
          content: lang
        },
        {
          property: `og:title`,
          content: metaTitle
        },
        {
          property: `og:description`,
          content: metaDescription
        },
        {
          property: `og:type`,
          content: `website`
        },
        {
          name: `twitter:card`,
          content: `summary`
        },
        {
          name: `twitter:title`,
          content: metaTitle
        },
        {
          name: `twitter:description`,
          content: metaDescription
        },
        ...meta
      ]}
    />
  )
}
export default SEO
