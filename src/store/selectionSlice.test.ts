import { describe, it, expect } from 'vitest';
import {
  selectionSlice,
  toggleSelected,
  clearSelected,
  selectSelectedItems,
  selectIsSelected,
  selectSelectedCount,
  selectSelectedList,
} from './selectionSlice';
import type { Character } from '../api/rickmorty';

const reducer = selectionSlice.reducer;

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

const morty: Character = {
  id: 2,
  name: 'Morty Smith',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)', url: '' },
  location: { name: 'Earth (Replacement Dimension)', url: '' },
  image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
};

// Хелпер — строит минимальный RootState-совместимый объект для селекторов
const makeState = (items: Record<number, Character> = {}) => ({
  selection: { selectedItems: items },
});

describe('selectionSlice — reducer', () => {
  describe('initial state', () => {
    it('starts with empty selectedItems', () => {
      const state = reducer(undefined, { type: '@@init' });
      expect(state.selectedItems).toEqual({});
    });
  });

  describe('toggleSelected', () => {
    it('adds character when not selected', () => {
      const state = reducer(undefined, toggleSelected(rick));
      expect(state.selectedItems[1]).toEqual(rick);
    });

    it('removes character when already selected', () => {
      const after1 = reducer(undefined, toggleSelected(rick));
      const after2 = reducer(after1, toggleSelected(rick));
      expect(after2.selectedItems[1]).toBeUndefined();
    });

    it('can select multiple characters independently', () => {
      const after1 = reducer(undefined, toggleSelected(rick));
      const after2 = reducer(after1, toggleSelected(morty));
      expect(Object.keys(after2.selectedItems)).toHaveLength(2);
    });

    it('removing one does not affect others', () => {
      const s1 = reducer(undefined, toggleSelected(rick));
      const s2 = reducer(s1, toggleSelected(morty));
      const s3 = reducer(s2, toggleSelected(rick));
      expect(s3.selectedItems[1]).toBeUndefined();
      expect(s3.selectedItems[2]).toEqual(morty);
    });

    it('stores full character data, not just id', () => {
      const state = reducer(undefined, toggleSelected(rick));
      expect(state.selectedItems[1]).toMatchObject({ name: 'Rick Sanchez', species: 'Human' });
    });
  });

  describe('clearSelected', () => {
    it('removes all selected items', () => {
      const s1 = reducer(undefined, toggleSelected(rick));
      const s2 = reducer(s1, toggleSelected(morty));
      const s3 = reducer(s2, clearSelected());
      expect(s3.selectedItems).toEqual({});
    });

    it('is safe to call when already empty', () => {
      const state = reducer(undefined, clearSelected());
      expect(state.selectedItems).toEqual({});
    });
  });
});

describe('selectionSlice — selectors', () => {
  describe('selectSelectedItems', () => {
    it('returns the selectedItems record', () => {
      const state = makeState({ 1: rick });
      expect(selectSelectedItems(state)).toEqual({ 1: rick });
    });
  });

  describe('selectIsSelected', () => {
    it('returns false when character is not selected', () => {
      const state = makeState();
      expect(selectIsSelected(1)(state)).toBe(false);
    });

    it('returns true when character is selected', () => {
      const state = makeState({ 1: rick });
      expect(selectIsSelected(1)(state)).toBe(true);
    });
  });

  describe('selectSelectedCount', () => {
    it('returns 0 when empty', () => {
      expect(selectSelectedCount(makeState())).toBe(0);
    });

    it('returns correct count', () => {
      expect(selectSelectedCount(makeState({ 1: rick, 2: morty }))).toBe(2);
    });
  });

  describe('selectSelectedList', () => {
    it('returns empty array when nothing selected', () => {
      expect(selectSelectedList(makeState())).toEqual([]);
    });

    it('returns array of Character objects', () => {
      const list = selectSelectedList(makeState({ 1: rick, 2: morty }));
      expect(list).toHaveLength(2);
      expect(list).toEqual(expect.arrayContaining([rick, morty]));
    });
  });
});
