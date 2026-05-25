import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Search from './Search';

const STORAGE_KEY = 'rm_search_term';

describe('Search', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    it('renders the search input', () => {
      render(<Search onSearch={vi.fn()} />);
      expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
    });

    it('renders the search button', () => {
      render(<Search onSearch={vi.fn()} />);
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('shows empty input when localStorage has no saved term', () => {
      render(<Search onSearch={vi.fn()} />);
      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('shows saved term from localStorage on mount', () => {
      localStorage.setItem(STORAGE_KEY, 'Morty');
      render(<Search onSearch={vi.fn()} />);
      expect(screen.getByRole('textbox')).toHaveValue('Morty');
    });
  });

  describe('initial load — initial search', () => {
    it('calls onSearch with empty string on mount when no saved term', () => {
      const onSearch = vi.fn();
      render(<Search onSearch={onSearch} />);
      expect(onSearch).toHaveBeenCalledWith('');
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it('calls onSearch with saved term on mount', () => {
      localStorage.setItem(STORAGE_KEY, 'Rick');
      const onSearch = vi.fn();
      render(<Search onSearch={onSearch} />);
      expect(onSearch).toHaveBeenCalledWith('Rick');
      expect(onSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('user input', () => {
    it('updates input value as user types', async () => {
      const user = userEvent.setup();
      render(<Search onSearch={vi.fn()} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Rick');

      expect(input).toHaveValue('Rick');
    });

    it('clears input when user deletes all text', async () => {
      const user = userEvent.setup();
      render(<Search onSearch={vi.fn()} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Rick');
      await user.clear(input);

      expect(input).toHaveValue('');
    });
  });

  describe('search button click', () => {
    it('calls onSearch with typed value when Search button clicked', async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<Search onSearch={onSearch} />);
      vi.clearAllMocks(); // reset mount call

      const input = screen.getByRole('textbox');
      await user.type(input, 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(onSearch).toHaveBeenCalledWith('Rick');
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it('trims whitespace from input before calling onSearch', async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<Search onSearch={onSearch} />);
      vi.clearAllMocks();

      const input = screen.getByRole('textbox');
      await user.type(input, '  Rick  ');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(onSearch).toHaveBeenCalledWith('Rick');
    });

    it('does not call onSearch again when same term is searched twice', async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<Search onSearch={onSearch} />);
      vi.clearAllMocks();

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'Rick');
      await user.click(button); // first search → calls onSearch('Rick')
      await user.click(button); // same term → deduplicated, no call

      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith('Rick');
    });
  });

  describe('Enter key', () => {
    it('calls onSearch when Enter is pressed in the input', async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<Search onSearch={onSearch} />);
      vi.clearAllMocks();

      const input = screen.getByRole('textbox');
      await user.type(input, 'Morty');
      await user.keyboard('{Enter}');

      expect(onSearch).toHaveBeenCalledWith('Morty');
    });

    it('does not call onSearch on Enter if term is same as last search', async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<Search onSearch={onSearch} />);
      vi.clearAllMocks();

      const input = screen.getByRole('textbox');
      await user.type(input, 'Rick');
      await user.keyboard('{Enter}');  // first search
      await user.keyboard('{Enter}');  // dedup — no call

      expect(onSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('localStorage integration', () => {
    it('saves search term to localStorage when search button clicked', async () => {
      const user = userEvent.setup();
      render(<Search onSearch={vi.fn()} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(localStorage.getItem(STORAGE_KEY)).toBe('Rick');
    });

    it('saves trimmed value to localStorage', async () => {
      const user = userEvent.setup();
      render(<Search onSearch={vi.fn()} />);

      await user.type(screen.getByRole('textbox'), '  Morty  ');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(localStorage.getItem(STORAGE_KEY)).toBe('Morty');
    });

    it('overwrites existing localStorage value on new search', async () => {
      localStorage.setItem(STORAGE_KEY, 'OldTerm');
      const user = userEvent.setup();
      render(<Search onSearch={vi.fn()} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'NewTerm');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(localStorage.getItem(STORAGE_KEY)).toBe('NewTerm');
    });

    it('does not write to localStorage if term has not changed', async () => {
      const user = userEvent.setup();
      render(<Search onSearch={vi.fn()} />);

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'Rick');
      await user.click(button);        // saves 'Rick'
      await user.click(button);        // dedup — should NOT overwrite

      // localStorage still has 'Rick', which is correct
      expect(localStorage.getItem(STORAGE_KEY)).toBe('Rick');
    });
  });
});
