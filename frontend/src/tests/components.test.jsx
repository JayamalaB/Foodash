import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MenuCard from '../components/MenuCard';
import OrderStatus from '../components/OrderStatus';
import useCartStore from '../store/cartStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockItem = {
  id: 'item-001',
  name: 'Margherita Pizza',
  description: 'Classic tomato sauce and mozzarella',
  price: 12.99,
  category: 'Pizza',
  image: 'https://example.com/pizza.jpg',
  available: true,
};

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

// ─── MenuCard Tests ───────────────────────────────────────────────────────────

describe('MenuCard', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('renders item name, price, and description', () => {
    renderWithRouter(<MenuCard item={mockItem} />);
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('Classic tomato sauce and mozzarella')).toBeInTheDocument();
  });

  it('renders the item category badge', () => {
    renderWithRouter(<MenuCard item={mockItem} />);
    expect(screen.getByText('Pizza')).toBeInTheDocument();
  });

  it('shows "Add to cart" button initially', () => {
    renderWithRouter(<MenuCard item={mockItem} />);
    expect(screen.getByTestId('add-to-cart-item-001')).toHaveTextContent('Add to cart');
  });

  it('adds item to cart on click', () => {
    renderWithRouter(<MenuCard item={mockItem} />);
    fireEvent.click(screen.getByTestId('add-to-cart-item-001'));
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].menuItemId).toBe('item-001');
    expect(items[0].quantity).toBe(1);
  });

  it('shows quantity in button after adding to cart', () => {
    useCartStore.setState({ items: [{ menuItemId: 'item-001', name: 'Margherita Pizza', price: 12.99, image: '', quantity: 2 }] });
    renderWithRouter(<MenuCard item={mockItem} />);
    expect(screen.getByTestId('add-to-cart-item-001')).toHaveTextContent('In cart (2)');
  });

  it('increments quantity when already in cart', () => {
    renderWithRouter(<MenuCard item={mockItem} />);
    fireEvent.click(screen.getByTestId('add-to-cart-item-001'));
    fireEvent.click(screen.getByTestId('add-to-cart-item-001'));
    const { items } = useCartStore.getState();
    expect(items[0].quantity).toBe(2);
  });

  it('renders item image with correct alt text', () => {
    renderWithRouter(<MenuCard item={mockItem} />);
    const img = screen.getByAltText('Margherita Pizza');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockItem.image);
  });
});

// ─── OrderStatus Tests ────────────────────────────────────────────────────────

describe('OrderStatus', () => {
  it('renders status tracker', () => {
    render(<OrderStatus status="Order Received" statusIndex={0} />);
    expect(screen.getByTestId('order-status')).toBeInTheDocument();
  });

  it('displays all four status steps', () => {
    render(<OrderStatus status="Order Received" statusIndex={0} />);
    expect(screen.getAllByText('Order Received').length).toBeGreaterThan(0);
    expect(screen.getByText('Preparing')).toBeInTheDocument();
    expect(screen.getByText('Out for Delivery')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('shows current status in summary text', () => {
    render(<OrderStatus status="Preparing" statusIndex={1} />);
    expect(screen.getByText('Preparing', { selector: 'strong' })).toBeInTheDocument();
  });

  it('renders correctly at Delivered state', () => {
    render(<OrderStatus status="Delivered" statusIndex={3} />);
    expect(screen.getByText('Delivered', { selector: 'strong' })).toBeInTheDocument();
  });
});

// ─── Cart Store Tests ─────────────────────────────────────────────────────────

describe('CartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  const cartItem = { menuItemId: 'item-001', name: 'Margherita Pizza', price: 12.99, image: '' };

  it('adds a new item', () => {
    useCartStore.getState().addItem(cartItem);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('increments quantity for existing item', () => {
    useCartStore.getState().addItem(cartItem);
    useCartStore.getState().addItem(cartItem);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('removes an item', () => {
    useCartStore.getState().addItem(cartItem);
    useCartStore.getState().removeItem('item-001');
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('updates quantity', () => {
    useCartStore.getState().addItem(cartItem);
    useCartStore.getState().updateQuantity('item-001', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    useCartStore.getState().addItem(cartItem);
    useCartStore.getState().updateQuantity('item-001', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('clears all items', () => {
    useCartStore.getState().addItem(cartItem);
    useCartStore.getState().addItem({ ...cartItem, menuItemId: 'item-002' });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    useCartStore.getState().addItem(cartItem);
    useCartStore.getState().updateQuantity('item-001', 3);
    const total = useCartStore.getState().items.reduce((s, i) => s + i.price * i.quantity, 0);
    expect(total).toBeCloseTo(12.99 * 3, 2);
  });
});
