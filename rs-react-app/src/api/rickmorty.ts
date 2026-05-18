const BASE_URL = 'https://rickandmortyapi.com/api';

export interface Character {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
}

export interface ApiInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

interface ApiResponse {
  info: ApiInfo;
  results: Character[];
}

export interface CharactersResult {
  results: Character[];
  info: ApiInfo;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const EMPTY_INFO: ApiInfo = { count: 0, pages: 0, next: null, prev: null };

export async function fetchCharacters(
  searchTerm: string,
  page: number = 1
): Promise<CharactersResult> {
  const url = new URL(`${BASE_URL}/character`);
  const trimmed = searchTerm.trim();

  if (trimmed) {
    url.searchParams.set('name', trimmed);
  }
  url.searchParams.set('page', String(page));

  const response = await fetch(url.toString());

  // API returns 404 when no characters match — treat as empty list, not an error
  if (response.status === 404) {
    return { results: [], info: EMPTY_INFO };
  }

  if (!response.ok) {
    throw new ApiError(
      `Server responded with ${response.status}`,
      response.status
    );
  }

  const data = (await response.json()) as ApiResponse;
  return { results: data.results, info: data.info };
}

export async function fetchCharacterById(id: number): Promise<Character> {
  const response = await fetch(`${BASE_URL}/character/${id}`);

  if (!response.ok) {
    throw new ApiError(
      `Server responded with ${response.status}`,
      response.status
    );
  }

  return (await response.json()) as Character;
}
