import { notifyClients } from "../../routes/stream.routes.js";
import mongoose from "mongoose";
import { config } from "../../config.js";

/**
 * Maneja los mensajes de error provenientes del robot.
 * Ejemplo de content:
 * {
 *   type: "camera",
 *   message: "Fallo de inicialización"
 * }
 */
export function handleError(content) {
  console.error("🚨 Error recibido del robot:", content);

  // Notificar al panel de administración (SSE)
  notifyClients("robot_error", {
    type: content.type,
    message: content.message,
    timestamp: new Date(),
  });

  // (Opcional) Guardar en logs de MongoDB
  // if (mongoose.connection.readyState === 1) {
  //   const Log = mongoose.model("Log", new mongoose.Schema({
  //     type: String,
  //     message: String,
  //     timestamp: Date,
  //   }));
  //   Log.create({ ...content, timestamp: new Date() });
  // }
}
