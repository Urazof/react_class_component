import type { Character, CharactersResult } from '../api/rickmorty';

const BASE_URL = 'https://rickandmortyapi.com/api/character';

export interface FetchCharactersResult {
  characters: Character[];
  totalPages: number;
  error?: string;
}

export async function fetchCharacters(
  searchTerm: string,
  page: number
): Promise<FetchCharactersResult> {
  const params = new URLSearchParams({ page: String(page) });
  if (searchTerm) params.set('name', searchTerm);

  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (res.status === 404) {
      return { characters: [], totalPages: 0 };
    }

    if (!res.ok) {
      return { characters: [], totalPages: 0, error: `API error: ${res.status}` };
    }

    const data: CharactersResult = await res.json();
    return { characters: data.results, totalPages: data.info.pages };
  } catch {
    return { characters: [], totalPages: 0, error: 'Network error' };
  }
}
