import { notifyClients } from "../../routes/stream.routes.js";

/**
 * Maneja el evento cuando el robot se desconecta.
 */
export function handleDisconnected() {
  console.log("❌ Robot desconectado");

  // Notificar al frontend para actualizar estado
  notifyClients("robot_disconnected", {
    status: "disconnected",
    timestamp: new Date(),
  });
}
