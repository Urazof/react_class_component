import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchCharacters } from './api/rickmorty';
import type { Character } from './api/rickmorty';
import App from './App';

vi.mock('./api/rickmorty', () => ({
  fetchCharacters: vi.fn(),
}));

const mockFetch = vi.mocked(fetchCharacters);

const mockCharacter: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)', url: '' },
  location: { name: 'Citadel of Ricks', url: '' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
};

const mortyCharacter: Character = {
  ...mockCharacter,
  id: 2,
  name: 'Morty Smith',
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default: every test gets a resolved empty array so rendering doesn't hang
    mockFetch.mockResolvedValue([]);
  });

  describe('initial load', () => {
    it('calls fetchCharacters on mount', async () => {
      render(<App />);
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(''));
    });

    it('shows spinner while API request is pending', () => {
      mockFetch.mockReturnValueOnce(new Promise(() => {})); // never resolves
      render(<App />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('hides spinner after load completes', async () => {
      render(<App />);
      await waitFor(() =>
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      );
    });

    it('renders characters after successful API response', async () => {
      mockFetch.mockResolvedValueOnce([mockCharacter]);
      render(<App />);
      await screen.findByText('Rick Sanchez');
    });

    it('shows empty state when API returns no characters', async () => {
      mockFetch.mockResolvedValueOnce([]);
      render(<App />);
      await screen.findByText('No characters found. Try a different search term.');
    });

    it('uses saved search term from localStorage for initial load', async () => {
      localStorage.setItem('rm_search_term', 'Rick');
      mockFetch.mockResolvedValueOnce([mockCharacter]);
      render(<App />);
      await screen.findByText('Rick Sanchez');
      expect(mockFetch).toHaveBeenCalledWith('Rick');
    });

    it('renders multiple characters', async () => {
      mockFetch.mockResolvedValueOnce([mockCharacter, mortyCharacter]);
      render(<App />);
      await screen.findByText('Rick Sanchez');
      expect(screen.getByText('Morty Smith')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('shows error alert when API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      render(<App />);
      await screen.findByRole('alert');
    });

    it('shows the error message text', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Server responded with 500'));
      render(<App />);
      await screen.findByText('Server responded with 500');
    });

    it('hides spinner after API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      render(<App />);
      await screen.findByRole('alert');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('does not render character list after API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      render(<App />);
      await screen.findByRole('alert');
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('shows fallback message when rejection value is not an Error instance', async () => {
      mockFetch.mockRejectedValueOnce('unexpected string rejection');
      render(<App />);
      await screen.findByRole('alert');
      // Non-Error rejection → message = 'Something went wrong'
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Something went wrong');
    });
  });

  describe('search interaction', () => {
    it('calls fetchCharacters with the typed search term', async () => {
      const user = userEvent.setup();
      render(<App />);
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockResolvedValueOnce([mockCharacter]);
      await user.type(screen.getByRole('textbox'), 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(mockFetch).toHaveBeenLastCalledWith('Rick');
    });

    it('renders new results after search', async () => {
      const user = userEvent.setup();
      render(<App />);
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockResolvedValueOnce([mockCharacter]);
      await user.type(screen.getByRole('textbox'), 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await screen.findByText('Rick Sanchez');
    });

    it('shows spinner while search request is in progress', async () => {
      const user = userEvent.setup();
      render(<App />);
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockReturnValueOnce(new Promise(() => {}));
      await user.type(screen.getByRole('textbox'), 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('clears previous error when a new search starts', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      render(<App />);
      await screen.findByRole('alert');

      mockFetch.mockResolvedValueOnce([mockCharacter]);
      await user.type(screen.getByRole('textbox'), 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await screen.findByText('Rick Sanchez');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('calls fetchCharacters when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(<App />);
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockResolvedValueOnce([mortyCharacter]);
      await user.type(screen.getByRole('textbox'), 'Morty');
      await user.keyboard('{Enter}');

      await screen.findByText('Morty Smith');
      expect(mockFetch).toHaveBeenLastCalledWith('Morty');
    });
  });

  describe('layout', () => {
    // Each test awaits the initial async load to drain pending state updates
    // and prevent act() warnings from Search.componentDidMount → handleSearch

    it('renders the app header title', async () => {
      render(<App />);
      await screen.findByText('No characters found. Try a different search term.');
      expect(screen.getByText('Rick & Morty Explorer')).toBeInTheDocument();
    });

    it('renders the search input', async () => {
      render(<App />);
      await screen.findByText('No characters found. Try a different search term.');
      expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
    });

    it('renders ThrowErrorButton', async () => {
      render(<App />);
      await screen.findByText('No characters found. Try a different search term.');
      expect(
        screen.getByRole('button', { name: /throw error/i })
      ).toBeInTheDocument();
    });
  });
});
