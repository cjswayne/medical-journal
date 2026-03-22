import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useAuth } from '../hooks/useAuth';
import { useEntries } from '../hooks/useEntries';
import TerpeneTag from '../components/TerpeneTag';
import {
  CANNABINOID_KEYS,
  CANNABINOID_LABELS,
  EFFECT_KEYS,
  EFFECT_LABELS,
  HIGHNESS_LABELS,
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

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const STRAIN_TYPE_COLORS = {
  sativa: 'var(--color-gold)',
  indica: 'var(--color-accent-purple)',
  hybrid: 'var(--color-accent-green)',
};

const HIGHNESS_COLOR_BG = {
  green: '#4caf50',
  orange: '#ff9800',
  red: '#f44336',
  pink: '#e91e63',
  purple: '#9c27b0',
  black: '#212121',
};
const getHighnessColorBg = (c) => HIGHNESS_COLOR_BG[c] || 'var(--color-border)';

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
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    if (id) fetchEntry(id);
  }, [id, fetchEntry]);

  const openLightbox = useCallback((src) => setLightboxSrc(src), []);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  const radarData = useMemo(() => ({
    labels: EFFECT_KEYS.map((k) => EFFECT_LABELS[k] || k),
    datasets: [{
      label: 'Effects',
      data: EFFECT_KEYS.map((k) => {
        const v = entry?.effects?.[k];
        return v != null && !Number.isNaN(Number(v)) ? Number(v) : 0;
      }),
      backgroundColor: 'rgba(76, 175, 80, 0.25)',
      borderColor: '#4CAF50',
      borderWidth: 2,
      pointBackgroundColor: '#4CAF50',
      pointBorderColor: '#E8F5E9',
    }],
  }), [entry?.effects]);

  const radarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        angleLines: { color: '#1B5E20' },
        grid: { color: '#1B5E20' },
        pointLabels: { color: '#A5D6A7', font: { size: 10 } },
        ticks: {
          color: '#A5D6A7',
          backdropColor: 'transparent',
          showLabelBackdrop: false,
        },
      },
    },
    plugins: { legend: { display: false } },
  }), []);

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
    productName, productType, strains, brand,
    quantity, price, priceNotes,
    dispensary,
    cannabisForm, customCannabisForm, cannabisFormNotes,
    consumptionMethod, customConsumptionMethod, consumptionMethodNotes,
    aromas, aromaNotes,
    flavors, flavorNotes,
    cannabinoids, terpenes,
    dosage,
    highnessColor,
    effects, symptomsRelievedNotes, otherEffectsNotes,
    medicalRating, recreationalRating,
    notes,
    flowerImageUrl, coaImageUrls, miscImageUrls,
    purchaseDate, createdAt,
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
  const miscUrls = Array.isArray(miscImageUrls) ? miscImageUrls.filter(Boolean) : [];
  const displayDate = purchaseDate || createdAt;
  const thumbSrc = flowerImageUrl ? cloudinaryTransform(flowerImageUrl, 150) : '';

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            {thumbSrc && (
              <img
                className={styles.thumb}
                src={thumbSrc}
                alt=""
                width={75}
                height={75}
                loading="lazy"
              />
            )}
            <div>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{productName || 'Untitled Entry'}</h1>
                {productType && (
                  <span
                    className={styles.productBadge}
                    style={{ backgroundColor: STRAIN_TYPE_COLORS[productType] || 'var(--color-border)' }}
                  >
                    {capitalize(productType)}
                  </span>
                )}
              </div>
              <p className={styles.date}>{formatDate(displayDate)}</p>
            </div>
          </div>
        </header>
        <div className={styles.rastaStripe} role="presentation" />

        {/* Product */}
        <Section title="Product" visible={hasContent(strains) || hasContent(brand)}>
          {Array.isArray(strains) && strains.length > 0 && (
            <ul className={styles.strainList}>
              {strains.map((s, i) => (
                <li key={`${s.name}-${i}`} className={styles.strainItem}>
                  <span className={styles.strainName}>{s.name}</span>
                  {s.type && (
                    <span
                      className={styles.strainBadge}
                      style={{ backgroundColor: STRAIN_TYPE_COLORS[s.type] || 'var(--color-border)' }}
                    >
                      {capitalize(s.type)}
                    </span>
                  )}
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
              <p className={styles.meta}><span className={styles.metaLabel}>Quantity:</span> {quantity}g</p>
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
                  <TerpeneTag key={`d-${t}-${i}`} name={t} size="md" />
                ))}
              </div>
            </div>
          )}
          {terpenes?.secondary?.length > 0 && (
            <div className={styles.terpeneRow}>
              <span className={styles.metaLabel}>Secondary:</span>
              <div className={styles.tagList}>
                {terpenes.secondary.map((t, i) => (
                  <TerpeneTag key={`s-${t}-${i}`} name={t} size="md" />
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Dosage */}
        <Section title="Dosage" visible={hasContent(dosage) || hasContent(highnessColor)}>
          <div className={styles.metaGrid}>
            {highnessColor && HIGHNESS_LABELS[highnessColor] && (
              <p className={styles.meta}>
                <span className={styles.metaLabel}>Highness:</span>{' '}
                <span
                  className={styles.highnessBadge}
                  style={{ backgroundColor: getHighnessColorBg(highnessColor) }}
                >
                  {HIGHNESS_LABELS[highnessColor]}
                </span>
              </p>
            )}
            {dosage?.amountConsumed && (
              <p className={styles.meta}>
                <span className={styles.metaLabel}>Amount:</span> {dosage.amountConsumed}g
              </p>
            )}
            {dosage?.timesTaken && (
              <p className={styles.meta}>
                <span className={styles.metaLabel}>Times Taken:</span> {dosage.timesTaken}×
              </p>
            )}
            {dosage?.timeToEffect && (
              <p className={styles.meta}>
                <span className={styles.metaLabel}>Time to Effect:</span> {dosage.timeToEffect} min
              </p>
            )}
            {dosage?.lengthOfEffects && (
              <p className={styles.meta}>
                <span className={styles.metaLabel}>Duration:</span> {dosage.lengthOfEffects} min
              </p>
            )}
          </div>
        </Section>

        {/* Effects */}
        <Section title="Effects" visible={activeEffects.length > 0 || hasContent(symptomsRelievedNotes) || hasContent(otherEffectsNotes)}>
          {activeEffects.length > 0 && (
            <div className={styles.radarWrap}>
              <Radar data={radarData} options={radarOptions} />
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

        {/* Notes */}
        <Section title="Notes" visible={hasContent(notes)}>
          <p className={styles.notes}>{notes}</p>
        </Section>

        {/* Images */}
        <Section title="Images" visible={hasContent(flowerImageUrl) || coaUrls.length > 0 || miscUrls.length > 0}>
          {flowerImageUrl && (
            <div className={styles.heroImgWrap}>
              <img
                className={styles.heroImg}
                src={cloudinaryTransform(flowerImageUrl, 800)}
                alt={productName || 'Flower'}
                loading="lazy"
                onClick={() => openLightbox(cloudinaryTransform(flowerImageUrl, 1600))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openLightbox(cloudinaryTransform(flowerImageUrl, 1600))}
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
                    src={cloudinaryTransform(url, 1600)}
                    alt={`COA ${i + 1}`}
                    loading="lazy"
                    onClick={() => openLightbox(cloudinaryTransform(url, 2400))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openLightbox(cloudinaryTransform(url, 2400))}
                  />
                ))}
              </div>
            </>
          )}
          {miscUrls.length > 0 && (
            <>
              <h3 className={styles.subTitle}>Misc Images</h3>
              <div className={styles.gallery}>
                {miscUrls.map((url, i) => (
                  <img
                    key={`misc-${i}`}
                    className={styles.galleryImg}
                    src={cloudinaryTransform(url, 1600)}
                    alt={`Misc ${i + 1}`}
                    loading="lazy"
                    onClick={() => openLightbox(cloudinaryTransform(url, 2400))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openLightbox(cloudinaryTransform(url, 2400))}
                  />
                ))}
              </div>
            </>
          )}
        </Section>
      </div>

      {lightboxSrc && (
        <div
          className={styles.lightbox}
          onClick={closeLightbox}
          onKeyDown={(e) => e.key === 'Escape' && closeLightbox()}
          role="dialog"
          aria-label="Enlarged image"
          tabIndex={-1}
        >
          <img
            className={styles.lightboxImg}
            src={lightboxSrc}
            alt="Enlarged view"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className={styles.lightboxClose}
            onClick={closeLightbox}
            aria-label="Close"
            type="button"
          >
            &times;
          </button>
        </div>
      )}

      {isAuthenticated && (
        <Link className={styles.editFab} to={`/entry/${id}/edit`} aria-label="Edit entry">
          &#9998;
        </Link>
      )}
    </div>
  );
};

export default EntryViewPage;
