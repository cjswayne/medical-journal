import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEntries } from '../hooks/useEntries';
import EntryCard from '../components/EntryCard';
import SkeletonCard from '../components/SkeletonCard';
import SearchBar from '../components/SearchBar';
import styles from '../styles/HomePage.module.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const {
    entries,
    page,
    pages,
    error,
    fetchEntries,
    searchEntries,
  } = useEntries();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const goPrev = () => {
    if (page > 1) fetchEntries(page - 1);
  };

  const goNext = () => {
    if (page < pages) fetchEntries(page + 1);
  };

  const showSkeleton = entries === null;
  const showEmpty = Array.isArray(entries) && entries.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {error ? (
          <p className={styles.errorBanner} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.toolbar}>
          <div className={styles.toolbarSearch}>
            <SearchBar onSearch={searchEntries} placeholder="Search entries" />
          </div>
        </div>

        <div className={styles.grid}>
          {showSkeleton
            ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={`sk-${i}`} />)
            : null}
          {!showSkeleton && showEmpty ? (
            <p className={styles.empty}>No entries found</p>
          ) : null}
          {!showSkeleton && !showEmpty && entries
            ? entries.map((entry) => (
                <EntryCard key={entry._id} entry={entry} />
              ))
            : null}
        </div>

        {pages > 1 ? (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              type="button"
              onClick={goPrev}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {page} of {pages}
            </span>
            <button
              className={styles.pageBtn}
              type="button"
              onClick={goNext}
              disabled={page >= pages}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {isAuthenticated && (
        <Link className={styles.fab} to="/entry/new" aria-label="Add Entry">
          +
        </Link>
      )}
    </div>
  );
};

export default HomePage;
