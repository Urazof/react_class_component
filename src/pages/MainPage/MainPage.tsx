import { useState, useCallback } from 'react';
import { useSearchParams, useNavigate, useOutlet } from 'react-router-dom';
import { useGetCharactersQuery, getQueryErrorMessage, rickmortyApi } from '../../store/api/rickmortyApi';
import { useAppDispatch } from '../../store/hooks';
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
  const dispatch = useAppDispatch();
  const outlet = useOutlet();
  const isDetailsOpen = outlet !== null;

  const page = Number(searchParams.get('page') ?? '1');
  // Initialize from localStorage so RTK Query fires the correct query on mount
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('rm_search_term') ?? '');

  const { data, isLoading, isFetching, isError, error } = useGetCharactersQuery({ searchTerm, page });

  const characters = data?.results ?? [];
  const totalPages = data?.info.pages ?? 0;

  const handleSearch = useCallback(
    (term: string) => {
      // Skip update when the term hasn't changed (e.g. Search fires onSearch on mount)
      if (term === searchTerm) return;
      setSearchTerm(term);
      // Only reset page in URL when we're not already on page 1
      if (page !== 1) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set('page', '1');
            return next;
          },
          { replace: true }
        );
      }
    },
    [searchTerm, page, setSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(newPage));
        return next;
      });
    },
    [setSearchParams]
  );

  const handleCardClick = useCallback(
    (id: number) => {
      navigate(`details/${id}?${searchParams.toString()}`);
    },
    [navigate, searchParams]
  );

  const handleContentClick = useCallback(() => {
    if (isDetailsOpen) {
      const search = searchParams.toString();
      navigate({ pathname: '/', search: search ? `?${search}` : '' });
    }
  }, [isDetailsOpen, navigate, searchParams]);

  const handleRefresh = useCallback(() => {
    dispatch(rickmortyApi.util.invalidateTags(['Characters', 'Character']));
  }, [dispatch]);

  return (
    <div className="main-page">
      <Search onSearch={handleSearch} />
      <div className="main-page__body" onClick={handleContentClick}>
        <div className="main-page__list" data-testid="main-page-list">
          {(isLoading || isFetching) && <Spinner />}
          {!isLoading && !isFetching && isError && (
            <ErrorMessage message={getQueryErrorMessage(error)} />
          )}
          {!isLoading && !isFetching && !isError && (
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
          <div
            className="main-page__details"
            onClick={(e) => e.stopPropagation()}
          >
            {outlet}
          </div>
        )}
      </div>
      <div className="main-page__footer">
        <button
          type="button"
          className="main-page__refresh"
          onClick={handleRefresh}
          aria-label="Refresh data"
        >
          Refresh
        </button>
        <div className="main-page__error-trigger">
          <ThrowErrorButton />
        </div>
      </div>
    </div>
  );
}

export default MainPage;
