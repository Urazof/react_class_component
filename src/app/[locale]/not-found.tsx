'use client';

import { useTranslations } from 'next-intl';
import { Link } from '../../i18n/navigation';
import './not-found.css';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <div className="not-found">
      <h1 className="not-found__title">{t('title')}</h1>
      <p className="not-found__description">{t('description')}</p>
      <Link className="not-found__link" href="/">
        {t('back')}
      </Link>
    </div>
  );
}
