import { useState, useEffect } from 'react';
import { fetchMenu } from '../hooks/useApi';
import MenuCard from '../components/MenuCard';
import styles from './MenuPage.module.css';

const CATEGORIES = ['All', 'Pizza', 'Burgers', 'Wraps', 'Sides', 'Salads', 'Desserts', 'Drinks'];

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const cat = activeCategory === 'All' ? undefined : activeCategory;
    fetchMenu(cat)
      .then(({ items }) => setItems(items))
      .catch(() => setError('Failed to load menu. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Our Menu</h1>
          <p className={styles.subtitle}>Fresh ingredients, bold flavors — delivered fast</p>
        </header>

        <div className={styles.filters} role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`${styles.filter} ${activeCategory === cat ? styles.active : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className={styles.state}>
            <div className={styles.spinner} />
            <p>Loading menu…</p>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          <div className={styles.grid} data-testid="menu-grid">
            {items.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
