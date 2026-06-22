'use client';

import { useState } from 'react';
import './ThrowErrorButton.css';

function ThrowErrorButton() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error triggered manually');
  }

  return (
    <button
      className="throw-error-button"
      type="button"
      onClick={() => setShouldThrow(true)}
    >
      Throw Error
    </button>
  );
}

export default ThrowErrorButton;
