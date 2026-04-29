const {
  menuItems,
  ORDER_STATUSES,
  createOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  addSseClient,
  removeSseClient,
} = require('../models/store');

function placeOrder(req, res) {
  const { customerName, address, phone, items } = req.body;

  // Enrich items with current menu data & validate existence
  const enrichedItems = [];
  for (const reqItem of items) {
    const menuItem = menuItems.find((m) => m.id === reqItem.menuItemId);
    if (!menuItem) {
      return res.status(400).json({ error: `Menu item not found: ${reqItem.menuItemId}` });
    }
    if (!menuItem.available) {
      return res.status(400).json({ error: `Item "${menuItem.name}" is currently unavailable` });
    }
    enrichedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: reqItem.quantity,
    });
  }

  const order = createOrder({ customerName, address, phone, items: enrichedItems });
  res.status(201).json(order);
}

function fetchOrder(req, res) {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
}

function fetchAllOrders(req, res) {
  res.json({ orders: getAllOrders() });
}

function patchOrderStatus(req, res) {
  const { status } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`,
    });
  }

  const order = updateOrderStatus(req.params.id, status);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
}

// Server-Sent Events for real-time status
function streamOrderStatus(req, res) {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send current status immediately
  res.write(`data: ${JSON.stringify({ status: order.status, statusIndex: order.statusIndex, updatedAt: order.updatedAt })}\n\n`);

  addSseClient(req.params.id, res);

  req.on('close', () => {
    removeSseClient(req.params.id, res);
  });
}

module.exports = { placeOrder, fetchOrder, fetchAllOrders, patchOrderStatus, streamOrderStatus };
