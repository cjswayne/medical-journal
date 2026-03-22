import styles from './SkeletonCard.module.css';

const SkeletonCard = () => (
  <div className={styles.card} aria-hidden>
    <div className={`${styles.shimmer} ${styles.image}`} />
    <div className={styles.body}>
      <div className={`${styles.shimmer} ${styles.title}`} />
      <div className={styles.tagRow}>
        <div className={`${styles.shimmer} ${styles.tag}`} />
        <div className={`${styles.shimmer} ${styles.tag}`} />
      </div>
      <div className={`${styles.shimmer} ${styles.date}`} />
    </div>
  </div>
);

export default SkeletonCard;
