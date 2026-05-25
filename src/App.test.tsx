import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { fetchCharacters } from './api/rickmorty';
import type { Character, ApiInfo } from './api/rickmorty';
import App from './App';

vi.mock('./api/rickmorty', () => ({
  fetchCharacters: vi.fn(),
}));

const mockFetch = vi.mocked(fetchCharacters);

const emptyInfo: ApiInfo = { count: 0, pages: 0, next: null, prev: null };
const singlePageInfo: ApiInfo = { count: 1, pages: 1, next: null, prev: null };

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

const renderApp = () =>
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockResolvedValue({ results: [], info: emptyInfo });
  });

  describe('initial load', () => {
    it('calls fetchCharacters on mount', async () => {
      renderApp();
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('', 1));
    });

    it('shows spinner while API request is pending', () => {
      mockFetch.mockReturnValueOnce(new Promise(() => {}));
      renderApp();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('hides spinner after load completes', async () => {
      renderApp();
      await waitFor(() =>
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      );
    });

    it('renders characters after successful API response', async () => {
      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: singlePageInfo });
      renderApp();
      await screen.findByText('Rick Sanchez');
    });

    it('shows empty state when API returns no characters', async () => {
      mockFetch.mockResolvedValueOnce({ results: [], info: emptyInfo });
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');
    });

    it('uses saved search term from localStorage for initial load', async () => {
      localStorage.setItem('rm_search_term', 'Rick');
      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: singlePageInfo });
      renderApp();
      await screen.findByText('Rick Sanchez');
      expect(mockFetch).toHaveBeenCalledWith('Rick', 1);
    });

    it('renders multiple characters', async () => {
      mockFetch.mockResolvedValueOnce({ results: [mockCharacter, mortyCharacter], info: singlePageInfo });
      renderApp();
      await screen.findByText('Rick Sanchez');
      expect(screen.getByText('Morty Smith')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('shows error alert when API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      renderApp();
      await screen.findByRole('alert');
    });

    it('shows the error message text', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Server responded with 500'));
      renderApp();
      await screen.findByText('Server responded with 500');
    });

    it('hides spinner after API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      renderApp();
      await screen.findByRole('alert');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('does not render character list after API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      renderApp();
      await screen.findByRole('alert');
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('shows fallback message when rejection value is not an Error instance', async () => {
      mockFetch.mockRejectedValueOnce('unexpected string rejection');
      renderApp();
      await screen.findByRole('alert');
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Something went wrong');
    });
  });

  describe('search interaction', () => {
    it('calls fetchCharacters with the typed search term', async () => {
      const user = userEvent.setup();
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: singlePageInfo });
      await user.type(screen.getByRole('textbox'), 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(mockFetch).toHaveBeenLastCalledWith('Rick', 1);
    });

    it('renders new results after search', async () => {
      const user = userEvent.setup();
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: singlePageInfo });
      await user.type(screen.getByRole('textbox'), 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await screen.findByText('Rick Sanchez');
    });

    it('shows spinner while search request is in progress', async () => {
      const user = userEvent.setup();
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockReturnValueOnce(new Promise(() => {}));
      await user.type(screen.getByRole('textbox'), 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('clears previous error when a new search starts', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      renderApp();
      await screen.findByRole('alert');

      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: singlePageInfo });
      await user.type(screen.getByRole('textbox'), 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await screen.findByText('Rick Sanchez');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('calls fetchCharacters when Enter key is pressed', async () => {
      const user = userEvent.setup();
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockResolvedValueOnce({ results: [mortyCharacter], info: singlePageInfo });
      await user.type(screen.getByRole('textbox'), 'Morty');
      await user.keyboard('{Enter}');

      await screen.findByText('Morty Smith');
      expect(mockFetch).toHaveBeenLastCalledWith('Morty', 1);
    });
  });

  describe('layout', () => {
    it('renders the app header title', async () => {
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');
      expect(screen.getByText('Rick & Morty Explorer')).toBeInTheDocument();
    });

    it('renders the search input', async () => {
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');
      expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument();
    });

    it('renders ThrowErrorButton', async () => {
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');
      expect(
        screen.getByRole('button', { name: /throw error/i })
      ).toBeInTheDocument();
    });
  });
});
