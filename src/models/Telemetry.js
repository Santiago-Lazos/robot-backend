import mongoose from 'mongoose';

const TelemetrySchema = new mongoose.Schema(
  {
    battery: Number,
    action: String,
    payload: Object
  },
  { timestamps: true }
);

export const Telemetry = mongoose.model('Telemetry', TelemetrySchema);


// prueba de proteccion de main