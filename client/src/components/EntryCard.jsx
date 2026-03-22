import { Link } from 'react-router-dom';
import { cloudinaryTransform } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import styles from './EntryCard.module.css';

const dominantList = (entry) => {
  const raw = entry?.terpenes?.dominant;
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  return String(raw)
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const EntryCard = ({ entry }) => {
  const { _id, productName, flowerImageUrl, createdAt } = entry || {};
  const tags = dominantList(entry);
  const imgSrc = flowerImageUrl ? cloudinaryTransform(flowerImageUrl, 200) : '';

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
        {tags.length > 0 && (
          <ul className={styles.tags} aria-label="Dominant terpenes">
            {tags.map((t, i) => (
              <li key={`${t}-${i}`} className={styles.tag}>
                {t}
              </li>
            ))}
          </ul>
        )}
        <time className={styles.date} dateTime={createdAt || undefined}>
          {formatDate(createdAt)}
        </time>
      </div>
    </Link>
  );
};

export default EntryCard;
