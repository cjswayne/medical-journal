import { Link } from 'react-router-dom';
import { cloudinaryTransform } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import styles from './EntryCard.module.css';

const firstTerpene = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return String(arr[0]).trim() || null;
};

const EntryCard = ({ entry }) => {
  const {
    _id, productName, flowerImageUrl, createdAt,
    cannabinoids, medicalRating, recreationalRating, terpenes,
  } = entry || {};

  const imgSrc = flowerImageUrl ? cloudinaryTransform(flowerImageUrl, 200) : '';
  const thc = cannabinoids?.thc;
  const cbd = cannabinoids?.cbd;
  const dominant = firstTerpene(terpenes?.dominant);
  const secondary = firstTerpene(terpenes?.secondary);

  return (
    <Link className={styles.card} to={`/entry/${_id}`}>
      <div className={styles.imageWrap}>
        {imgSrc ? (
          <img
            className={styles.image}
            src={imgSrc}
            alt=""
            loading="lazy"
            width={200}
            height={200}
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden />
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{productName || 'Untitled'}</h3>

        <div className={styles.stats}>
          {thc != null && thc !== '' && (
            <span className={styles.stat}>
              <span className={styles.statLabel}>THC</span>
              <span className={styles.statValue}>{thc}%</span>
            </span>
          )}
          {cbd != null && cbd !== '' && (
            <span className={styles.stat}>
              <span className={styles.statLabel}>CBD</span>
              <span className={styles.statValue}>{cbd}%</span>
            </span>
          )}
          {medicalRating != null && medicalRating !== '' && (
            <span className={styles.stat}>
              <span className={styles.statLabel}>Med</span>
              <span className={styles.statValue}>{medicalRating}</span>
            </span>
          )}
          {recreationalRating != null && recreationalRating !== '' && (
            <span className={styles.stat}>
              <span className={styles.statLabel}>Rec</span>
              <span className={styles.statValue}>{recreationalRating}</span>
            </span>
          )}
        </div>

        {(dominant || secondary) && (
          <div className={styles.terpenes}>
            {dominant && <span className={styles.tag}>{dominant}</span>}
            {secondary && <span className={`${styles.tag} ${styles.tagSecondary}`}>{secondary}</span>}
          </div>
        )}

        <time className={styles.date} dateTime={createdAt || undefined}>
          {formatDate(createdAt)}
        </time>
      </div>
    </Link>
  );
};

export default EntryCard;
