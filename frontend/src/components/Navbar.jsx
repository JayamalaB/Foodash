import { Link, useLocation } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import styles from './Navbar.module.css';

export default function Navbar() {
  const location = useLocation();
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🍕</span>
          <span>FooDash</span>
        </Link>

        <div className={styles.links}>
          <Link
            to="/"
            className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}
          >
            Menu
          </Link>
          <Link
            to="/cart"
            className={`${styles.link} ${location.pathname === '/cart' ? styles.active : ''}`}
          >
            Cart
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
