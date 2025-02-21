const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub-schema for media items with enhanced validation
const mediaSchema = new Schema({
  url: {
    type: String,
    required: [true, 'Media URL is required'],
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  type: {
    type: String,
    required: [true, 'Media type is required'],
    enum: {
      values: ['image', 'video'],
      message: '{VALUE} is not a valid media type'
    }
  }
}, { _id: false });

// Sub-schema for comments with improved structure
const commentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, { _id: true });

// Main post schema with comprehensive validation
const postSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    validate: {
      validator: (v) => mongoose.isValidObjectId(v),
      message: 'Invalid user ID format'
    }
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  avatar: {
    type: String,
    required: [true, 'Avatar URL is required'],
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid avatar URL!`
    }
  },
  text: {
    type: String,
    required: function() {
      return this.mediaUrl.length === 0;
    },
    trim: true,
    maxlength: [2200, 'Post text cannot exceed 2200 characters']
  },
  mediaUrl: {
    type: [mediaSchema],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: 'Cannot upload more than 10 media items'
    }
  },
  mediaType: {
    type: String,
    required: function() {
      return this.mediaUrl.length > 0;
    },
    enum: {
      values: ['image', 'video', null],
      message: '{VALUE} is not a valid media type'
    },
    default: null
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  comments: {
    type: [commentSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
postSchema.index({ createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Query helper for media filtering
postSchema.query.byMediaType = function(type) {
  return this.where('mediaType').equals(type);
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;