import { useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, useOutlet } from 'react-router-dom';
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
  const navigate = useNavigate();
  // useOutlet: null когда нет активного вложенного роута, ReactElement когда details/:id активен
  const outlet = useOutlet();
  const isDetailsOpen = outlet !== null;

  const page = Number(searchParams.get('page') ?? '1');

  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
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

  // Клик по карточке: открыть детали, сохранить текущую страницу в URL
  const handleCardClick = useCallback((id: number) => {
    navigate(`details/${id}?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  // Клик по левой части (вне карточки): закрыть детали если открыты
  const handleContentClick = useCallback(() => {
    if (isDetailsOpen) {
      const search = searchParams.toString();
      navigate({ pathname: '/', search: search ? `?${search}` : '' });
    }
  }, [isDetailsOpen, navigate, searchParams]);

  return (
    <div className="main-page">
      <Search onSearch={handleSearch} />
      <div className="main-page__body" onClick={handleContentClick}>
        <div className="main-page__list">
          {isLoading && <Spinner />}
          {!isLoading && error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <>
              <CardList characters={characters} onCardClick={handleCardClick} />
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
        {isDetailsOpen && (
          // stopPropagation: клик внутри деталей не всплывает до handleContentClick
          <div
            className="main-page__details"
            onClick={(e) => e.stopPropagation()}
          >
            {outlet}
          </div>
        )}
      </div>
      <div className="main-page__error-trigger">
        <ThrowErrorButton />
      </div>
    </div>
  );
}

export default MainPage;
