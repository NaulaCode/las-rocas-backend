import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Asociación Turística Las Rocas';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({ title, description, image, url }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc = description || 'Asociación Turística Las Rocas - Plataforma de promoción turística y gestión de reservas en la Comuna San Miguel, Naranjal, Guayas, Ecuador.';
  const img = image || '/favicon.svg';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
