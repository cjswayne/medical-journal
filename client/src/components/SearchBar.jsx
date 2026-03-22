import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({ onSearch, placeholder = 'Search…' }) => {
  const [value, setValue] = useState('');
  const timeoutRef = useRef(null);

  const flushSearch = useCallback(
    (next) => {
      if (typeof onSearch === 'function') onSearch(next);
    },
    [onSearch]
  );

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => flushSearch(value), 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, flushSearch]);

  const clear = () => setValue('');

  return (
    <div className={styles.wrap}>
      <span className={styles.icon} aria-hidden>
        🔍
      </span>
      <input
        className={styles.input}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
      />
      {value ? (
        <button
          type="button"
          className={styles.clear}
          onClick={clear}
          aria-label="Clear search"
        >
          ×
        </button>
      ) : null}
    </div>
  );
};

export default SearchBar;
