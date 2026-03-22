import styles from "./Footer.module.css";

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.inner}>
      <nav className={styles.links} aria-label="Legal">
        <a href="/terms.html">Terms of Service</a>
        <a href="/privacy.html">Privacy Policy</a>
      </nav>
    </div>
    <div className={styles.stripe} role="presentation" />
  </footer>
);

export default Footer;
