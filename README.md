# SYNCUP - Realtime Coaching Feed Application

A small realtime coaching feed application built using:

- Node.js
- Express.js
- MongoDB
- Redis
- Socket.IO
- Next.js

The application allows admins to create coaching feed updates and instantly broadcast them to all connected users in realtime without refreshing the page.

---

# Features

## Backend
- REST APIs using Express.js
- MongoDB database integration
- Redis caching for feed fetching
- Socket.IO realtime updates
- Cache invalidation handling
- Error handling

## Frontend
- Next.js frontend
- Home page to display feeds
- Admin page to add feeds
- Live realtime updates
- Loading and error states

## Bonus Features
- Socket reconnect handling
- Duplicate socket listener prevention
- Scalable architecture structure

---

# Tech Stack

## Frontend
- Next.js
- React
- TailwindCSS
- socket.io-client

## Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Redis
- Socket.IO

---

# Project Structure

```txt
project/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── redis/
│   ├── routes/
│   ├── socket/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   └── admin/
│   │       └── page.tsx
│   │
│   ├── components/
│   └── package.json
│
└── README.md
```

---

# Application Flow

## Feed Fetch Flow

```txt
Frontend
   ↓
GET /feed
   ↓
Check Redis Cache
   ↓
Cache Hit? → Return Cached Data
   ↓
Cache Miss? → Fetch MongoDB
   ↓
Save Result To Redis
   ↓
Return Response
```

---

## Feed Creation Flow

```txt
Admin Page
   ↓
POST /feed
   ↓
Save Feed To MongoDB
   ↓
Delete Redis Cache
   ↓
Emit Socket Event
   ↓
Connected Clients Receive Update
   ↓
Frontend Updates Instantly
```

# Installation

## Clone Repository

```bash
git clone <repo-url>
```

---

# Backend Setup

## Navigate

```bash
cd backend
```

## Install Dependencies

```bash
npm install
```

## Create .env

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/syncup
```

## Start Backend

```bash
npm run dev
```

---

# Redis Setup

Make sure Redis server is running locally.

Default Redis port:

```txt
6379
```

---

# Frontend Setup

## Navigate

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

## Start Frontend

```bash
npm run dev
```

---

# Realtime Event Name

```txt
new-feed
```

---