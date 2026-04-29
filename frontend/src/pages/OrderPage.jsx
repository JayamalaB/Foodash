import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrder, subscribeToOrderStatus } from '../hooks/useApi';
import OrderStatus from '../components/OrderStatus';
import styles from './OrderPage.module.css';

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);

  useEffect(() => {
    fetchOrder(id)
      .then((o) => {
        setOrder(o);
        setLiveStatus({ status: o.status, statusIndex: o.statusIndex });
      })
      .catch(() => setError('Could not find this order.'))
      .finally(() => setLoading(false));

    // SSE subscription
    const unsubscribe = subscribeToOrderStatus(
      id,
      (update) => setLiveStatus(update),
      () => {} // silently ignore SSE errors
    );

    return unsubscribe;
  }, [id]);

  if (loading) return (
    <div className={styles.center}>
      <div className={styles.spinner} />
    </div>
  );

  if (error) return (
    <div className={styles.center}>
      <p className={styles.error}>{error}</p>
      <Link to="/" className={styles.homeLink}>Back to Menu</Link>
    </div>
  );

  const currentStatus = liveStatus?.status ?? order.status;
  const currentIndex = liveStatus?.statusIndex ?? order.statusIndex;
  const isDelivered = currentStatus === 'Delivered';

  return (
    <div className={styles.page}>
      <div className="container">
        {isDelivered ? (
          <div className={styles.deliveredBanner}>
            🎉 Your order has been delivered! Enjoy your meal!
          </div>
        ) : (
          <div className={styles.heroBanner}>
            <span className={styles.pulse} />
            Live tracking your order
          </div>
        )}

        <div className={styles.grid}>
          <div>
            <h1 className={styles.title}>Order Confirmed!</h1>
            <p className={styles.orderId}>Order ID: <code>{order.id}</code></p>
            <OrderStatus status={currentStatus} statusIndex={currentIndex} />
          </div>

          <div className={styles.details}>
            <h2>Delivery Details</h2>
            <div className={styles.detailRow}>
              <span>Name</span>
              <span>{order.customerName}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Address</span>
              <span>{order.address}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Phone</span>
              <span>{order.phone}</span>
            </div>

            <h2 className={styles.itemsTitle}>Items Ordered</h2>
            {order.items.map((item) => (
              <div key={item.menuItemId} className={styles.detailRow}>
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className={styles.totalRow}>
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>

            <Link to="/" className={styles.menuLink}>← Order More Food</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
