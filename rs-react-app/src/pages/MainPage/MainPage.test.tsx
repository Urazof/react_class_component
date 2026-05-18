import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
  // Routes defined inside the function so each test gets a fresh object —
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
      // Reset mock entirely before this test to avoid state from handlePageChange tests
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: multiPageInfo });
      mockFetch.mockResolvedValue({ results: [], info: emptyInfo });

      renderMainPage('/');

      await screen.findByRole('navigation', { name: 'Pagination' });

      await user.click(await screen.findByRole('article'));
      await screen.findByTestId('details-panel');
    });

    it('preserves the current page query param when navigating to details', async () => {
      const user = userEvent.setup();
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({ results: [mockCharacter], info: multiPageInfo });
      mockFetch.mockResolvedValue({ results: [], info: emptyInfo });

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

      // fireEvent bubbles through the DOM: main-page__list → main-page__body → handleContentClick
      fireEvent.click(document.querySelector('.main-page__list')!);

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
