import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  robotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Robot'
    // required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['qr', 'sign', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const Image = mongoose.model('Image', ImageSchema);
