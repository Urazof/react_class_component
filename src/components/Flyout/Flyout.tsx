'use client';

import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearSelected, selectSelectedCount, selectSelectedList } from '../../store/selectionSlice';
import { downloadCsv } from '../../utils/downloadCsv';
import './Flyout.css';

function Flyout() {
  const t = useTranslations('flyout');
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectSelectedCount);
  const selectedList = useAppSelector(selectSelectedList);

  if (count === 0) return null;

  return (
    <div className="flyout" data-testid="flyout">
      <span className="flyout__count">
        {t('selected', { count })}
      </span>
      <div className="flyout__actions">
        <button
          className="flyout__download"
          onClick={() => downloadCsv(selectedList)}
        >
          {t('download')}
        </button>
        <button
          className="flyout__clear"
          onClick={() => dispatch(clearSelected())}
        >
          {t('unselectAll')}
        </button>
      </div>
    </div>
  );
}

export default Flyout;
