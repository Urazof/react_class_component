'use client';

import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearSelected, selectSelectedCount, selectSelectedList } from '../../store/selectionSlice';
import { generateCsvAction } from '../../app/actions/generateCsv';
import './Flyout.css';

function Flyout() {
  const t = useTranslations('flyout');
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectSelectedCount);
  const selectedList = useAppSelector(selectSelectedList);

  const handleDownload = async () => {
    const csv = await generateCsvAction(selectedList);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedList.length}_items.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (count === 0) return null;

  return (
    <div className="flyout" data-testid="flyout">
      <span className="flyout__count">
        {t('selected', { count })}
      </span>
      <div className="flyout__actions">
        <button className="flyout__download" onClick={handleDownload}>
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
