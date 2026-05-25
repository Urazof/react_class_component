import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination__btn"
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        ←
      </button>
      <span className="pagination__info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="pagination__btn"
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}

export default Pagination;
