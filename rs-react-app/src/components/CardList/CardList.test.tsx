import { render, screen } from '@testing-library/react';
import CardList from './CardList';
import type { Character } from '../../api/rickmorty';

const makeCharacter = (id: number, name: string): Character => ({
  id,
  name,
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth', url: '' },
  location: { name: 'Earth', url: '' },
  image: `https://example.com/${id}.jpeg`,
});

describe('CardList', () => {
  describe('empty state', () => {
    it('shows "no characters found" message when array is empty', () => {
      render(<CardList characters={[]} />);
      expect(
        screen.getByText('No characters found. Try a different search term.')
      ).toBeInTheDocument();
    });

    it('does not render a list element when characters array is empty', () => {
      render(<CardList characters={[]} />);
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('with characters', () => {
    it('renders a list when characters are provided', () => {
      render(<CardList characters={[makeCharacter(1, 'Rick Sanchez')]} />);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('renders the correct number of list items', () => {
      const characters = [
        makeCharacter(1, 'Rick Sanchez'),
        makeCharacter(2, 'Morty Smith'),
        makeCharacter(3, 'Beth Smith'),
      ];
      render(<CardList characters={characters} />);
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('renders character names', () => {
      const characters = [
        makeCharacter(1, 'Rick Sanchez'),
        makeCharacter(2, 'Morty Smith'),
      ];
      render(<CardList characters={characters} />);
      expect(screen.getByText('Rick Sanchez')).toBeInTheDocument();
      expect(screen.getByText('Morty Smith')).toBeInTheDocument();
    });

    it('does not show empty state message when characters are present', () => {
      render(<CardList characters={[makeCharacter(1, 'Rick')]} />);
      expect(
        screen.queryByText('No characters found. Try a different search term.')
      ).not.toBeInTheDocument();
    });
  });
});
