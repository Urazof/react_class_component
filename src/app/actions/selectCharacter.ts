'use server';

import { redirect } from 'next/navigation';

export async function selectCharacterAction(formData: FormData) {
  const id = formData.get('id')?.toString();
  const locale = formData.get('locale')?.toString() ?? 'en';
  const page = formData.get('page')?.toString() ?? '1';
  const q = formData.get('q')?.toString() ?? '';

  if (!id) return;

  const params = new URLSearchParams({ page });
  if (q) params.set('q', q);

  redirect(`/${locale}/details/${id}?${params.toString()}`);
}
