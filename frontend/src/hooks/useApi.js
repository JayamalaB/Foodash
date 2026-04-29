const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchMenu(category) {
  const url = category ? `${API_URL}/api/menu?category=${category}` : `${API_URL}/api/menu`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch menu');
  return res.json();
}

export async function placeOrder(payload) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to place order');
  }
  return res.json();
}

export async function fetchOrder(id) {
  const res = await fetch(`${API_URL}/api/orders/${id}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

export function subscribeToOrderStatus(orderId, onUpdate, onError) {
  const es = new EventSource(`${API_URL}/api/orders/${orderId}/stream`);
  es.onmessage = (e) => {
    try {
      onUpdate(JSON.parse(e.data));
    } catch (_) {}
  };
  es.onerror = onError;
  return () => es.close();
}
