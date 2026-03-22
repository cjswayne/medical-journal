import styles from './MapEmbed.module.css';

// Client bundle: use VITE_GOOGLE_MAPS_API_KEY in .env (Maps Embed API).
const mapsEmbedKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MapEmbed = ({ location }) => {
  const q =
    location == null
      ? ''
      : typeof location === 'string'
        ? location.trim()
        : String(location).trim();

  if (!q) return null;

  const encodedQ = encodeURIComponent(q);
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQ}`;

  if (mapsEmbedKey) {
    const src = `https://www.google.com/maps/embed/v1/search?key=${encodeURIComponent(
      mapsEmbedKey
    )}&q=${encodedQ}`;
    return (
      <div className={styles.wrap}>
        <iframe
          className={styles.iframe}
          title={`Map: ${q}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          src={src}
        />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <a className={styles.link} href={searchUrl} target="_blank" rel="noopener noreferrer">
        Open location in Google Maps
      </a>
    </div>
  );
};

export default MapEmbed;
