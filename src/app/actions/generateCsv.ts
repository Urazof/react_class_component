'use server';

import type { Character } from '../../api/rickmorty';

const API_CHARACTER_URL = 'https://rickandmortyapi.com/api/character';
const HEADERS = ['id', 'name', 'status', 'species', 'gender', 'origin', 'location', 'image', 'url'];

function escapeCsvValue(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function generateCsvAction(characters: Character[]): Promise<string> {
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
