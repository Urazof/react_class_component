import { getTranslations } from 'next-intl/server';
import { routing } from '../../../i18n/routing';
import './about.css';

// Pre-render both locales at build time (SSG).
// Without generateStaticParams, Next.js would render this dynamically on each request.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Opt out of any dynamic rendering — this page is 100% static.
export const dynamic = 'force-static';

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className="about-page">
      <h2 className="about-page__title">{t('title')}</h2>
      <p className="about-page__author">
        <strong>{t('author')}</strong>
      </p>
      <p className="about-page__description">{t('description')}</p>
      <a
        className="about-page__link"
        href="https://rs.school/courses/reactjs"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('course')}
      </a>
    </div>
  );
}
