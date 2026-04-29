import useCartStore from '../store/cartStore';
import styles from './MenuCard.module.css';

export default function MenuCard({ item }) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const inCart = cartItems.find((i) => i.menuItemId === item.id);

  function handleAdd() {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  }

  return (
    <div className={styles.card} data-testid={`menu-card-${item.id}`}>
      <div className={styles.imageWrap}>
        <img src={item.image} alt={item.name} className={styles.image} loading="lazy" />
        <span className={styles.category}>{item.category}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.desc}>{item.description}</p>
        <div className={styles.footer}>
          <span className={styles.price}>${item.price.toFixed(2)}</span>
          <button
            className={`${styles.btn} ${inCart ? styles.inCart : ''}`}
            onClick={handleAdd}
            data-testid={`add-to-cart-${item.id}`}
          >
            {inCart ? `In cart (${inCart.quantity})` : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
