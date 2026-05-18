import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header />);
    expect(screen.getByText('Rick & Morty Explorer')).toBeInTheDocument();
  });

  it('renders an h1 heading', () => {
    render(<Header />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
