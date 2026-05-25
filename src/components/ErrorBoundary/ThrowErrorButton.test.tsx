import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThrowErrorButton from './ThrowErrorButton';
import ErrorBoundary from './ErrorBoundary';

describe('ThrowErrorButton', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders "Throw Error" button initially', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorButton />
      </ErrorBoundary>
    );
    expect(
      screen.getByRole('button', { name: /throw error/i })
    ).toBeInTheDocument();
  });

  it('does not show error state before button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorButton />
      </ErrorBoundary>
    );
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('triggers ErrorBoundary fallback UI when clicked', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <ThrowErrorButton />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: /throw error/i }));

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows the thrown error message in ErrorBoundary fallback', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <ThrowErrorButton />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: /throw error/i }));

    expect(screen.getByText('Test error triggered manually')).toBeInTheDocument();
  });

  it('hides the throw button after the error is triggered', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <ThrowErrorButton />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: /throw error/i }));

    // ErrorBoundary takes over — the button itself is no longer rendered
    expect(
      screen.queryByRole('button', { name: /throw error/i })
    ).not.toBeInTheDocument();
  });

  it('shows "Try again" button after error is triggered', async () => {
    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <ThrowErrorButton />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: /throw error/i }));

    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();
  });
});
