import type { Character } from '../api/rickmorty';

export async function fetchCharacter(id: number): Promise<Character | null> {
  try {
    const res = await fetch(`https://rickandmortyapi.com/api/character/${id}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    return res.json() as Promise<Character>;
  } catch {
    return null;
  }
}
