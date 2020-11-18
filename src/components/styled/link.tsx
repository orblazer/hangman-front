import colors from '@/styles/colors'
import styled from '@emotion/styled'
import UnstyledLink from '../link'

const Link = styled(UnstyledLink)`
  color: ${colors.link.color};
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: ${colors.link.hoverColor};
  }
`
export default Link
