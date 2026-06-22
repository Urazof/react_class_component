import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '../../context/ThemeContext';
import Header from './Header';
import enMessages from '../../../messages/en.json';

// Mock next-intl navigation so Header's Link/useRouter/usePathname work in jsdom
vi.mock('../../i18n/navigation', () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}));

const renderHeader = () =>
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    </NextIntlClientProvider>
  );

describe('Header', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders the app title', () => {
    renderHeader();
    expect(screen.getByText('Rick & Morty Explorer')).toBeInTheDocument();
  });

  it('renders an h1 heading', () => {
    renderHeader();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
  });

  it('Home link points to /', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
  });

  it('About link points to /about', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
  });

  describe('theme toggle', () => {
    it('renders the theme toggle button', () => {
      renderHeader();
      expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument();
    });

    it('button label switches to "switch to light theme" after click', async () => {
      const user = userEvent.setup();
      renderHeader();

      await user.click(screen.getByRole('button', { name: /switch to dark theme/i }));

      expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument();
    });

    it('button text shows "Dark" in light mode', () => {
      renderHeader();
      expect(screen.getByRole('button', { name: /switch to dark theme/i })).toHaveTextContent('Dark');
    });

    it('button text shows "Light" in dark mode', async () => {
      const user = userEvent.setup();
      renderHeader();

      await user.click(screen.getByRole('button', { name: /switch to dark theme/i }));

      expect(screen.getByRole('button', { name: /switch to light theme/i })).toHaveTextContent('Light');
    });
  });
});
