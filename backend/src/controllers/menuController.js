const { menuItems } = require('../models/store');

function getMenu(req, res) {
  const { category } = req.query;
  const items = category
    ? menuItems.filter((i) => i.category.toLowerCase() === category.toLowerCase())
    : menuItems;
  res.json({ items });
}

function getMenuItem(req, res) {
  const item = menuItems.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });
  res.json(item);
}

module.exports = { getMenu, getMenuItem };
