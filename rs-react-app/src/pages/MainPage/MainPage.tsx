import { useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCharacters } from '../../api/rickmorty';
import type { Character } from '../../api/rickmorty';
import Search from '../../components/Search/Search';
import CardList from '../../components/CardList/CardList';
import Pagination from '../../components/Pagination/Pagination';
import Spinner from '../../components/Spinner/Spinner';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import ThrowErrorButton from '../../components/ErrorBoundary/ThrowErrorButton';
import './MainPage.css';

function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // page читается из URL — единственный источник истины
  const page = Number(searchParams.get('page') ?? '1');

  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  // ref — хранит текущий термин без добавления в deps useCallback
  const termRef = useRef('');

  const fetchData = useCallback(async (term: string, pageNum: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { results, info } = await fetchCharacters(term, pageNum);
      setCharacters(results);
      setTotalPages(info.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setCharacters([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Вызывается Search на mount и при пользовательском поиске.
  // Всегда сбрасывает страницу на 1 — URL обновляется как side effect,
  // fetch вызывается явно с page=1 (не читаем URL — избегаем двойного фетча).
  const handleSearch = useCallback((term: string) => {
    termRef.current = term;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', '1');
        return next;
      },
      { replace: true }
    );
    fetchData(term, 1);
  }, [fetchData, setSearchParams]);

  const handlePageChange = useCallback((newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    fetchData(termRef.current, newPage);
  }, [fetchData, setSearchParams]);

  return (
    <div className="main-page">
      <Search onSearch={handleSearch} />
      <div className="main-page__results">
        {isLoading && <Spinner />}
        {!isLoading && error && <ErrorMessage message={error} />}
        {!isLoading && !error && (
          <>
            <CardList characters={characters} />
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
      <div className="main-page__error-trigger">
        <ThrowErrorButton />
      </div>
    </div>
  );
}

export default MainPage;
