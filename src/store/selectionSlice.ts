import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Character } from '../api/rickmorty';

interface SelectionState {
  // Record<id, Character> — O(1) lookup + хранит полные данные персонажа для CSV
  selectedItems: Record<number, Character>;
}

const initialState: SelectionState = {
  selectedItems: {},
};

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    toggleSelected: (state, action: PayloadAction<Character>) => {
      const character = action.payload;
      // Immer позволяет писать мутирующий код — под капотом создаётся новый объект
      if (state.selectedItems[character.id]) {
        delete state.selectedItems[character.id];
      } else {
        state.selectedItems[character.id] = character;
      }
    },
    clearSelected: (state) => {
      state.selectedItems = {};
    },
  },
});

export const { toggleSelected, clearSelected } = selectionSlice.actions;

// Локальный тип вместо импорта RootState из store.ts — избегает циклической зависимости.
// TypeScript проверяет структурную совместимость: RootState ⊇ { selection: SelectionState }
type SliceRootState = { selection: SelectionState };

export const selectSelectedItems = (state: SliceRootState) =>
  state.selection.selectedItems;

export const selectIsSelected = (id: number) => (state: SliceRootState) =>
  id in state.selection.selectedItems;

export const selectSelectedCount = (state: SliceRootState) =>
  Object.keys(state.selection.selectedItems).length;

export const selectSelectedList = (state: SliceRootState) =>
  Object.values(state.selection.selectedItems);
