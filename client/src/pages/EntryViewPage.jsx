import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEntries } from '../hooks/useEntries';
import MapEmbed from '../components/MapEmbed';
import {
  CANNABINOID_KEYS,
  CANNABINOID_LABELS,
  EFFECT_KEYS,
  EFFECT_LABELS,
  cloudinaryTransform,
} from '../utils/constants';
import {
  formatDate,
  formatCurrency,
  formatPercentage,
  formatRating,
  capitalize,
} from '../utils/formatters';
import styles from '../styles/EntryView.module.css';

const STRAIN_TYPE_COLORS = {
  sativa: 'var(--color-gold)',
  indica: 'var(--color-accent-purple)',
  hybrid: 'var(--color-accent-green)',
};

const hasContent = (val) => {
  if (val === null || val === undefined || val === '') return false;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'object') return Object.values(val).some(hasContent);
  return true;
};

const Section = ({ title, children, visible = true }) => {
  if (!visible) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
};

const EntryViewPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { entry, loading, error, fetchEntry } = useEntries();

  useEffect(() => {
    if (id) fetchEntry(id);
  }, [id, fetchEntry]);

  if (loading && !entry) {
    return (
      <div className={styles.page}>
        <div className={styles.spinner} aria-label="Loading" />
      </div>
    );
  }

  if (error && !entry) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.notFound}>Entry not found</p>
          <Link className={styles.backLink} to="/">Back to home</Link>
        </div>
      </div>
    );
  }

  if (!entry) return null;

  const {
    productName, strains, brand,
    quantity, price, priceNotes,
    dispensary,
    cannabisForm, customCannabisForm, cannabisFormNotes,
    consumptionMethod, customConsumptionMethod, consumptionMethodNotes,
    aromas, aromaNotes,
    flavors, flavorNotes,
    cannabinoids, terpenes,
    dosage,
    effects, symptomsRelievedNotes, otherEffectsNotes,
    medicalRating, recreationalRating,
    flowerImageUrl, coaImageUrls,
    createdAt,
  } = entry;

  const displayForm = cannabisForm === 'other' ? customCannabisForm : cannabisForm;
  const displayMethod = consumptionMethod === 'other' ? customConsumptionMethod : consumptionMethod;
  const activeCannabinoids = CANNABINOID_KEYS.filter(
    (k) => cannabinoids?.[k] != null && cannabinoids[k] !== ''
  );
  const activeEffects = EFFECT_KEYS.filter(
    (k) => effects?.[k] != null && Number(effects[k]) > 0
  );
  const coaUrls = Array.isArray(coaImageUrls) ? coaImageUrls.filter(Boolean) : [];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>{productName || 'Untitled Entry'}</h1>
            <div className={styles.headerActions}>
              <Link className={styles.backBtn} to="/">Home</Link>
              {isAuthenticated && (
                <Link className={styles.editBtn} to={`/entry/${id}/edit`}>
                  Edit
                </Link>
              )}
            </div>
          </div>
          <p className={styles.date}>{formatDate(createdAt)}</p>
        </header>
        <div className={styles.rastaStripe} role="presentation" />

        {/* Product */}
        <Section title="Product" visible={hasContent(strains) || hasContent(brand)}>
          {Array.isArray(strains) && strains.length > 0 && (
            <ul className={styles.strainList}>
              {strains.map((s, i) => (
                <li key={`${s.name}-${i}`} className={styles.strainItem}>
                  <span className={styles.strainName}>{s.name}</span>
                  <span
                    className={styles.strainBadge}
                    style={{ backgroundColor: STRAIN_TYPE_COLORS[s.type] || 'var(--color-border)' }}
                  >
                    {capitalize(s.type)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {brand && <p className={styles.meta}><span className={styles.metaLabel}>Brand:</span> {brand}</p>}
        </Section>

        {/* Purchase */}
        <Section title="Purchase" visible={hasContent(quantity) || hasContent(price) || hasContent(priceNotes)}>
          <div className={styles.metaGrid}>
            {hasContent(quantity) && (
              <p className={styles.meta}><span className={styles.metaLabel}>Quantity:</span> {quantity}</p>
            )}
            {hasContent(price) && (
              <p className={styles.meta}><span className={styles.metaLabel}>Price:</span> {formatCurrency(price)}</p>
            )}
          </div>
          {priceNotes && <p className={styles.notes}>{priceNotes}</p>}
        </Section>

        {/* Dispensary */}
        <Section title="Dispensary" visible={hasContent(dispensary)}>
          {dispensary?.name && (
            <p className={styles.meta}><span className={styles.metaLabel}>Name:</span> {dispensary.name}</p>
          )}
          {dispensary?.location && (
            <p className={styles.meta}><span className={styles.metaLabel}>Location:</span> {dispensary.location}</p>
          )}
          {dispensary?.website && (
            <p className={styles.meta}>
              <span className={styles.metaLabel}>Website:</span>{' '}
              <a
                className={styles.link}
                href={dispensary.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {dispensary.website}
              </a>
            </p>
          )}
          {dispensary?.location && <MapEmbed location={dispensary.location} />}
        </Section>

        {/* Form & Method */}
        <Section
          title="Form & Method"
          visible={hasContent(displayForm) || hasContent(displayMethod)}
        >
          {displayForm && (
            <p className={styles.meta}>
              <span className={styles.metaLabel}>Form:</span> {capitalize(displayForm)}
            </p>
          )}
          {cannabisFormNotes && <p className={styles.notes}>{cannabisFormNotes}</p>}
          {displayMethod && (
            <p className={styles.meta}>
              <span className={styles.metaLabel}>Method:</span> {capitalize(displayMethod)}
            </p>
          )}
          {consumptionMethodNotes && <p className={styles.notes}>{consumptionMethodNotes}</p>}
        </Section>

        {/* Aroma */}
        <Section title="Aroma" visible={hasContent(aromas)}>
          <ul className={styles.sensoryList}>
            {(aromas || []).map((a, i) => (
              <li key={`${a.name}-${i}`} className={styles.sensoryItem}>
                <span className={styles.sensoryName}>{a.name}</span>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{ width: `${(a.strength / 10) * 100}%` }}
                    aria-label={`Strength ${a.strength}/10`}
                  />
                </div>
                <span className={styles.strengthVal}>{a.strength}</span>
              </li>
            ))}
          </ul>
          {aromaNotes && <p className={styles.notes}>{aromaNotes}</p>}
        </Section>

        {/* Flavor */}
        <Section title="Flavor" visible={hasContent(flavors)}>
          <ul className={styles.sensoryList}>
            {(flavors || []).map((f, i) => (
              <li key={`${f.name}-${i}`} className={styles.sensoryItem}>
                <span className={styles.sensoryName}>{f.name}</span>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{ width: `${(f.strength / 10) * 100}%` }}
                    aria-label={`Strength ${f.strength}/10`}
                  />
                </div>
                <span className={styles.strengthVal}>{f.strength}</span>
              </li>
            ))}
          </ul>
          {flavorNotes && <p className={styles.notes}>{flavorNotes}</p>}
        </Section>

        {/* Chemistry */}
        <Section
          title="Chemistry"
          visible={activeCannabinoids.length > 0 || hasContent(terpenes)}
        >
          {activeCannabinoids.length > 0 && (
            <div className={styles.chemGrid}>
              {activeCannabinoids.map((key) => (
                <div key={key} className={styles.chemCard}>
                  <span className={styles.chemLabel}>{CANNABINOID_LABELS[key]}</span>
                  <span className={styles.chemValue}>{formatPercentage(cannabinoids[key])}</span>
                </div>
              ))}
            </div>
          )}
          {terpenes?.dominant?.length > 0 && (
            <div className={styles.terpeneRow}>
              <span className={styles.metaLabel}>Dominant:</span>
              <div className={styles.tagList}>
                {terpenes.dominant.map((t, i) => (
                  <span key={`d-${t}-${i}`} className={styles.tag}>{t}</span>
                ))}
              </div>
            </div>
          )}
          {terpenes?.secondary?.length > 0 && (
            <div className={styles.terpeneRow}>
              <span className={styles.metaLabel}>Secondary:</span>
              <div className={styles.tagList}>
                {terpenes.secondary.map((t, i) => (
                  <span key={`s-${t}-${i}`} className={styles.tag}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Dosage */}
        <Section title="Dosage" visible={hasContent(dosage)}>
          <div className={styles.metaGrid}>
            {dosage?.amountConsumed && (
              <p className={styles.meta}>
                <span className={styles.metaLabel}>Amount:</span> {dosage.amountConsumed}
              </p>
            )}
            {dosage?.timesTaken && (
              <p className={styles.meta}>
                <span className={styles.metaLabel}>Times Taken:</span> {dosage.timesTaken}
              </p>
            )}
            {dosage?.timeToEffect && (
              <p className={styles.meta}>
                <span className={styles.metaLabel}>Time to Effect:</span> {dosage.timeToEffect}
              </p>
            )}
            {dosage?.lengthOfEffects && (
              <p className={styles.meta}>
                <span className={styles.metaLabel}>Duration:</span> {dosage.lengthOfEffects}
              </p>
            )}
          </div>
        </Section>

        {/* Effects */}
        <Section title="Effects" visible={activeEffects.length > 0 || hasContent(symptomsRelievedNotes) || hasContent(otherEffectsNotes)}>
          {activeEffects.length > 0 && (
            <div className={styles.effectBars}>
              {activeEffects.map((key) => {
                const val = Number(effects[key]);
                return (
                  <div key={key} className={styles.effectRow}>
                    <span className={styles.effectLabel}>
                      {EFFECT_LABELS[key] ?? key}
                    </span>
                    <div className={styles.effectTrack}>
                      <div
                        className={styles.effectFill}
                        style={{ width: `${(val / 10) * 100}%` }}
                      />
                    </div>
                    <span className={styles.effectVal}>{val}</span>
                  </div>
                );
              })}
            </div>
          )}
          {symptomsRelievedNotes && (
            <div className={styles.notesBlock}>
              <span className={styles.metaLabel}>Symptoms Relieved:</span>
              <p className={styles.notes}>{symptomsRelievedNotes}</p>
            </div>
          )}
          {otherEffectsNotes && (
            <div className={styles.notesBlock}>
              <span className={styles.metaLabel}>Other Effects:</span>
              <p className={styles.notes}>{otherEffectsNotes}</p>
            </div>
          )}
        </Section>

        {/* Ratings */}
        <Section
          title="Ratings"
          visible={hasContent(medicalRating) || hasContent(recreationalRating)}
        >
          <div className={styles.ratingRow}>
            {hasContent(medicalRating) && (
              <div className={styles.ratingCard}>
                <span className={styles.ratingLabel}>Medical</span>
                <span className={styles.ratingValue}>{formatRating(medicalRating)}</span>
                <span className={styles.ratingMax}>/10</span>
              </div>
            )}
            {hasContent(recreationalRating) && (
              <div className={styles.ratingCard}>
                <span className={styles.ratingLabel}>Recreational</span>
                <span className={styles.ratingValue}>{formatRating(recreationalRating)}</span>
                <span className={styles.ratingMax}>/10</span>
              </div>
            )}
          </div>
        </Section>

        {/* Images */}
        <Section title="Images" visible={hasContent(flowerImageUrl) || coaUrls.length > 0}>
          {flowerImageUrl && (
            <div className={styles.heroImgWrap}>
              <img
                className={styles.heroImg}
                src={cloudinaryTransform(flowerImageUrl, 800)}
                alt={productName || 'Flower'}
                loading="lazy"
              />
            </div>
          )}
          {coaUrls.length > 0 && (
            <>
              <h3 className={styles.subTitle}>Certificate of Analysis</h3>
              <div className={styles.gallery}>
                {coaUrls.map((url, i) => (
                  <img
                    key={`coa-${i}`}
                    className={styles.galleryImg}
                    src={cloudinaryTransform(url, 400)}
                    alt={`COA ${i + 1}`}
                    loading="lazy"
                  />
                ))}
              </div>
            </>
          )}
        </Section>
      </div>
    </div>
  );
};

export default EntryViewPage;
