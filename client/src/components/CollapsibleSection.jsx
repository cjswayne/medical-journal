import { useId, useState } from 'react';
import styles from './CollapsibleSection.module.css';

const CollapsibleSection = ({ title, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  const toggle = () => setOpen((o) => !o);

  return (
    <section className={styles.section}>
      <div className={styles.rastaStripe} aria-hidden />
      <h2 className={styles.heading}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          id={`${panelId}-label`}
          onClick={toggle}
        >
          <span className={styles.title}>{title}</span>
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden>
            ▼
          </span>
        </button>
      </h2>
      <div
        id={panelId}
        role="region"
        aria-labelledby={`${panelId}-label`}
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
      >
        <div className={styles.panelInner}>{children}</div>
      </div>
    </section>
  );
};

export default CollapsibleSection;
