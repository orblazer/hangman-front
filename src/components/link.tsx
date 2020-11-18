import React from 'react'
import { Link as GatsbyLink, GatsbyLinkProps } from 'gatsby'
import { usePageContext } from '../utils/page-context'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Link: React.FC<GatsbyLinkProps<null>> = ({ to, ref, ...rest }) => {
  const { lang } = usePageContext()
  const location = `/${lang}${to}`

  return <GatsbyLink {...rest} to={location} />
}
export default Link
