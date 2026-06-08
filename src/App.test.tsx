import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { Character, ApiInfo } from './api/rickmorty';
import { renderWithProviders } from './test-utils';
import App from './App';

// Mock the global fetch used by RTK Query's fetchBaseQuery.
// fetchBaseQuery passes a Request object to fetch(), so we check request.url.
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const makeResponse = (data: unknown, status = 200): Response => {
  const ok = status >= 200 && status < 300;
  const body = JSON.stringify(data);
  const mock = {
    ok,
    status,
    headers: { get: () => 'application/json' } as unknown as Headers,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(body),
    clone: () => mock,
  } as unknown as Response;
  return mock;
};

const lastUrl = () => (mockFetch.mock.lastCall?.[0] as Request).url;
const nthUrl = (n: number) => (mockFetch.mock.calls[n]?.[0] as Request).url;

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
  renderWithProviders(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockResolvedValue(makeResponse({ results: [], info: emptyInfo }));
  });

  describe('initial load', () => {
    it('calls fetch on mount with correct URL', async () => {
      renderApp();
      await waitFor(() =>
        expect(nthUrl(0)).toBe('https://rickandmortyapi.com/api/character?page=1')
      );
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
      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter], info: singlePageInfo }));
      renderApp();
      await screen.findByText('Rick Sanchez');
    });

    it('shows empty state when API returns no characters', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ results: [], info: emptyInfo }));
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');
    });

    it('shows empty state when API returns 404 (no characters match search)', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ error: 'Nothing found' }, 404));
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');
    });

    it('uses saved search term from localStorage for initial load', async () => {
      localStorage.setItem('rm_search_term', 'Rick');
      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter], info: singlePageInfo }));
      renderApp();
      await screen.findByText('Rick Sanchez');
      expect(nthUrl(0)).toBe('https://rickandmortyapi.com/api/character?page=1&name=Rick');
    });

    it('renders multiple characters', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter, mortyCharacter], info: singlePageInfo }));
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

    it('shows the rejection value when fetch rejects with a non-Error', async () => {
      mockFetch.mockRejectedValueOnce('unexpected string rejection');
      renderApp();
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('unexpected string rejection');
    });

    it('shows error body message when API returns HTTP 500 with error field', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ error: 'Internal Server Error' }, 500));
      renderApp();
      await screen.findByText('Internal Server Error');
    });

    it('shows "Server responded with N" when HTTP error has no error body', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse('service unavailable', 503));
      renderApp();
      await screen.findByText('Server responded with 503');
    });
  });

  describe('search interaction', () => {
    it('calls fetch with the typed search term', async () => {
      const user = userEvent.setup();
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter], info: singlePageInfo }));
      await user.type(screen.getByRole('textbox'), 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() =>
        expect(lastUrl()).toBe('https://rickandmortyapi.com/api/character?page=1&name=Rick')
      );
    });

    it('renders new results after search', async () => {
      const user = userEvent.setup();
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter], info: singlePageInfo }));
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

      await waitFor(() => {
        expect(lastUrl()).toBe('https://rickandmortyapi.com/api/character?page=1&name=Rick');
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });

    it('clears previous error when a new search starts', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      renderApp();
      await screen.findByRole('alert');

      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter], info: singlePageInfo }));
      await user.type(screen.getByRole('textbox'), 'Rick');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await screen.findByText('Rick Sanchez');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('calls fetch when Enter key is pressed', async () => {
      const user = userEvent.setup();
      renderApp();
      await screen.findByText('No characters found. Try a different search term.');

      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mortyCharacter], info: singlePageInfo }));
      await user.type(screen.getByRole('textbox'), 'Morty');
      await user.keyboard('{Enter}');

      await screen.findByText('Morty Smith');
      await waitFor(() =>
        expect(lastUrl()).toBe('https://rickandmortyapi.com/api/character?page=1&name=Morty')
      );
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
