import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { fetchCharacters } from '../../api/rickmorty';
import type { Character, ApiInfo } from '../../api/rickmorty';
import MainPage from './MainPage';

vi.mock('../../api/rickmorty', () => ({
  fetchCharacters: vi.fn(),
}));

const mockFetch = vi.mocked(fetchCharacters);

const emptyInfo: ApiInfo = { count: 0, pages: 0, next: null, prev: null };
const singlePageInfo: ApiInfo = { count: 1, pages: 1, next: null, prev: null };
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

// Nested routes matching App.tsx structure
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

const renderMainPage = (initialPath = '/') => {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  return { ...render(<RouterProvider router={router} />), router };
};

describe('MainPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockResolvedValue({ results: [], info: emptyInfo });
  });

  describe('handlePageChange', () => {
    it('calls fetchCharacters with the next page number when next button is clicked', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: multiPageInfo });
      renderMainPage();

      // Waiting for the pagination nav to appear (totalPages > 1)
      await screen.findByRole('navigation', { name: 'Pagination' });

      mockFetch.mockResolvedValueOnce({ results: [], info: emptyInfo });
      await user.click(screen.getByRole('button', { name: /next page/i }));

      await waitFor(() =>
        expect(mockFetch).toHaveBeenLastCalledWith('', 2)
      );
    });

    it('calls fetchCharacters with the previous page number when prev button is clicked', async () => {
      const user = userEvent.setup();
      // Start on page 2 so prev is enabled
      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: multiPageInfo });
      renderMainPage('/?page=2');

      await screen.findByRole('navigation', { name: 'Pagination' });

      mockFetch.mockResolvedValueOnce({ results: [], info: emptyInfo });
      await user.click(screen.getByRole('button', { name: /previous page/i }));

      await waitFor(() =>
        expect(mockFetch).toHaveBeenLastCalledWith('', 1)
      );
    });
  });

  describe('handleCardClick', () => {
    it('navigates to character details route when a card is clicked', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: singlePageInfo });
      renderMainPage('/?page=1');

      await screen.findByText('Rick Sanchez');

      await user.click(screen.getByRole('article'));

      // Details route becomes active — outlet renders the dummy panel
      await screen.findByTestId('details-panel');
    });

    it('preserves the current page query param when navigating to details', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: multiPageInfo });
      renderMainPage('/?page=2');

      await screen.findByText('Rick Sanchez');
      await user.click(screen.getByRole('article'));

      await screen.findByTestId('details-panel');
      // URL should contain ?page=2 after card click — details panel is visible
      expect(screen.getByTestId('details-panel')).toBeInTheDocument();
    });
  });

  describe('handleContentClick', () => {
    it('closes the details panel when clicking the list area', async () => {
      const user = userEvent.setup();
      renderMainPage('/details/1?page=1');

      // Details panel is open on initial render
      expect(screen.getByTestId('details-panel')).toBeInTheDocument();

      // Click on the list area (empty state text is inside main-page__list)
      await user.click(
        screen.getByText('No characters found. Try a different search term.')
      );

      await waitFor(() =>
        expect(screen.queryByTestId('details-panel')).not.toBeInTheDocument()
      );
    });

    it('does nothing when details panel is not open', async () => {
      renderMainPage('/?page=1');
      await screen.findByText('No characters found. Try a different search term.');

      // Details panel is closed — handleContentClick guard fires but does nothing
      expect(screen.queryByTestId('details-panel')).not.toBeInTheDocument();
    });
  });

  describe('stopPropagation on details panel', () => {
    it('keeps the details panel open when clicking inside it', async () => {
      const user = userEvent.setup();
      renderMainPage('/details/1?page=1');

      expect(screen.getByTestId('details-panel')).toBeInTheDocument();

      // Click inside the details panel — stopPropagation prevents handleContentClick
      await user.click(screen.getByTestId('details-panel'));

      // Should still be visible
      expect(screen.getByTestId('details-panel')).toBeInTheDocument();
    });
  });
});
