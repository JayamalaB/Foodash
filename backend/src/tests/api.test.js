const request = require('supertest');
const app = require('../app');

// ─── Menu Tests ───────────────────────────────────────────────────────────────

describe('GET /api/menu', () => {
  it('returns all menu items', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(res.body.items).toBeInstanceOf(Array);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('each item has required fields', async () => {
    const res = await request(app).get('/api/menu');
    res.body.items.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('image');
      expect(item).toHaveProperty('category');
    });
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/menu?category=Pizza');
    expect(res.status).toBe(200);
    res.body.items.forEach((item) => {
      expect(item.category.toLowerCase()).toBe('pizza');
    });
  });

  it('returns empty array for unknown category', async () => {
    const res = await request(app).get('/api/menu?category=Nonexistent');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });
});

describe('GET /api/menu/:id', () => {
  it('returns a single menu item', async () => {
    const res = await request(app).get('/api/menu/item-001');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('item-001');
    expect(res.body.name).toBe('Margherita Pizza');
  });

  it('returns 404 for non-existent item', async () => {
    const res = await request(app).get('/api/menu/item-999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── Order Tests ──────────────────────────────────────────────────────────────

const validOrderPayload = {
  customerName: 'Alice Kumar',
  address: '42 Marina Beach Road, Chennai',
  phone: '+91 98765 43210',
  items: [
    { menuItemId: 'item-001', quantity: 2 },
    { menuItemId: 'item-003', quantity: 1 },
  ],
};

describe('POST /api/orders', () => {
  it('creates an order successfully', async () => {
    const res = await request(app).post('/api/orders').send(validOrderPayload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('Order Received');
    expect(res.body.customerName).toBe('Alice Kumar');
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBeCloseTo(12.99 * 2 + 7.99, 1);
  });

  it('enriches items with current menu prices', async () => {
    const res = await request(app).post('/api/orders').send(validOrderPayload);
    const pizza = res.body.items.find((i) => i.menuItemId === 'item-001');
    expect(pizza.price).toBe(12.99);
    expect(pizza.name).toBe('Margherita Pizza');
  });

  it('rejects order with missing customerName', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrderPayload, customerName: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('rejects order with missing address', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrderPayload, address: '' });
    expect(res.status).toBe(400);
  });

  it('rejects order with invalid phone', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrderPayload, phone: 'not-a-phone' });
    expect(res.status).toBe(400);
  });

  it('rejects order with empty items array', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrderPayload, items: [] });
    expect(res.status).toBe(400);
  });

  it('rejects order with quantity 0', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrderPayload, items: [{ menuItemId: 'item-001', quantity: 0 }] });
    expect(res.status).toBe(400);
  });

  it('rejects order with non-existent menu item', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrderPayload, items: [{ menuItemId: 'item-999', quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/orders/:id', () => {
  let orderId;

  beforeEach(async () => {
    const res = await request(app).post('/api/orders').send(validOrderPayload);
    orderId = res.body.id;
  });

  it('returns the order by ID', async () => {
    const res = await request(app).get(`/api/orders/${orderId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(orderId);
  });

  it('returns 404 for non-existent order', async () => {
    const res = await request(app).get('/api/orders/non-existent-id');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/orders/:id/status', () => {
  let orderId;

  beforeEach(async () => {
    const res = await request(app).post('/api/orders').send(validOrderPayload);
    orderId = res.body.id;
  });

  it('updates order status successfully', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'Preparing' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Preparing');
  });

  it('rejects invalid status', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'Teleporting' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent order', async () => {
    const res = await request(app)
      .patch('/api/orders/fake-id/status')
      .send({ status: 'Preparing' });
    expect(res.status).toBe(404);
  });

  it('can advance through all statuses', async () => {
    const statuses = ['Preparing', 'Out for Delivery', 'Delivered'];
    for (const status of statuses) {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(status);
    }
  });
});

describe('GET /api/orders', () => {
  it('returns all orders', async () => {
    await request(app).post('/api/orders').send(validOrderPayload);
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(res.body.orders).toBeInstanceOf(Array);
    expect(res.body.orders.length).toBeGreaterThan(0);
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
  });
});
