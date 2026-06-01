import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { fetchCharacters, fetchCharacterById } from '../../api/rickmorty';
import type { Character, CharactersResult } from '../../api/rickmorty';

// Configurable TTL in seconds — set VITE_CACHE_TTL in .env to override
const CACHE_TTL = Number(import.meta.env.VITE_CACHE_TTL ?? '60');

interface GetCharactersArgs {
  searchTerm: string;
  page: number;
}

export const rickmortyApi = createApi({
  reducerPath: 'rickmortyApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Characters', 'Character'],
  keepUnusedDataFor: CACHE_TTL,
  endpoints: (builder) => ({
    getCharacters: builder.query<CharactersResult, GetCharactersArgs>({
      queryFn: async ({ searchTerm, page }) => {
        try {
          const data = await fetchCharacters(searchTerm, page);
          return { data };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Something went wrong';
          return { error: { status: 'CUSTOM_ERROR' as const, error: message } };
        }
      },
      providesTags: ['Characters'],
    }),

    getCharacterById: builder.query<Character, number>({
      queryFn: async (id) => {
        try {
          const data = await fetchCharacterById(id);
          return { data };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load character';
          return { error: { status: 'CUSTOM_ERROR' as const, error: message } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Character', id }],
    }),
  }),
});

export const { useGetCharactersQuery, useGetCharacterByIdQuery } = rickmortyApi;

export function getQueryErrorMessage(error: unknown): string {
  if (error == null) return 'Something went wrong';
  if (typeof error === 'object') {
    if ('error' in error && typeof (error as { error?: unknown }).error === 'string') {
      return (error as { error: string }).error;
    }
    if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
  }
  return 'Something went wrong';
}
