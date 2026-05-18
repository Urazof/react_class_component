import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

describe('Header', () => {
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
});
