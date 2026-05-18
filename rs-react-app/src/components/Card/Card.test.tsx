import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      render(<Card character={mockCharacter} />);
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
    });

    it('renders name as heading', () => {
      render(<Card character={mockCharacter} />);
      expect(screen.getByRole('heading', { name: 'Rick Sanchez' })).toBeInTheDocument();
    });

    it('renders description with species, status, and gender joined by " · "', () => {
      render(<Card character={mockCharacter} />);
      expect(screen.getByText('Human · Alive · Male')).toBeInTheDocument();
    });

    it('renders origin name', () => {
      render(<Card character={mockCharacter} />);
      expect(screen.getByText('Earth (C-137)')).toBeInTheDocument();
    });

    it('renders character image with correct alt text', () => {
      render(<Card character={mockCharacter} />);
      const img = screen.getByAltText('Rick Sanchez');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', mockCharacter.image);
    });
  });

  describe('description filtering', () => {
    it('omits empty type field from description', () => {
      render(<Card character={{ ...mockCharacter, type: '' }} />);
      // description = ['Human', 'Alive', '', 'Male'].filter(Boolean).join(' · ')
      // type is NOT part of description — only species, status, gender
      expect(screen.getByText('Human · Alive · Male')).toBeInTheDocument();
    });

    it('renders description with "unknown" status', () => {
      render(<Card character={{ ...mockCharacter, status: 'unknown' }} />);
      expect(screen.getByText('Human · unknown · Male')).toBeInTheDocument();
    });

    it('renders description for Dead character', () => {
      render(<Card character={{ ...mockCharacter, status: 'Dead' }} />);
      expect(screen.getByText('Human · Dead · Male')).toBeInTheDocument();
    });
  });

  describe('click interaction', () => {
    it('calls onClick with character id when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Card character={mockCharacter} onClick={onClick} />);

      await user.click(screen.getByRole('article'));

      expect(onClick).toHaveBeenCalledWith(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onClick is not provided', async () => {
      const user = userEvent.setup();
      render(<Card character={mockCharacter} />);
      await expect(user.click(screen.getByRole('article'))).resolves.not.toThrow();
    });

    it('adds card--clickable class when onClick is provided', () => {
      render(<Card character={mockCharacter} onClick={vi.fn()} />);
      expect(screen.getByRole('article')).toHaveClass('card--clickable');
    });

    it('does not add card--clickable class when onClick is not provided', () => {
      render(<Card character={mockCharacter} />);
      expect(screen.getByRole('article')).not.toHaveClass('card--clickable');
    });
  });
});
