import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/analytics", label: "Analytics" },
];

// Match route to highlight the correct nav link
const isActive = (linkTo, pathname) => {
  if (linkTo === "/") return pathname === "/";
  return pathname.startsWith(linkTo);
};

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const toggle = () => setMenuOpen((prev) => !prev);

  return (
    <header className={styles.header} ref={navRef}>
      <div className={styles.inner}>
        <div style={{
          display:"flex",
          gap:"10px",
          alignItems:"center"
        }}>
          <img src="../../public/face.png" width="50px" />
          <Link className={styles.brand} to="/">
            Chuck&apos;s Weed Diary
          </Link>
        </div>

        <button
          type="button"
          className={styles.hamburger}
          onClick={toggle}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barTop : ""}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barMid : ""}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barBot : ""}`} />
        </button>

        <nav
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}
          aria-label="Main"
        >
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              className={`${styles.navLink} ${isActive(to, pathname) ? styles.navLinkActive : ""}`}
              to={to}
            >
              {label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              className={styles.authBtn}
              type="button"
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
            >
              Logout
            </button>
          ) : (
            <Link
              className={`${styles.authBtn} ${pathname === "/login" ? styles.authBtnActive : ""}`}
              to="/login"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
      <div className={styles.rastaStripe} role="presentation" />
    </header>
  );
};

export default Navbar;
