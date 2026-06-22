'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '../../i18n/navigation';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

function Header() {
  const t = useTranslations('nav');
  const tTheme = useTranslations('theme');
  const tLang = useTranslations('language');
  const { theme, toggleTheme } = useTheme();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageSwitch = () => {
    const nextLocale = locale === 'en' ? 'ru' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="header">
      <h1 className="header__title">Rick &amp; Morty Explorer</h1>
      <nav className="header__nav">
        <Link className="header__nav-link" href="/">
          {t('home')}
        </Link>
        <Link className="header__nav-link" href="/about">
          {t('about')}
        </Link>
      </nav>
      <div className="header__controls">
        <button
          className="header__theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? tTheme('switchToDark') : tTheme('switchToLight')}
        </button>
        <button
          className="header__lang-switch"
          onClick={handleLanguageSwitch}
          aria-label={`Switch language to ${tLang('switch')}`}
        >
          {tLang('switch')}
        </button>
      </div>
    </header>
  );
}

export default Header;
