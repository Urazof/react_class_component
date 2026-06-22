import { getTranslations } from 'next-intl/server';
import { fetchCharacters } from '../../lib/fetchCharacters';
import Search from './components/Search';
import CardList from './components/CardList';
import Pagination from './components/Pagination';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import ThrowErrorButton from '../../components/ErrorBoundary/ThrowErrorButton';
import './main-page.css';

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params;
  const { q = '', page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const t = await getTranslations('characters');
  const { characters, totalPages, error } = await fetchCharacters(q, page);

  return (
    <div className="main-page">
      <Search defaultValue={q} locale={locale} />
      <div className="main-page__body">
        <div className="main-page__list" data-testid="main-page-list">
          {error ? (
            <ErrorMessage message={error} />
          ) : (
            <ErrorBoundary>
              <CardList
                characters={characters}
                locale={locale}
                currentPage={page}
                searchTerm={q}
                notFoundMessage={t('notFound')}
              />
              {totalPages > 1 && (
                <Pagination currentPage={page} totalPages={totalPages} />
              )}
            </ErrorBoundary>
          )}
        </div>
      </div>
      <div className="main-page__footer">
        <ErrorBoundary>
          <ThrowErrorButton />
        </ErrorBoundary>
      </div>
    </div>
  );
}
