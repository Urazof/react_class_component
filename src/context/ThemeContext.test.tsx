import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

const renderWithTheme = () =>
  render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

describe('ThemeProvider', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('provides "light" as the initial theme', () => {
    renderWithTheme();
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });

  it('sets data-theme="light" on documentElement initially', () => {
    renderWithTheme();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('toggles theme from light to dark', async () => {
    const user = userEvent.setup();
    renderWithTheme();

    await user.click(screen.getByRole('button', { name: /toggle/i }));

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('sets data-theme="dark" on documentElement after toggle', async () => {
    const user = userEvent.setup();
    renderWithTheme();

    await user.click(screen.getByRole('button', { name: /toggle/i }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('toggles back to light after two clicks', async () => {
    const user = userEvent.setup();
    renderWithTheme();

    await user.click(screen.getByRole('button', { name: /toggle/i }));
    await user.click(screen.getByRole('button', { name: /toggle/i }));

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });
});

describe('useTheme', () => {
  it('throws when used outside ThemeProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within ThemeProvider'
    );
    consoleSpy.mockRestore();
  });
});
