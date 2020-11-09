import { useStaticQuery, graphql } from 'gatsby'

export type SiteMetadata = Pick<
  GatsbyTypes.SiteSiteMetadata,
  'siteUrl' | 'supportedLanguages' | 'title' | 'titleTemplate' | 'navbarTitle' | 'description' | 'contact' | 'social'
>

export default function useSiteMetadata(): SiteMetadata {
  const { site } = useStaticQuery<GatsbyTypes.SiteMetaDataQuery>(graphql`
    query SiteMetaData {
      site {
        siteMetadata {
          siteUrl
          supportedLanguages
          title
          titleTemplate
          navbarTitle
          description
          contact
          social {
            twitter
            twitterAt
          }
        }
      }
    }
  `)
  if (typeof site === 'undefined' || typeof site?.siteMetadata === 'undefined') {
    throw new Error('Could not found site metadata')
  }

  return site.siteMetadata
}
