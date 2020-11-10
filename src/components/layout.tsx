import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import useSiteMetaData from '../hooks/use-site-metadata'
import { spaces, colors } from '@/styles'
import Link from './styled/link'

const Header = styled.header`
  background-color: ${colors.header.backgroundColor};
  color: ${colors.header.color};
  padding: ${spaces[4]} 2vw;
`

const Main = styled.main(
  ({ space = '0' }: { space?: keyof typeof spaces }) => css`
    flex: 1;
    width: 1280px;
    margin: ${spaces[space]} auto;
  `
)

const Footer = styled.footer`
  background-color: ${colors.footer.backgroundColor};
  color: ${colors.footer.color};
  padding: ${spaces[2]} 2vw;
  font-size: 0.75rem;
`

const Layout: React.FC<{ space?: keyof typeof spaces }> = ({ children, space }) => {
  const { title } = useSiteMetaData()

  return (
    <>
      <Header>{title}</Header>
      <Main space={space}>{children}</Main>
      <Footer>
        <span>© {new Date().getFullYear()}</span>
        <Link to="/" style={{ marginLeft: spaces[2] }}>
          Donation
        </Link>
      </Footer>
    </>
  )
}
export default Layout
