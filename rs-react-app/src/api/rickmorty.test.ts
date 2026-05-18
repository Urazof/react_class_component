import { fetchCharacters, fetchCharacterById, ApiError } from './rickmorty';
import type { Character, ApiInfo } from './rickmorty';

const createMockResponse = (status: number, body?: unknown): Response =>
  ({
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(body),
  }) as unknown as Response;

const mockInfo: ApiInfo = { count: 1, pages: 1, next: null, prev: null };

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
        createMockResponse(200, { info: mockInfo, results: [] })
      );

      await fetchCharacters('');

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('/character');
      expect(calledUrl).not.toContain('name=');
    });

    it('calls the API without name param when searchTerm is only whitespace', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: mockInfo, results: [] })
      );

      await fetchCharacters('   ');

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('name=');
    });

    it('includes name param when searchTerm is provided', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: mockInfo, results: [] })
      );

      await fetchCharacters('Rick');

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('name=Rick');
    });

    it('trims whitespace from searchTerm before building URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: mockInfo, results: [] })
      );

      await fetchCharacters('  Rick  ');

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('name=Rick');
      expect(calledUrl).not.toContain('name=+Rick');
    });

    it('includes page=1 by default', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: mockInfo, results: [] })
      );

      await fetchCharacters('');

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=1');
    });

    it('includes the provided page number in URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: mockInfo, results: [] })
      );

      await fetchCharacters('Rick', 3);

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=3');
    });
  });

  describe('successful responses', () => {
    it('returns results array on 200', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: mockInfo, results: [mockCharacter] })
      );

      const { results } = await fetchCharacters('Rick');

      expect(results).toEqual([mockCharacter]);
    });

    it('returns info object on 200', async () => {
      const info: ApiInfo = { count: 20, pages: 2, next: 'url', prev: null };
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info, results: [mockCharacter] })
      );

      const result = await fetchCharacters('Rick');

      expect(result.info).toEqual(info);
    });

    it('returns empty results array when results list is empty', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: mockInfo, results: [] })
      );

      const { results } = await fetchCharacters('nonexistent');

      expect(results).toEqual([]);
    });

    it('returns multiple characters', async () => {
      const chars = [mockCharacter, { ...mockCharacter, id: 2, name: 'Morty Smith' }];
      vi.mocked(fetch).mockResolvedValueOnce(
        createMockResponse(200, { info: mockInfo, results: chars })
      );

      const { results } = await fetchCharacters('');

      expect(results).toHaveLength(2);
      expect(results[1].name).toBe('Morty Smith');
    });
  });

  describe('404 response', () => {
    it('returns empty results on 404 (no match found)', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(404));

      const { results } = await fetchCharacters('zzz_no_match');

      expect(results).toEqual([]);
    });

    it('returns zero pages in info on 404', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(404));

      const { info } = await fetchCharacters('zzz_no_match');

      expect(info.pages).toBe(0);
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

      await expect(fetchCharacters('')).rejects.toMatchObject({ statusCode: 500 });
    });

    it('throws ApiError with correct statusCode on 401', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(401));

      await expect(fetchCharacters('')).rejects.toMatchObject({ statusCode: 401 });
    });

    it('throws ApiError with descriptive message', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(503));

      await expect(fetchCharacters('')).rejects.toThrow('Server responded with 503');
    });
  });
});

describe('fetchCharacterById', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls the correct URL with the given id', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      createMockResponse(200, mockCharacter)
    );

    await fetchCharacterById(1);

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/character/1');
  });

  it('returns the character on 200', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      createMockResponse(200, mockCharacter)
    );

    const result = await fetchCharacterById(1);

    expect(result).toEqual(mockCharacter);
  });

  it('throws ApiError on 404 (character not found)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(404));

    await expect(fetchCharacterById(9999)).rejects.toThrow(ApiError);
  });

  it('throws ApiError with statusCode 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(404));

    await expect(fetchCharacterById(9999)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws ApiError on 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(500));

    await expect(fetchCharacterById(1)).rejects.toThrow(ApiError);
  });

  it('throws ApiError with correct statusCode on 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(createMockResponse(500));

    await expect(fetchCharacterById(1)).rejects.toMatchObject({ statusCode: 500 });
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
