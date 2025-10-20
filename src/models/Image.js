// ===============================
// src/models/Image.js
// ===============================
import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    robotId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['qr', 'sign', 'other'],
      default: 'other',
    },
    description: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

export const Image = mongoose.model('Image', ImageSchema);
