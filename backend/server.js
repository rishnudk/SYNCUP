require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const { initRedis } = require('./redis/client');
const feedRoutes = require('./routes/feedRoutes');

const app = express();
const server = http.createServer(app);

// 1. Configure Middlewares
app.use(cors({
  origin: '*', // In production, restrict to frontend origin
  methods: ['GET', 'POST']
}));
app.use(express.json());

// 2. Setup Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Expose io instance to routes via Express settings
app.set('socketio', io);

// 3. Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`🔌 Realtime client connected: [Socket ID: ${socket.id}]`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Realtime client disconnected: [Socket ID: ${socket.id}]`);
  });
});

// 4. Register Routes
app.use('/feed', feedRoutes);

// Root route for server verification
app.get('/', (req, res) => {
  res.json({ message: 'SYNCUP Realtime Coaching Feed Server is active!' });
});

// 5. Connect Databases and Boot Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/syncup';

async function bootstrap() {
  try {
    // A. Connect MongoDB
    console.log('📡 Connecting to MongoDB Database...');
    await mongoose.connect(MONGO_URI);
    console.log('💾 Connected to MongoDB successfully');

    // B. Initialize Redis Cache Layer
    await initRedis();

    // C. Start listening
    server.listen(PORT, () => {
      console.log(`🚀 SYNCUP Backend Server is listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Critical bootstrap failure:', err.message);
    process.exit(1);
  }
}

bootstrap();
