import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Character, CharactersResult } from '../../api/rickmorty';

const CACHE_TTL = Number(process.env.NEXT_PUBLIC_CACHE_TTL ?? '60');

const EMPTY_INFO = { count: 0, pages: 0, next: null, prev: null } as const;

interface GetCharactersArgs {
  searchTerm: string;
  page: number;
}

export const rickmortyApi = createApi({
  reducerPath: 'rickmortyApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://rickandmortyapi.com/api' }),
  tagTypes: ['Characters', 'Character'],
  keepUnusedDataFor: CACHE_TTL,
  endpoints: (builder) => ({
    getCharacters: builder.query<CharactersResult, GetCharactersArgs>({
      // queryFn is used here only to handle the Rick & Morty API quirk:
      // 404 means "no characters match" (empty result), not a real error.
      // The actual HTTP request goes through fetchBaseQuery via the 4th param.
      queryFn: async ({ searchTerm, page }, _api, _extra, fetchWithBQ) => {
        const params = new URLSearchParams({ page: String(page) });
        if (searchTerm.trim()) params.set('name', searchTerm.trim());
        const result = await fetchWithBQ(`/character?${params.toString()}`);
        if (result.error && (result.error as FetchBaseQueryError).status === 404) {
          return { data: { results: [], info: EMPTY_INFO } };
        }
        if (result.error) return { error: result.error as FetchBaseQueryError };
        return { data: result.data as CharactersResult };
      },
      providesTags: ['Characters'],
    }),

    getCharacterById: builder.query<Character, number>({
      query: (id) => `/character/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Character', id }],
    }),
  }),
});

export const { useGetCharactersQuery, useGetCharacterByIdQuery } = rickmortyApi;

export function getQueryErrorMessage(error: unknown): string {
  if (error == null) return 'Something went wrong';
  if (typeof error === 'object') {
    // fetchBaseQuery network/parse errors: { status: 'FETCH_ERROR' | 'PARSING_ERROR', error: string }
    // fetchBaseQuery calls String(e) internally, which adds "ErrorType: " prefix for Error instances.
    // Strip that prefix so the user sees a clean message.
    if ('error' in error && typeof (error as { error?: unknown }).error === 'string') {
      const raw = (error as { error: string }).error;
      const prefixMatch = raw.match(/^[A-Za-z]*Error:\s+(.+)$/s);
      return prefixMatch ? prefixMatch[1] : raw;
    }
    // fetchBaseQuery HTTP errors: { status: number, data: unknown }
    if ('status' in error && typeof (error as { status: unknown }).status === 'number') {
      const data = (error as unknown as { data: unknown }).data;
      if (
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        typeof (data as { error?: unknown }).error === 'string'
      ) {
        return (data as { error: string }).error;
      }
      return `Server responded with ${(error as { status: number }).status}`;
    }
    if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
  }
  return 'Something went wrong';
}
