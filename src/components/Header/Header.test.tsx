import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext';
import Header from './Header';

const renderHeader = () =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    </MemoryRouter>
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
