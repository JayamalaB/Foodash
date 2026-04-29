import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { placeOrder } from '../hooks/useApi';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const navigate = useNavigate();

  const [form, setForm] = useState({ customerName: '', address: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout'

  function validate() {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Name is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setServerError('');
    try {
      const order = await placeOrder({
        ...form,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      });
      clearCart();
      navigate(`/order/${order.id}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 && step === 'cart') {
    return (
      <div className={styles.empty}>
        <div className="container">
          <div className={styles.emptyInner}>
            <span className={styles.emptyIcon}>🛒</span>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/" className={styles.backBtn}>Browse Menu</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>{step === 'cart' ? 'Your Cart' : 'Checkout'}</h1>

        <div className={styles.layout}>
          {/* Left: Cart items or form */}
          <div className={styles.main}>
            {step === 'cart' ? (
              <div className={styles.cartItems} data-testid="cart-items">
                {items.map((item) => (
                  <div key={item.menuItemId} className={styles.cartItem} data-testid={`cart-item-${item.menuItemId}`}>
                    <img src={item.image} alt={item.name} className={styles.cartImg} />
                    <div className={styles.cartInfo}>
                      <h3>{item.name}</h3>
                      <span className={styles.cartPrice}>${item.price.toFixed(2)} each</span>
                    </div>
                    <div className={styles.qtyControl}>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        data-testid={`qty-dec-${item.menuItemId}`}
                      >−</button>
                      <span data-testid={`qty-${item.menuItemId}`}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        data-testid={`qty-inc-${item.menuItemId}`}
                      >+</button>
                    </div>
                    <span className={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      className={styles.remove}
                      onClick={() => removeItem(item.menuItemId)}
                      aria-label={`Remove ${item.name}`}
                      data-testid={`remove-${item.menuItemId}`}
                    >✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form} data-testid="checkout-form" noValidate>
                <div className={styles.field}>
                  <label htmlFor="customerName">Full Name</label>
                  <input
                    id="customerName"
                    placeholder="Alice Kumar"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    data-testid="input-name"
                  />
                  {errors.customerName && <span className={styles.fieldError}>{errors.customerName}</span>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="address">Delivery Address</label>
                  <textarea
                    id="address"
                    rows={3}
                    placeholder="42 Marina Beach Rd, Chennai"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    data-testid="input-address"
                  />
                  {errors.address && <span className={styles.fieldError}>{errors.address}</span>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                  {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                </div>
                {serverError && <p className={styles.serverError}>{serverError}</p>}
                <div className={styles.formActions}>
                  <button type="button" className={styles.backBtn2} onClick={() => setStep('cart')}>
                    ← Back to cart
                  </button>
                  <button type="submit" className={styles.placeBtn} disabled={loading} data-testid="place-order-btn">
                    {loading ? 'Placing…' : `Place Order • $${total.toFixed(2)}`}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Order summary */}
          <div className={styles.sidebar}>
            <div className={styles.summary}>
              <h2>Order Summary</h2>
              {items.map((item) => (
                <div key={item.menuItemId} className={styles.summaryRow}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className={styles.summaryDivider} />
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span data-testid="cart-total">${total.toFixed(2)}</span>
              </div>
              {step === 'cart' && (
                <button className={styles.checkoutBtn} onClick={() => setStep('checkout')} data-testid="checkout-btn">
                  Proceed to Checkout →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
