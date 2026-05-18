const Feed = require('../models/Feed');
const { redisClient } = require('../redis/client');

// GET /feed - Fetch coaching updates with Redis cache-aside caching
exports.getFeeds = async (req, res) => {
  try {
    const cachedFeeds = await redisClient.get('feeds');
    
    if (cachedFeeds) {
      console.log('⚡ Redis Cache Hit: Served feeds list from cache');
      return res.json(JSON.parse(cachedFeeds));
    }

    console.log('🔌 Redis Cache Miss: Querying feeds from MongoDB...');
    const feeds = await Feed.find().sort({ createdAt: -1 });

    // Cache the retrieved feeds stringified
    await redisClient.set('feeds', JSON.stringify(feeds));
    console.log('💾 Cached fresh feeds list in Redis');

    return res.json(feeds);
  } catch (error) {
    console.error('❌ Error fetching feeds:', error.message);
    return res.status(500).json({ error: 'Failed to retrieve feeds due to a server error.' });
  }
};

// POST /feed - Create a fresh coaching update, invalidate cache, and broadcast event
exports.createFeed = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Feed message cannot be empty.' });
    }

    // 1. Save new feed item to MongoDB database
    const newFeed = new Feed({ message: message.trim() });
    await newFeed.save();
    console.log('📝 Saved new coaching feed message to MongoDB:', newFeed._id);

    // 2. Invalidate cache - Delete "feeds" cache key in Redis so next GET request refreshes
    await redisClient.del('feeds');
    console.log('🧹 Cache Invalidation: Deleted "feeds" key from Redis');

    // 3. Emit real-time broadcast via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      io.emit('new-feed', newFeed);
      console.log('📡 Realtime broadcast: Emitted "new-feed" socket event');
    } else {
      console.warn('⚠️ Socket.IO instance was not attached to Express application. Broadcast skipped.');
    }

    return res.status(201).json(newFeed);
  } catch (error) {
    console.error('❌ Error creating feed:', error.message);
    return res.status(500).json({ error: 'Failed to broadcast and save feed due to a server error.' });
  }
};
