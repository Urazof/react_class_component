import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearSelected, selectSelectedCount } from '../../store/selectionSlice';
import './Flyout.css';

function Flyout() {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectSelectedCount);

  if (count === 0) return null;

  return (
    <div className="flyout" data-testid="flyout">
      <span className="flyout__count">
        {count} item{count !== 1 ? 's' : ''} selected
      </span>
      <div className="flyout__actions">
        <button
          className="flyout__clear"
          onClick={() => dispatch(clearSelected())}
        >
          Unselect all
        </button>
      </div>
    </div>
  );
}

export default Flyout;
