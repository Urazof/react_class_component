import type { Character } from '../api/rickmorty';

const API_CHARACTER_URL = 'https://rickandmortyapi.com/api/character';

const HEADERS = ['id', 'name', 'status', 'species', 'gender', 'origin', 'location', 'image', 'url'];

function escapeCsvValue(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsvContent(characters: Character[]): string {
  const rows = characters.map((c) =>
    [
      c.id,
      c.name,
      c.status,
      c.species,
      c.gender,
      c.origin.name,
      c.location.name,
      c.image,
      `${API_CHARACTER_URL}/${c.id}`,
    ]
      .map(escapeCsvValue)
      .join(',')
  );
  return [HEADERS.join(','), ...rows].join('\n');
}

export function downloadCsv(characters: Character[]): void {
  const content = buildCsvContent(characters);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${characters.length}_items.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
