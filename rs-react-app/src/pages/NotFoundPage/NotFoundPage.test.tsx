import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

const renderNotFound = (initialPath = '/not-found') => {
  const router = createMemoryRouter(
    [
      { path: '/', element: <div data-testid="home-page">Home</div> },
      { path: '/not-found', element: <NotFoundPage /> },
    ],
    { initialEntries: [initialPath] }
  );
  return render(<RouterProvider router={router} />);
};

describe('NotFoundPage', () => {
  it('renders 404 code', () => {
    renderNotFound();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders error message', () => {
    renderNotFound();
    expect(
      screen.getByText(/page you are looking for does not exist/i)
    ).toBeInTheDocument();
  });

  it('renders a link to home page', () => {
    renderNotFound();
    expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();
  });

  it('navigates to home when "Back to Home" is clicked', async () => {
    const user = userEvent.setup();
    renderNotFound();

    await user.click(screen.getByRole('link', { name: /back to home/i }));

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
