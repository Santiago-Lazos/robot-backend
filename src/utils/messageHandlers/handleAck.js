import { notifyClients } from "../../routes/stream.routes.js";

/**
 * Maneja los mensajes de confirmación (ACK)
 * provenientes del robot.
 * Ejemplo de content:
 * {
 *   type: "move",
 *   action: "forward",
 *   state: "completed"
 * }
 */
export function handleAck(content) {
  console.log("✅ ACK recibido:", content);

  notifyClients("ack_received", {
    type: content.type,
    action: content.action,
    state: content.state,
    timestamp: new Date(),
  });
}
