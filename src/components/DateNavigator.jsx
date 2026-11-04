import React, { useRef } from 'react';
import './DateNavigator.css';

/**
 * Standard DateNavigator Component with (< Today > | 📅 4 Nov 2026)
 * @param {string} value - YYYY-MM-DD
 * @param {function} onChange - callback with new YYYY-MM-DD string
 */
export default function DateNavigator({ value, onChange }) {
  const dateInputRef = useRef(null);

  // Parse YYYY-MM-DD
  const curDate = (() => {
    if (!value) return new Date();
    const parts = String(value).split('-');
    if (parts.length === 3) {
      const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  })();

  const pad = (n) => (n < 10 ? '0' + n : n);

  const formatYmd = (d) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const formatDisplay = (d) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handlePrevDay = () => {
    const prev = new Date(curDate);
    prev.setDate(prev.getDate() - 1);
    onChange(formatYmd(prev));
  };

  const handleNextDay = () => {
    const next = new Date(curDate);
    next.setDate(next.getDate() + 1);
    onChange(formatYmd(next));
  };

  const handleToday = () => {
    onChange(formatYmd(new Date()));
  };

  const handleDatePick = (e) => {
    if (e.target.value) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="date-nav-pill">
      <div className="date-nav-controls">
        <button
          type="button"
          className="date-nav-arrow"
          onClick={handlePrevDay}
          title="Previous Day"
        >
          &lt;
        </button>
        <button
          type="button"
          className="date-nav-today"
          onClick={handleToday}
          title="Go to Today"
        >
          Today
        </button>
        <button
          type="button"
          className="date-nav-arrow"
          onClick={handleNextDay}
          title="Next Day"
        >
          &gt;
        </button>
      </div>

      <div className="date-nav-divider" />

      <div
        className="date-nav-label-box"
        onClick={() => dateInputRef.current && (dateInputRef.current.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current.click())}
        title="Click to select date"
      >
        <svg
          className="date-nav-cal-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="date-nav-display-text">{formatDisplay(curDate)}</span>
        <input
          ref={dateInputRef}
          type="date"
          className="date-nav-hidden-input"
          value={formatYmd(curDate)}
          onChange={handleDatePick}
        />
      </div>
    </div>
  );
}

