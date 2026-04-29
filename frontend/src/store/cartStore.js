import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [], // { menuItemId, name, price, image, quantity }

  addItem: (item) => {
    const { items } = get();
    const existing = items.find((i) => i.menuItemId === item.menuItemId);
    if (existing) {
      set({
        items: items.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      set({ items: [...items, { ...item, quantity: 1 }] });
    }
  },

  removeItem: (menuItemId) => {
    set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) });
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity < 1) return get().removeItem(menuItemId);
    set({
      items: get().items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  get total() {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  get itemCount() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));

export default useCartStore;
