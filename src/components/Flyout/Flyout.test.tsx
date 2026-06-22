import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils';
import Flyout from './Flyout';
import type { Character } from '../../api/rickmorty';

vi.mock('../../app/actions/generateCsv', () => ({
  generateCsvAction: vi.fn().mockResolvedValue('id,name\n1,Rick Sanchez'),
}));

import { generateCsvAction } from '../../app/actions/generateCsv';
const mockGenerateCsv = vi.mocked(generateCsvAction);

// URL.createObjectURL is not in jsdom
URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
URL.revokeObjectURL = vi.fn();

const rick: Character = {
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

const morty: Character = { ...rick, id: 2, name: 'Morty Smith' };

describe('Flyout', () => {
  describe('visibility', () => {
    it('is not rendered when no items are selected', () => {
      renderWithProviders(<Flyout />);
      expect(screen.queryByTestId('flyout')).not.toBeInTheDocument();
    });

    it('renders when at least one item is selected', () => {
      renderWithProviders(<Flyout />, {
        preloadedState: { selection: { selectedItems: { 1: rick } } },
      });
      expect(screen.getByTestId('flyout')).toBeInTheDocument();
    });
  });

  describe('count display', () => {
    it('shows singular "item" for one selected', () => {
      renderWithProviders(<Flyout />, {
        preloadedState: { selection: { selectedItems: { 1: rick } } },
      });
      expect(screen.getByText('1 item selected')).toBeInTheDocument();
    });

    it('shows plural "items" for multiple selected', () => {
      renderWithProviders(<Flyout />, {
        preloadedState: { selection: { selectedItems: { 1: rick, 2: morty } } },
      });
      expect(screen.getByText('2 items selected')).toBeInTheDocument();
    });
  });

  describe('Download CSV', () => {
    it('renders "Download CSV" button', () => {
      renderWithProviders(<Flyout />, {
        preloadedState: { selection: { selectedItems: { 1: rick } } },
      });
      expect(screen.getByRole('button', { name: /download csv/i })).toBeInTheDocument();
    });

    it('calls generateCsvAction with the selected items list', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Flyout />, {
        preloadedState: { selection: { selectedItems: { 1: rick } } },
      });

      await user.click(screen.getByRole('button', { name: /download csv/i }));

      expect(mockGenerateCsv).toHaveBeenCalledWith([rick]);
    });

    it('triggers file download after generateCsvAction resolves', async () => {
      const user = userEvent.setup();
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      renderWithProviders(<Flyout />, {
        preloadedState: { selection: { selectedItems: { 1: rick } } },
      });

      await user.click(screen.getByRole('button', { name: /download csv/i }));

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

      clickSpy.mockRestore();
    });
  });

  describe('Unselect all', () => {
    it('renders "Unselect all" button', () => {
      renderWithProviders(<Flyout />, {
        preloadedState: { selection: { selectedItems: { 1: rick } } },
      });
      expect(screen.getByRole('button', { name: /unselect all/i })).toBeInTheDocument();
    });

    it('hides flyout after clicking "Unselect all"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Flyout />, {
        preloadedState: { selection: { selectedItems: { 1: rick } } },
      });

      await user.click(screen.getByRole('button', { name: /unselect all/i }));

      expect(screen.queryByTestId('flyout')).not.toBeInTheDocument();
    });

    it('clears count after "Unselect all"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Flyout />, {
        preloadedState: { selection: { selectedItems: { 1: rick, 2: morty } } },
      });

      await user.click(screen.getByRole('button', { name: /unselect all/i }));

      expect(screen.queryByText(/items? selected/i)).not.toBeInTheDocument();
    });
  });
});
