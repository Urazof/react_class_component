import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils';
import Card from './Card';
import type { Character } from '../../api/rickmorty';

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

describe('Card', () => {
  describe('rendering', () => {
    it('renders character name', () => {
      renderWithProviders(<Card character={mockCharacter} />);
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    it('renders name as heading', () => {
      renderWithProviders(<Card character={mockCharacter} />);
      expect(screen.getByRole('heading', { name: 'Rick Sanchez' })).toBeInTheDocument();
    });

    it('renders description with species, status, and gender joined by " · "', () => {
      renderWithProviders(<Card character={mockCharacter} />);
      expect(screen.getByText('Human · Alive · Male')).toBeInTheDocument();
    });

    it('renders origin name', () => {
      renderWithProviders(<Card character={mockCharacter} />);
      expect(screen.getByText('Earth (C-137)')).toBeInTheDocument();
    });

    it('renders character image with correct alt text', () => {
      renderWithProviders(<Card character={mockCharacter} />);
      const img = screen.getByAltText('Rick Sanchez');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', mockCharacter.image);
    });
  });

  describe('description filtering', () => {
    it('omits empty type field from description', () => {
      renderWithProviders(<Card character={{ ...mockCharacter, type: '' }} />);
      expect(screen.getByText('Human · Alive · Male')).toBeInTheDocument();
    });

    it('renders description with "unknown" status', () => {
      renderWithProviders(<Card character={{ ...mockCharacter, status: 'unknown' }} />);
      expect(screen.getByText('Human · unknown · Male')).toBeInTheDocument();
    });

    it('renders description for Dead character', () => {
      renderWithProviders(<Card character={{ ...mockCharacter, status: 'Dead' }} />);
      expect(screen.getByText('Human · Dead · Male')).toBeInTheDocument();
    });
  });

  describe('click interaction', () => {
    it('calls onClick with character id when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithProviders(<Card character={mockCharacter} onClick={onClick} />);

      await user.click(screen.getByRole('article'));

      expect(onClick).toHaveBeenCalledWith(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onClick is not provided', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Card character={mockCharacter} />);
      await expect(user.click(screen.getByRole('article'))).resolves.not.toThrow();
    });

    it('adds card--clickable class when onClick is provided', () => {
      renderWithProviders(<Card character={mockCharacter} onClick={vi.fn()} />);
      expect(screen.getByRole('article')).toHaveClass('card--clickable');
    });

    it('does not add card--clickable class when onClick is not provided', () => {
      renderWithProviders(<Card character={mockCharacter} />);
      expect(screen.getByRole('article')).not.toHaveClass('card--clickable');
    });
  });

  describe('checkbox', () => {
    it('renders a checkbox', () => {
      renderWithProviders(<Card character={mockCharacter} />);
      expect(screen.getByRole('checkbox', { name: /select rick sanchez/i })).toBeInTheDocument();
    });

    it('checkbox is unchecked by default', () => {
      renderWithProviders(<Card character={mockCharacter} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('checkbox becomes checked after click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Card character={mockCharacter} />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('clicking checkbox does not call card onClick handler', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithProviders(<Card character={mockCharacter} onClick={onClick} />);

      await user.click(screen.getByRole('checkbox'));

      expect(onClick).not.toHaveBeenCalled();
    });

    it('adds card--selected class when checkbox is checked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Card character={mockCharacter} />);

      await user.click(screen.getByRole('checkbox'));

      expect(screen.getByRole('article')).toHaveClass('card--selected');
    });

    it('removes card--selected class after unchecking', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Card character={mockCharacter} />);
      const checkbox = screen.getByRole('checkbox');

      await user.click(checkbox);
      await user.click(checkbox);

      expect(screen.getByRole('article')).not.toHaveClass('card--selected');
    });
  });
});
