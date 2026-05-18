import { useState, useCallback } from 'react';
import { fetchCharacters } from '../../api/rickmorty';
import type { Character } from '../../api/rickmorty';
import Search from '../../components/Search/Search';
import CardList from '../../components/CardList/CardList';
import Spinner from '../../components/Spinner/Spinner';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import ThrowErrorButton from '../../components/ErrorBoundary/ThrowErrorButton';
import './MainPage.css';

function MainPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useCallback: стабильная ссылка — не пересоздаётся при каждом рендере.
  // Deps [] — функция зависит только от stable setters и импортированного fetchCharacters.
  const handleSearch = useCallback(async (term: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { results } = await fetchCharacters(term);
      setCharacters(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setCharacters([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="main-page">
      <Search onSearch={handleSearch} />
      <div className="main-page__results">
        {isLoading && <Spinner />}
        {!isLoading && error && <ErrorMessage message={error} />}
        {!isLoading && !error && <CardList characters={characters} />}
      </div>
      <div className="main-page__error-trigger">
        <ThrowErrorButton />
      </div>
    </div>
  );
}

export default MainPage;
