const mongoose = require('mongoose');

const FeedSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Feed message is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Feed', FeedSchema);
