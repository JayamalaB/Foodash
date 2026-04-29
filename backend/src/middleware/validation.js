const { body, validationResult } = require('express-validator');

const validateOrder = [
  body('customerName')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('address')
    .trim()
    .notEmpty().withMessage('Delivery address is required')
    .isLength({ min: 5, max: 300 }).withMessage('Address must be 5–300 characters'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[+\d\s\-().]{7,20}$/).withMessage('Invalid phone number format'),

  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),

  body('items.*.menuItemId')
    .notEmpty().withMessage('Each item must have a menuItemId'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateStatusUpdate = [
  body('status').notEmpty().withMessage('Status is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateOrder, validateStatusUpdate };
