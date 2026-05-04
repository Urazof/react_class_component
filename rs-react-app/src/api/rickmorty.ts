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

interface ApiInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

interface ApiResponse {
  info: ApiInfo;
  results: Character[];
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

export async function fetchCharacters(searchTerm: string): Promise<Character[]> {
  const url = new URL(`${BASE_URL}/character`);
  const trimmed = searchTerm.trim();

  if (trimmed) {
    url.searchParams.set('name', trimmed);
  }

  const response = await fetch(url.toString());

  // API returns 404 when no characters match — treat as empty list, not an error
  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new ApiError(
      `Server responded with ${response.status}`,
      response.status
    );
  }

  const data = (await response.json()) as ApiResponse;
  return data.results;
}
