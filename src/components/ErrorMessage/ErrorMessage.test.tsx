import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders with role="alert"', () => {
    render(<ErrorMessage message="Network error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the static title "Something went wrong"', () => {
    render(<ErrorMessage message="Network error" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders the message prop', () => {
    render(<ErrorMessage message="Server responded with 500" />);
    expect(screen.getByText('Server responded with 500')).toBeInTheDocument();
  });

  it('renders different messages for different props', () => {
    const { rerender } = render(<ErrorMessage message="First error" />);
    expect(screen.getByText('First error')).toBeInTheDocument();

    rerender(<ErrorMessage message="Second error" />);
    expect(screen.getByText('Second error')).toBeInTheDocument();
    expect(screen.queryByText('First error')).not.toBeInTheDocument();
  });
});
