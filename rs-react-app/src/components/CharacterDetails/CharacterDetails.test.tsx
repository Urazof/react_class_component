import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { fetchCharacterById } from '../../api/rickmorty';
import type { Character } from '../../api/rickmorty';
import CharacterDetails from './CharacterDetails';

vi.mock('../../api/rickmorty', () => ({
  fetchCharacterById: vi.fn(),
}));

const mockFetch = vi.mocked(fetchCharacterById);

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

// Рендерит CharacterDetails в маршрутном контексте /details/:id
const renderDetails = (id = '1', search = '?page=1') => {
  const router = createMemoryRouter(
    [
      { path: '/', element: <div data-testid="home-page">Home</div> },
      { path: '/details/:id', element: <CharacterDetails /> },
    ],
    { initialEntries: [`/details/${id}${search}`] }
  );
  return render(<RouterProvider router={router} />);
};

describe('CharacterDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(mockCharacter);
  });

  describe('loading state', () => {
    it('shows spinner while loading', () => {
      mockFetch.mockReturnValueOnce(new Promise(() => {}));
      renderDetails();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('hides spinner after load completes', async () => {
      renderDetails();
      await waitFor(() =>
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      );
    });
  });

  describe('successful load', () => {
    it('fetches character with the correct id from URL params', async () => {
      renderDetails('25');
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(25));
    });

    it('renders character name', async () => {
      renderDetails();
      await screen.findByText('Rick Sanchez');
    });

    it('renders character image with correct alt text', async () => {
      renderDetails();
      await screen.findByAltText('Rick Sanchez');
    });

    it('renders character status', async () => {
      renderDetails();
      await screen.findByText('Alive');
    });

    it('renders character species', async () => {
      renderDetails();
      await screen.findByText('Human');
    });

    it('renders character origin', async () => {
      renderDetails();
      await screen.findByText('Earth (C-137)');
    });

    it('does not render type row when type is empty', async () => {
      renderDetails();
      await screen.findByText('Rick Sanchez');
      expect(screen.queryByText('Type')).not.toBeInTheDocument();
    });

    it('renders type row when type is non-empty', async () => {
      mockFetch.mockResolvedValueOnce({ ...mockCharacter, type: 'Parasite' });
      renderDetails();
      await screen.findByText('Parasite');
    });
  });

  describe('error state', () => {
    it('shows error message when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Not Found'));
      renderDetails();
      await screen.findByRole('alert');
    });

    it('shows the error text', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Server responded with 404'));
      renderDetails();
      await screen.findByText('Server responded with 404');
    });

    it('hides spinner after error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('error'));
      renderDetails();
      await screen.findByRole('alert');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('shows fallback message when rejection is not an Error instance', async () => {
      mockFetch.mockRejectedValueOnce('string rejection');
      renderDetails();
      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Failed to load character');
    });
  });

  describe('close button', () => {
    it('renders close button', async () => {
      renderDetails();
      expect(screen.getByLabelText('Close details')).toBeInTheDocument();
    });

    it('navigates to home with page param when close is clicked', async () => {
      const user = userEvent.setup();
      renderDetails('1', '?page=3');
      // Ждём загрузки
      await screen.findByText('Rick Sanchez');

      await user.click(screen.getByLabelText('Close details'));

      // После закрытия должна рендериться домашняя страница
      await screen.findByTestId('home-page');
    });
  });

  describe('re-fetch on id change', () => {
    it('fetches with new id when navigating to a different character', async () => {
      // Используем router.navigate() — правильный способ сменить роут внутри одного роутера
      const router = createMemoryRouter(
        [
          { path: '/', element: <div data-testid="home-page">Home</div> },
          { path: '/details/:id', element: <CharacterDetails /> },
        ],
        { initialEntries: ['/details/1'] }
      );
      render(<RouterProvider router={router} />);
      await screen.findByText('Rick Sanchez');

      router.navigate('/details/2');

      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(2));
    });
  });
});
