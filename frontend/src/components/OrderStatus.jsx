import styles from './OrderStatus.module.css';

const STATUSES = ['Order Received', 'Preparing', 'Out for Delivery', 'Delivered'];

const STATUS_ICONS = {
  'Order Received': '📋',
  Preparing: '👨‍🍳',
  'Out for Delivery': '🛵',
  Delivered: '✅',
};

export default function OrderStatus({ status, statusIndex }) {
  return (
    <div className={styles.tracker} data-testid="order-status">
      <div className={styles.steps}>
        {STATUSES.map((s, i) => {
          const done = i < statusIndex;
          const active = i === statusIndex;
          return (
            <div key={s} className={`${styles.step} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
              <div className={styles.dot}>
                {done ? '✓' : STATUS_ICONS[s]}
              </div>
              <span className={styles.label}>{s}</span>
              {i < STATUSES.length - 1 && (
                <div className={`${styles.line} ${done ? styles.lineDone : ''}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className={styles.current}>
        Current status: <strong>{status}</strong>
      </p>
    </div>
  );
}
