import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';

// Statically broken child (always throws when shouldThrow=true)
function BrokenChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error from child');
  }
  return <div>Child is working</div>;
}

// Helper: reads an external flag on every render.
// Setting the flag BEFORE clicking "Try again" ensures the child
// doesn't throw again when ErrorBoundary resets and re-renders it.
function makeDynamicChild() {
  const state = { shouldThrow: true };
  function DynamicChild({ id }: { id?: number }) {
    if (state.shouldThrow) throw new Error('Controlled error');
    // Render different text when id is provided — used to force re-render in tests
    return <div>{id !== undefined ? `Child ${id} is working` : 'Child is working'}</div>;
  }
  return { state, DynamicChild };
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('normal rendering (no error)', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <BrokenChild shouldThrow={false} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Child is working')).toBeInTheDocument();
    });

    it('does not show fallback UI when no error', () => {
      render(
        <ErrorBoundary>
          <BrokenChild shouldThrow={false} />
        </ErrorBoundary>
      );
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('error catching', () => {
    it('shows fallback title when child throws', () => {
      render(
        <ErrorBoundary>
          <BrokenChild shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows the error message from the thrown error', () => {
      render(
        <ErrorBoundary>
          <BrokenChild shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Test error from child')).toBeInTheDocument();
    });

    it('renders "Try again" button in fallback UI', () => {
      render(
        <ErrorBoundary>
          <BrokenChild shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument();
    });

    it('hides children when error occurs', () => {
      render(
        <ErrorBoundary>
          <BrokenChild shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.queryByText('Child is working')).not.toBeInTheDocument();
    });

    it('calls console.error via componentDidCatch', () => {
      render(
        <ErrorBoundary>
          <BrokenChild shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('"Try again" reset', () => {
    it('shows children again after clicking "Try again"', async () => {
      const user = userEvent.setup();
      const { state, DynamicChild } = makeDynamicChild();

      render(
        <ErrorBoundary>
          <DynamicChild />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Stop child from throwing BEFORE the boundary resets and re-renders it
      state.shouldThrow = false;
      await user.click(screen.getByRole('button', { name: /try again/i }));

      expect(screen.getByText('Child is working')).toBeInTheDocument();
    });

    it('hides fallback UI after clicking "Try again"', async () => {
      const user = userEvent.setup();
      const { state, DynamicChild } = makeDynamicChild();

      render(
        <ErrorBoundary>
          <DynamicChild />
        </ErrorBoundary>
      );

      state.shouldThrow = false;
      await user.click(screen.getByRole('button', { name: /try again/i }));

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('can catch a new error after reset', async () => {
      const user = userEvent.setup();
      const { state, DynamicChild } = makeDynamicChild();

      const { rerender } = render(
        <ErrorBoundary>
          <DynamicChild id={1} />
        </ErrorBoundary>
      );

      // Reset
      state.shouldThrow = false;
      await user.click(screen.getByRole('button', { name: /try again/i }));
      expect(screen.getByText('Child 1 is working')).toBeInTheDocument();

      // Trigger a new error by changing props (forces re-render) with throw enabled
      state.shouldThrow = true;
      rerender(
        <ErrorBoundary>
          <DynamicChild id={2} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
