import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearSelected, selectSelectedCount, selectSelectedList } from '../../store/selectionSlice';
import { downloadCsv } from '../../utils/downloadCsv';
import './Flyout.css';

function Flyout() {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectSelectedCount);
  const selectedList = useAppSelector(selectSelectedList);

  if (count === 0) return null;

  return (
    <div className="flyout" data-testid="flyout">
      <span className="flyout__count">
        {count} item{count !== 1 ? 's' : ''} selected
      </span>
      <div className="flyout__actions">
        <button
          className="flyout__download"
          onClick={() => downloadCsv(selectedList)}
        >
          Download CSV
        </button>
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
