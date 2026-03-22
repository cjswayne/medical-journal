import styles from './MapEmbed.module.css';

// Free Google Maps embed -- no API key required
const MapEmbed = ({ location }) => {
  const q =
    location == null
      ? ''
      : typeof location === 'string'
        ? location.trim()
        : String(location).trim();

  if (!q) return null;

  const encodedQ = encodeURIComponent(q);
  const src = `https://maps.google.com/maps?q=${encodedQ}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

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
};

export default MapEmbed;
