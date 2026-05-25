import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { buildCsvContent, downloadCsv } from './downloadCsv';
import type { Character } from '../api/rickmorty';

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

describe('buildCsvContent', () => {
  it('includes correct headers as the first line', () => {
    const [header] = buildCsvContent([rick]).split('\n');
    expect(header).toBe('id,name,status,species,gender,origin,location,image,url');
  });

  it('serializes a character to a correct CSV row', () => {
    const [, row] = buildCsvContent([rick]).split('\n');
    expect(row).toBe(
      '1,Rick Sanchez,Alive,Human,Male,Earth (C-137),Citadel of Ricks,' +
        'https://rickandmortyapi.com/api/character/avatar/1.jpeg,' +
        'https://rickandmortyapi.com/api/character/1'
    );
  });

  it('generates header + one row per character', () => {
    const lines = buildCsvContent([rick, morty]).split('\n');
    expect(lines).toHaveLength(3);
  });

  it('returns only headers for empty array', () => {
    expect(buildCsvContent([])).toBe('id,name,status,species,gender,origin,location,image,url');
  });

  it('escapes values that contain commas', () => {
    const csv = buildCsvContent([{ ...rick, name: 'Smith, Rick' }]);
    expect(csv).toContain('"Smith, Rick"');
  });

  it('escapes double-quotes inside values', () => {
    const csv = buildCsvContent([{ ...rick, name: 'Rick "Genius" Sanchez' }]);
    expect(csv).toContain('"Rick ""Genius"" Sanchez"');
  });

  it('includes image URL in each row', () => {
    const csv = buildCsvContent([rick]);
    expect(csv).toContain('https://rickandmortyapi.com/api/character/avatar/1.jpeg');
  });

  it('includes API details URL in each row', () => {
    const csv = buildCsvContent([rick]);
    expect(csv).toContain('https://rickandmortyapi.com/api/character/1');
  });

  it('uses origin.name and location.name, not origin.url/location.url', () => {
    const csv = buildCsvContent([rick]);
    expect(csv).toContain('Earth (C-137)');
    expect(csv).toContain('Citadel of Ricks');
  });
});

describe('downloadCsv', () => {
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  let appendSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;
  let clickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    appendSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node) => node);
    removeSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation((node) => node);
    clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    appendSpy.mockRestore();
    removeSpy.mockRestore();
    clickSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('sets filename to "{count}_items.csv"', () => {
    downloadCsv([rick, morty]);
    const link = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(link.download).toBe('2_items.csv');
  });

  it('uses count in filename for single item', () => {
    downloadCsv([rick]);
    const link = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(link.download).toBe('1_items.csv');
  });

  it('clicks the link to trigger browser download', () => {
    downloadCsv([rick]);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('revokes the object URL after download', () => {
    downloadCsv([rick]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('sets the link href to the created object URL', () => {
    downloadCsv([rick]);
    const link = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(link.href).toBe('blob:mock-url');
  });
});
