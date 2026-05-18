# IMPLEMENTATION GUIDE

This document explains the implementation details of the SYNCUP realtime coaching feed application.

---

# Goal

Build a realtime feed application where:

- Admins can create feeds
- Users can see feeds instantly
- Feed updates happen without page refresh
- GET requests are cached using Redis
- Realtime communication happens using Socket.IO

---

# Core Technologies

| Technology | Purpose |
|---|---|
| Express.js | REST API server |
| MongoDB | Database |
| Redis | Cache layer |
| Socket.IO | Realtime communication |
| Next.js | Frontend application |

---

# Step 1 — Backend Setup

## Create Backend Project

```bash
mkdir backend
cd backend
npm init -y
```

---

# Install Dependencies

```bash
npm install express mongoose cors dotenv socket.io redis
npm install nodemon --save-dev
```

---

# Step 2 — Create Express Server

File:

```txt
backend/server.js
```

Responsibilities:
- Start Express server
- Connect MongoDB
- Initialize Socket.IO
- Register routes

---

# Step 3 — Configure MongoDB

Use Mongoose for MongoDB connection.

Example:

```js
mongoose.connect(process.env.MONGO_URI);
```

---

# Step 4 — Create Feed Model

File:

```txt
models/Feed.js
```

Schema:

```js
{
  message: String
}
```

Use timestamps to automatically generate:

- createdAt
- updatedAt

---

# Step 5 — Configure Redis

File:

```txt
redis/client.js
```

Responsibilities:
- Create Redis client
- Connect Redis
- Export reusable client instance

---

# Why Redis Is Used

GET /feed is frequently requested.

Without Redis:
- Every request hits MongoDB
- Increased DB load

With Redis:
- Frequently requested feed data is stored in memory
- Faster API responses

---

# Step 6 — Implement GET /feed

File:

```txt
routes/feedRoutes.js
```

Flow:

```txt
Request
   ↓
Check Redis
   ↓
Cache Hit?
   ↓
Return Cached Data
   ↓
Else Fetch MongoDB
   ↓
Save Result To Redis
   ↓
Return Response
```

---

# Redis Cache Key

```txt
feeds
```

---

# Cache Hit Logic

```js
const cachedFeeds = await redisClient.get("feeds");
```

If cache exists:

```js
return res.json(JSON.parse(cachedFeeds));
```

---

# Cache Miss Logic

Fetch from MongoDB:

```js
const feeds = await Feed.find().sort({ createdAt: -1 });
```

Store in Redis:

```js
await redisClient.set("feeds", JSON.stringify(feeds));
```

---

# Step 7 — Implement POST /feed

Responsibilities:
- Validate request
- Save feed
- Clear Redis cache
- Emit socket event

---

# Feed Creation Flow

```txt
POST /feed
   ↓
Save To MongoDB
   ↓
Delete Redis Cache
   ↓
Emit Socket Event
   ↓
Return Response
```

---

# Cache Invalidation

Important line:

```js
await redisClient.del("feeds");
```

Why?

Because after creating a new feed, the cached feed list becomes outdated.

This is called:

# Cache Invalidation

---

# Socket Event Emission

```js
io.emit("new-feed", newFeed);
```

Purpose:
- Broadcast new feed to all connected clients instantly

---

# Step 8 — Setup Socket.IO

Socket.IO creates persistent realtime connections between:
- frontend
- backend

---

# Socket Connection Flow

```txt
Frontend Connects
   ↓
Server Accepts Connection
   ↓
Persistent Connection Created
   ↓
Server Can Push Events Anytime
```

---

# Basic Socket Setup

```js
io.on("connection", (socket) => {
  console.log(socket.id);
});
```

---

# Step 9 — Frontend Setup

Create frontend:

```bash
npx create-next-app@latest frontend
```

Install socket client:

```bash
npm install socket.io-client
```

---

# Step 10 — Home Page Implementation

File:

```txt
frontend/app/page.tsx
```

Responsibilities:
- Fetch feeds
- Display feeds
- Listen for realtime updates

---

# Initial Feed Fetch

```js
fetch("http://localhost:5000/feed")
```

---

# Socket Connection

```js
const socket = io("http://localhost:5000");
```

---

# Listen For Events

```js
socket.on("new-feed", callback);
```

Whenever backend emits:
- frontend receives update instantly

---

# Update UI Realtime

```js
setFeeds((prev) => [feed, ...prev]);
```

---

# Step 11 — Admin Page

File:

```txt
frontend/app/admin/page.tsx
```

Responsibilities:
- Input feed message
- Send POST request

---

# Feed Submission

```js
fetch("http://localhost:5000/feed", {
  method: "POST"
})
```

---

# Bonus Implementation

---

# Prevent Duplicate Socket Listeners

Problem:
- React rerenders can create duplicate listeners

Solution:

```js
socket.off("new-feed");
socket.on("new-feed", callback);
```

OR cleanup:

```js
return () => socket.off("new-feed");
```

---

# Reconnect Handling

Socket.IO automatically reconnects.

Optional:

```js
socket.on("connect", () => {
  console.log("Connected");
});
```

---

# Loading State

Add:

```js
const [loading, setLoading] = useState(true);
```

Purpose:
- Better UX
- Better production readiness

---

# Error Handling

Add:

```js
const [error, setError] = useState("");
```

Purpose:
- Prevent application crashes
- Better debugging

---

# Recommended Folder Structure

```txt
backend/
│
├── controllers/
├── models/
├── redis/
├── routes/
├── socket/
├── middleware/
├── utils/
└── server.js
```

---

# Important Concepts Demonstrated

---

# REST APIs

Used for:
- creating feeds
- fetching feeds

---

# Redis Caching

Used for:
- reducing DB load
- improving performance

---

# WebSockets

Used for:
- realtime communication
- instant frontend updates

---

# Event Driven Architecture

Instead of frontend repeatedly asking for updates:

```txt
"Any update?"
"Any update?"
```

Server pushes events automatically.

---

# Scalability Thinking

Future scalability improvements:

- Redis Pub/Sub
- Socket.IO clustering
- Authentication
- Pagination
- Rate limiting
- Message queues

---

# Final Expected Result

## Home Page
- Shows feeds
- Updates instantly

## Admin Page
- Adds feed

## Backend
- Uses MongoDB
- Uses Redis
- Uses Socket.IO

---

# Success Criteria

The project is successful if:

- POST /feed works
- GET /feed uses Redis
- Socket events work
- Frontend updates without refresh
- Cache invalidation works
- Error handling exists

---