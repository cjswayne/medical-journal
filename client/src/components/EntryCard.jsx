import { Link } from 'react-router-dom';
import { cloudinaryTransform, EFFECT_LABELS } from '../utils/constants';
import { formatDate, capitalize } from '../utils/formatters';
import TerpeneTag from './TerpeneTag';
import styles from './EntryCard.module.css';

const STRAIN_TYPE_COLORS = {
  sativa: 'var(--color-gold)',
  indica: 'var(--color-accent-purple)',
  hybrid: 'var(--color-accent-green)',
};

const firstTerpene = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return String(arr[0]).trim() || null;
};

// Return the top N effects sorted by value descending
const topEffects = (effects, n = 2) => {
  if (!effects || typeof effects !== 'object') return [];
  return Object.entries(effects)
    .filter(([, v]) => v != null && Number(v) > 0)
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, n)
    .map(([key, val]) => ({
      label: EFFECT_LABELS[key] || key,
      value: Number(val),
    }));
};

const EntryCard = ({ entry }) => {
  const {
    _id, productName, productType, flowerImageUrl, purchaseDate, createdAt,
    strains, recreationalRating, terpenes, effects, dispensary,
  } = entry || {};

  const imgSrc = flowerImageUrl ? cloudinaryTransform(flowerImageUrl, 200) : '';
  const dominant = firstTerpene(terpenes?.dominant);
  const top2 = topEffects(effects, 2);
  const displayDate = purchaseDate || createdAt;

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
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{productName || 'Untitled'}</h3>
          {productType && (
            <span
              className={styles.productBadge}
              style={{ backgroundColor: STRAIN_TYPE_COLORS[productType] || 'var(--color-border)' }}
            >
              {capitalize(productType)}
            </span>
          )}
        </div>

        {/* Strain names */}
        {Array.isArray(strains) && strains.length > 0 && (
          <div className={styles.strains}>
            {strains.map((s, i) => (
              <span key={`${s.name}-${i}`} className={styles.strainName}>
                {s.name}
              </span>
            ))}
          </div>
        )}

        {/* Dominant terpene */}
        {dominant && (
          <div className={styles.terpenes}>
            <TerpeneTag name={dominant} size="sm" />
          </div>
        )}

        {/* Recreational rating */}
        {recreationalRating != null && recreationalRating !== '' && (
          <div className={styles.ratingRow}>
            <span className={styles.ratingLabel}>Rec</span>
            <span className={styles.ratingValue}>{recreationalRating}/10</span>
          </div>
        )}

        {/* Top 2 effects */}
        {top2.length > 0 && (
          <div className={styles.effectsRow}>
            {top2.map((eff) => (
              <span key={eff.label} className={styles.effectPill}>
                {eff.label} <strong>{eff.value}</strong>
              </span>
            ))}
          </div>
        )}

        <time className={styles.date} dateTime={displayDate || undefined}>
          {formatDate(displayDate)}
        </time>

        {dispensary?.location && (
          <span className={styles.location}>{dispensary.location}</span>
        )}
      </div>
    </Link>
  );
};

export default EntryCard;
