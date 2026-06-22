'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { searchAction } from '../../actions/search';
import '../../../components/Search/Search.css';

const STORAGE_KEY = 'rm_search_term';

interface SearchProps {
  defaultValue?: string;
  locale: string;
}

function Search({ defaultValue = '', locale }: SearchProps) {
  const t = useTranslations('search');
  const [inputValue, setInputValue] = useState(defaultValue);
  const prevDefaultRef = useRef(defaultValue);

  // Sync input when URL param changes (browser back/forward, locale switch)
  useEffect(() => {
    if (prevDefaultRef.current !== defaultValue) {
      setInputValue(defaultValue);
      prevDefaultRef.current = defaultValue;
    }
  }, [defaultValue]);

  // Save committed search term to localStorage so it persists across sessions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, defaultValue);
  }, [defaultValue]);

  return (
    <form className="search" action={searchAction}>
      <input type="hidden" name="locale" value={locale} />
      <input
        className="search__input"
        type="text"
        name="q"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={t('placeholder')}
        aria-label={t('placeholder')}
      />
      <button className="search__button" type="submit">
        {t('button')}
      </button>
    </form>
  );
}

export default Search;
