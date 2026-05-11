import { fetchCharacters, ApiError } from './rickmorty';
import type { Character } from './rickmorty';

// Helper: создаёт мок Response с нужным статусом и телом
const createMockResponse = (status: number, body?: unknown): Response =>
  ({
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(body),
  }) as unknown as Response;

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

describe('fetchCharacters', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('URL construction', () => {
    it('calls the API without name param when searchTerm is empty', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: {}, results: [] })
      );

      await fetchCharacters('');

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('/character');
      expect(calledUrl).not.toContain('name=');
    });

    it('calls the API without name param when searchTerm is only whitespace', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: {}, results: [] })
      );

      await fetchCharacters('   ');

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('name=');
    });

    it('includes name param when searchTerm is provided', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: {}, results: [] })
      );

      await fetchCharacters('Rick');

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('name=Rick');
    });

    it('trims whitespace from searchTerm before building URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: {}, results: [] })
      );

      await fetchCharacters('  Rick  ');

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('name=Rick');
      expect(calledUrl).not.toContain('name=+Rick');
    });
  });

  describe('successful responses', () => {
    it('returns character array from data.results on 200', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: {}, results: [mockCharacter] })
      );

      const result = await fetchCharacters('Rick');

      expect(result).toEqual([mockCharacter]);
    });

    it('returns empty array when results list is empty', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: {}, results: [] })
      );

      const result = await fetchCharacters('nonexistent');

      expect(result).toEqual([]);
    });

    it('returns multiple characters', async () => {
      const chars = [mockCharacter, { ...mockCharacter, id: 2, name: 'Morty Smith' }];
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: {}, results: chars })
      );

      const result = await fetchCharacters('');

      expect(result).toHaveLength(2);
      expect(result[1].name).toBe('Morty Smith');
    });
  });

  describe('404 response', () => {
    it('returns empty array on 404 (no match found)', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(404));

      const result = await fetchCharacters('zzz_no_match');

      expect(result).toEqual([]);
    });

    it('does not throw on 404', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(404));

      await expect(fetchCharacters('zzz')).resolves.not.toThrow();
    });
  });

  describe('error responses', () => {
    it('throws ApiError on 500', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(500));

      await expect(fetchCharacters('')).rejects.toThrow(ApiError);
    });

    it('throws ApiError with correct statusCode on 500', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(500));

      await expect(fetchCharacters('')).rejects.toMatchObject({
        statusCode: 500,
      });
    });

    it('throws ApiError with correct statusCode on 401', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(401));

      await expect(fetchCharacters('')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('throws ApiError with descriptive message', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(503));

      await expect(fetchCharacters('')).rejects.toThrow(
        'Server responded with 503'
      );
    });
  });
});

describe('ApiError', () => {
  it('is an instance of Error', () => {
    const err = new ApiError('test', 500);
    expect(err).toBeInstanceOf(Error);
  });

  it('has name "ApiError"', () => {
    const err = new ApiError('test', 500);
    expect(err.name).toBe('ApiError');
  });

  it('stores statusCode', () => {
    const err = new ApiError('test', 404);
    expect(err.statusCode).toBe(404);
  });

  it('stores message', () => {
    const err = new ApiError('Something went wrong', 500);
    expect(err.message).toBe('Something went wrong');
  });
});
