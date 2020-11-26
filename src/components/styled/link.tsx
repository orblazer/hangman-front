import colors from '@/styles/colors'
import styled from '@emotion/styled'
import { Link as GatsbyLink } from 'gatsby'

const Link = styled(GatsbyLink)`
  color: ${colors.link.color};
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: ${colors.link.hoverColor};
  }
`
export default Link
