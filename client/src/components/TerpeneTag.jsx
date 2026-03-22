import { TERPENE_STRUCTURES } from '../utils/constants';
import styles from './TerpeneTag.module.css';

// Reusable terpene chip with optional chemical structure SVG
const TerpeneTag = ({ name, size = 'md', className = '' }) => {
  const path = TERPENE_STRUCTURES[name];

  return (
    <span className={`${styles.tag} ${styles[size]} ${className}`}>
      {path && (
        <svg
          className={styles.svg}
          viewBox="0 0 60 55"
          aria-label={`${name} structure`}
        >
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span className={styles.label}>{name}</span>
    </span>
  );
};

export default TerpeneTag;
