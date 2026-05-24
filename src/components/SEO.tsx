import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

const SITE_NAME = 'Retouch Academy'
const BASE_URL = 'https://retouchacademy.vercel.app'
const DEFAULT_IMAGE = `${BASE_URL}/og.jpeg`
const DEFAULT_DESCRIPTION =
  'Decouvrez notre plateforme de formation en ligne. Accedez a des cours de qualite, suivez votre progression et developpez vos competences.'

const SEO = ({
  title = 'Plateforme de Formation en Ligne - Retouch Academy',
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = BASE_URL,
  type = 'website',
}: SEOProps) => {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} - ${SITE_NAME}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <link rel="canonical" href={url} />
    </Helmet>
  )
}

export default SEO
