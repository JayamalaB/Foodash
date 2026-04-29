const { v4: uuidv4 } = require('uuid');

// ─── Menu Items ───────────────────────────────────────────────────────────────

const menuItems = [
  {
    id: 'item-001',
    name: 'Margherita Pizza',
    description: 'Classic tomato sauce, fresh mozzarella, basil, and extra virgin olive oil',
    price: 12.99,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: 'item-002',
    name: 'BBQ Bacon Burger',
    description: 'Angus beef patty, crispy bacon, cheddar, BBQ sauce, and pickles',
    price: 14.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: 'item-003',
    name: 'Truffle Fries',
    description: 'Crispy fries tossed in truffle oil, parmesan, and fresh herbs',
    price: 7.99,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: 'item-004',
    name: 'Chicken Tikka Wrap',
    description: 'Grilled chicken tikka, mint chutney, onions, and lettuce in a soft tortilla',
    price: 10.99,
    category: 'Wraps',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: 'item-005',
    name: 'Pepperoni Pizza',
    description: 'Loaded with premium pepperoni slices on a rich tomato base with mozzarella',
    price: 14.99,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: 'item-006',
    name: 'Caesar Salad',
    description: 'Romaine lettuce, parmesan, croutons, and house-made Caesar dressing',
    price: 9.99,
    category: 'Salads',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: 'item-007',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
    price: 8.99,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
    available: true,
  },
  {
    id: 'item-008',
    name: 'Mango Smoothie',
    description: 'Fresh mango blended with yogurt and a hint of cardamom',
    price: 5.99,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop',
    available: true,
  },
];

// ─── Order Store ──────────────────────────────────────────────────────────────

const ORDER_STATUSES = [
  'Order Received',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

const orders = new Map();

// SSE clients: Map<orderId, Set<res>>
const sseClients = new Map();

function createOrder({ customerName, address, phone, items }) {
  const order = {
    id: uuidv4(),
    customerName,
    address,
    phone,
    items, // [{ menuItemId, name, price, quantity }]
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    status: 'Order Received',
    statusIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.set(order.id, order);
  scheduleStatusUpdates(order.id);
  return order;
}

function getOrder(id) {
  return orders.get(id) || null;
}

function getAllOrders() {
  return Array.from(orders.values());
}

function updateOrderStatus(id, status) {
  const order = orders.get(id);
  if (!order) return null;
  const idx = ORDER_STATUSES.indexOf(status);
  if (idx === -1) return null;
  order.status = status;
  order.statusIndex = idx;
  order.updatedAt = new Date().toISOString();
  notifySseClients(id, order);
  return order;
}

// ─── SSE Helpers ──────────────────────────────────────────────────────────────

function addSseClient(orderId, res) {
  if (!sseClients.has(orderId)) sseClients.set(orderId, new Set());
  sseClients.get(orderId).add(res);
}

function removeSseClient(orderId, res) {
  sseClients.get(orderId)?.delete(res);
}

function notifySseClients(orderId, order) {
  const clients = sseClients.get(orderId);
  if (!clients) return;
  const data = JSON.stringify({ status: order.status, statusIndex: order.statusIndex, updatedAt: order.updatedAt });
  clients.forEach((res) => {
    try { res.write(`data: ${data}\n\n`); } catch (_) {}
  });
}

// Auto-advance status every ~10s for demo purposes
function scheduleStatusUpdates(orderId) {
  const delays = [10000, 25000, 45000]; // ms after placement
  ORDER_STATUSES.slice(1).forEach((status, i) => {
    setTimeout(() => {
      const order = orders.get(orderId);
      if (order && order.statusIndex === i) {
        updateOrderStatus(orderId, status);
      }
    }, delays[i]);
  });
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  menuItems,
  ORDER_STATUSES,
  createOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  addSseClient,
  removeSseClient,
};
