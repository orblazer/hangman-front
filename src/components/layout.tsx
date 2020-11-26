import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import { useTranslation } from 'react-i18next'
import { Link as GatsbyLink } from 'gatsby'
import useSiteMetaData from '../hooks/use-site-metadata'
import { spaces, colors } from '@/styles'
import Link from './styled/link'

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${colors.header.backgroundColor};
  color: ${colors.header.color};
  padding: 0 2vw;

  & > nav {
    display: flex;
  }
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

const MenuLink = styled(GatsbyLink)`
  display: flex;
  color: currentColor;
  cursor: pointer;
  text-decoration: none;
  padding: ${spaces[4]};

  &:hover {
    background-color: ${colors.header.navbar.backgroundColor};
  }
`

const Layout: React.FC<{ space?: keyof typeof spaces }> = ({ children, space }) => {
  const { t } = useTranslation()
  const { title } = useSiteMetaData()

  return (
    <>
      <Header>
        <span>{title}</span>
        <nav>
          <MenuLink to="/">home</MenuLink>
          <MenuLink to="/create-game">{t('navbar.create-game')}</MenuLink>
        </nav>
      </Header>
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
