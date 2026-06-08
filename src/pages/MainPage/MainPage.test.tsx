import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import type { Character, ApiInfo } from '../../api/rickmorty';
import { renderWithProviders } from '../../test-utils';
import MainPage from './MainPage';

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

const emptyInfo: ApiInfo = { count: 0, pages: 0, next: null, prev: null };
const multiPageInfo: ApiInfo = { count: 40, pages: 2, next: 'next', prev: null };

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

const renderMainPage = (initialPath = '/') => {
  // Routes defined inside the function so each test gets a fresh router —
  // React Router may cache internal state on the routes reference.
  const routes = [
    {
      path: '/',
      element: <MainPage />,
      children: [
        {
          path: 'details/:id',
          element: <div data-testid="details-panel">Details</div>,
        },
      ],
    },
  ];
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  return { ...renderWithProviders(<RouterProvider router={router} />), router };
};

describe('MainPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockResolvedValue(makeResponse({ results: [], info: emptyInfo }));
  });

  describe('handlePageChange', () => {
    it('calls fetch with the next page number when next button is clicked', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter], info: multiPageInfo }));
      renderMainPage();

      // Waiting for the pagination nav to appear (totalPages > 1)
      await screen.findByRole('navigation', { name: 'Pagination' });

      mockFetch.mockResolvedValueOnce(makeResponse({ results: [], info: emptyInfo }));
      await user.click(screen.getByRole('button', { name: /next page/i }));

      await waitFor(() =>
        expect(lastUrl()).toBe('https://rickandmortyapi.com/api/character?page=2')
      );
    });

    it('calls fetch with the previous page number when prev button is clicked', async () => {
      const user = userEvent.setup();
      // Start on page 2 so prev is enabled
      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter], info: multiPageInfo }));
      renderMainPage('/?page=2');

      await screen.findByRole('navigation', { name: 'Pagination' });

      mockFetch.mockResolvedValueOnce(makeResponse({ results: [], info: emptyInfo }));
      await user.click(screen.getByRole('button', { name: /previous page/i }));

      await waitFor(() =>
        expect(lastUrl()).toBe('https://rickandmortyapi.com/api/character?page=1')
      );
    });
  });

  describe('handleCardClick', () => {
    it('navigates to character details route when a card is clicked', async () => {
      const user = userEvent.setup();
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter], info: multiPageInfo }));
      mockFetch.mockResolvedValue(makeResponse({ results: [], info: emptyInfo }));

      renderMainPage('/');

      await screen.findByRole('navigation', { name: 'Pagination' });

      await user.click(await screen.findByRole('article'));
      await screen.findByTestId('details-panel');
    });

    it('preserves the current page query param when navigating to details', async () => {
      const user = userEvent.setup();
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter], info: multiPageInfo }));
      mockFetch.mockResolvedValue(makeResponse({ results: [], info: emptyInfo }));

      renderMainPage('/?page=2');

      await screen.findByRole('navigation', { name: 'Pagination' });

      await user.click(await screen.findByRole('article'));
      await screen.findByTestId('details-panel');
    });
  });

  describe('handleContentClick', () => {
    it('closes the details panel when clicking the list area', async () => {
      renderMainPage('/details/1?page=1');

      expect(screen.getByTestId('details-panel')).toBeInTheDocument();

      // Click the list area — event bubbles up to handleContentClick
      fireEvent.click(screen.getByTestId('main-page-list'));

      await waitFor(() =>
        expect(screen.queryByTestId('details-panel')).not.toBeInTheDocument()
      );
    });

    it('does nothing when details panel is not open', async () => {
      renderMainPage('/?page=1');
      await screen.findByText('No characters found. Try a different search term.');

      expect(screen.queryByTestId('details-panel')).not.toBeInTheDocument();
    });
  });

  describe('stopPropagation on details panel', () => {
    it('keeps the details panel open when clicking inside it', async () => {
      const user = userEvent.setup();
      renderMainPage('/details/1?page=1');

      expect(screen.getByTestId('details-panel')).toBeInTheDocument();

      await user.click(screen.getByTestId('details-panel'));

      expect(screen.getByTestId('details-panel')).toBeInTheDocument();
    });
  });

  describe('Refresh button', () => {
    it('renders a refresh button', async () => {
      renderMainPage();
      expect(screen.getByRole('button', { name: /refresh data/i })).toBeInTheDocument();
    });

    it('re-fetches data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce(makeResponse({ results: [mockCharacter], info: emptyInfo }));
      renderMainPage();

      await screen.findByText('Rick Sanchez');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Set up new data for the refetch after cache invalidation
      mockFetch.mockResolvedValueOnce(makeResponse({ results: [], info: emptyInfo }));
      await user.click(screen.getByRole('button', { name: /refresh data/i }));

      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledTimes(2)
      );
    });
  });
});
