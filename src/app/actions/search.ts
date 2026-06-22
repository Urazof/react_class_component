'use server';

import { redirect } from 'next/navigation';

export async function searchAction(formData: FormData) {
  const q = formData.get('q')?.toString().trim() ?? '';
  const locale = formData.get('locale')?.toString() ?? 'en';

  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('page', '1');

  redirect(`/${locale}?${params.toString()}`);
}
