import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  level: {
    type: String,
    enum: ["info", "error"],
    required: true,
  },
  message: {
    type: String,
    required: false,
  },
  robotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Robot",
    required: false,
  },
});

export const Log = mongoose.model("Log", logSchema);
