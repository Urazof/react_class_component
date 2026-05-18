import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import './Search.css';

interface SearchProps {
  onSearch: (term: string) => void;
}

const STORAGE_KEY = 'rm_search_term';

function Search({ onSearch }: SearchProps) {
  const [savedTerm, setSavedTerm] = useLocalStorage(STORAGE_KEY, '');
  const [inputValue, setInputValue] = useState(savedTerm);

  // useRef — не вызывает ре-рендер при обновлении, нужен только для дедупликации
  const lastSearchedRef = useRef(savedTerm);

  // Аналог componentDidMount: один вызов при монтировании.
  // onSearch захватывается замыканием на момент mount — это намеренно.
  // lastSearchedRef.current при mount === savedTerm (начальное значение из localStorage).
  useEffect(() => {
    onSearch(lastSearchedRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    if (trimmed === lastSearchedRef.current) return;

    setSavedTerm(trimmed);
    lastSearchedRef.current = trimmed;
    onSearch(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="search">
      <input
        className="search__input"
        type="text"
        value={inputValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search character..."
        aria-label="Search character"
      />
      <button className="search__button" type="button" onClick={handleSearch}>
        Search
      </button>
    </div>
  );
}

export default Search;
