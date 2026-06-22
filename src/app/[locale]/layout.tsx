import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import Providers from './providers';
import Header from '../../components/Header/Header';
import Flyout from '../../components/Flyout/Flyout';
import '../../index.css';
import '../../App.css';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="app">
              <header className="app__header">
                <Header />
              </header>
              <main className="app__main">{children}</main>
              <Flyout />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
