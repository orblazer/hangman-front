import { Link } from 'gatsby'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Layout from '../components/layout'
import Seo from '../components/seo'

const NotFoundHero: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="title has-text-danger">{t('pages.not-found.title')}</h1>
      <h2 className="subtitle">{t('pages.not-found.message')}</h2>
      <div>
        <Link to="/" className="button is-primary">
          ← {t('pages.not-found.back')}
        </Link>
      </div>
    </div>
  )
}

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Layout hero={NotFoundHero}>
      <Seo title={t('pages.not-found.title')} />
    </Layout>
  )
}
export default NotFoundPage
