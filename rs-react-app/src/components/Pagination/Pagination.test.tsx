import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
  describe('rendering', () => {
    it('renders current page and total pages', () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
      expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    });

    it('renders prev and next buttons', () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });

    it('renders as a nav element', () => {
      render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('disabled states', () => {
    it('disables prev button on first page', () => {
      render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
      expect(screen.getByLabelText('Previous page')).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);
      expect(screen.getByLabelText('Next page')).toBeDisabled();
    });

    it('enables prev button when not on first page', () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
      expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
    });

    it('enables next button when not on last page', () => {
      render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
      expect(screen.getByLabelText('Next page')).not.toBeDisabled();
    });

    it('disables both buttons when there is only one page', () => {
      render(<Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />);
      expect(screen.getByLabelText('Previous page')).toBeDisabled();
      expect(screen.getByLabelText('Next page')).toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('calls onPageChange with page - 1 when prev is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

      await user.click(screen.getByLabelText('Previous page'));

      expect(onPageChange).toHaveBeenCalledWith(2);
      expect(onPageChange).toHaveBeenCalledTimes(1);
    });

    it('calls onPageChange with page + 1 when next is clicked', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

      await user.click(screen.getByLabelText('Next page'));

      expect(onPageChange).toHaveBeenCalledWith(4);
      expect(onPageChange).toHaveBeenCalledTimes(1);
    });

    it('does not call onPageChange when prev is clicked on first page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

      await user.click(screen.getByLabelText('Previous page'));

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('does not call onPageChange when next is clicked on last page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />);

      await user.click(screen.getByLabelText('Next page'));

      expect(onPageChange).not.toHaveBeenCalled();
    });
  });
});
