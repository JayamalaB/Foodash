# 🍕 FooDash — Order Management App

A full-stack food delivery order management system built with **React + Vite** (frontend) and **Node.js + Express** (backend).

## Features

- 🍔 Browse menu with food items, descriptions, prices, and images
- 🛒 Add/remove items from cart with quantity control
- 📦 Place orders with delivery details
- 🔄 Real-time order status updates (simulated via SSE)
- ✅ Full test suite (Jest + Supertest for API, Vitest for UI)

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Zustand, TailwindCSS |
| Backend | Node.js, Express, UUID |
| Testing | Jest, Supertest (API), Vitest, React Testing Library (UI) |
| Real-time | Server-Sent Events (SSE) |

## Project Structure

```
foodash/
├── backend/          # Express REST API
│   └── src/
│       ├── routes/       # API route definitions
│       ├── controllers/  # Business logic
│       ├── models/       # In-memory data store
│       ├── middleware/   # Validation, error handling
│       └── tests/        # Jest + Supertest tests
└── frontend/         # React + Vite SPA
    └── src/
        ├── components/   # Reusable UI components
        ├── pages/        # Route-level page components
        ├── hooks/        # Custom React hooks
        └── store/        # Zustand global state
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev        # Development server on :3001
npm test           # Run API tests
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # Development server on :5173
npm test           # Run component tests
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/menu | Get all menu items |
| POST | /api/orders | Place a new order |
| GET | /api/orders/:id | Get order by ID |
| PATCH | /api/orders/:id/status | Update order status |
| GET | /api/orders/:id/stream | SSE stream for real-time status |

## Environment Variables

Backend `.env`:
```
PORT=3001
NODE_ENV=development
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:3001
```
