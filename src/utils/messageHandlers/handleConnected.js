import { notifyClients } from "../../routes/stream.routes.js";

/**
 * Maneja el evento cuando el robot se conecta correctamente.
 */
export function handleConnected() {
  console.log("🤖 Robot conectado");

  // Notificar al panel de control y dashboard (SSE)
  notifyClients("robot_connected", {
    status: "connected",
    timestamp: new Date(),
  });
}
