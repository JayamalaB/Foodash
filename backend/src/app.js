require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();



app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://foodash-frontend.onrender.com'  // your Render frontend URL
  ]
}));
app.use(express.json());

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
