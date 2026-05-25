import { render, screen } from '@testing-library/react';
import AboutPage from './AboutPage';

describe('AboutPage', () => {
  it('renders the page heading', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
  });

  it('renders the author name', () => {
    render(<AboutPage />);
    expect(screen.getByText('Sergeyu')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<AboutPage />);
    expect(
      screen.getByText(/Rick & Morty character explorer/i)
    ).toBeInTheDocument();
  });

  it('renders a link to RS School React course', () => {
    render(<AboutPage />);
    const link = screen.getByRole('link', { name: /RS School React Course/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
  });

  it('RS School link opens in a new tab', () => {
    render(<AboutPage />);
    const link = screen.getByRole('link', { name: /RS School React Course/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
