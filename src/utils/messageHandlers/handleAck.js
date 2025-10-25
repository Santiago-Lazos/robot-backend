import { notifyClients } from '../../routes/stream.routes.js';

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
export function handleAck(robotId, content) {
  if (!content) {
    return { message: 'Falta content en el body JSON.' };
  }

  const { type, action, state } = content;

  if (!type || !action || !state) {
    return { message: 'Faltan type, action o state en el body JSON.' };
  }

  const data = {
    robotId,
    type,
    action,
    state,
    timestamp: new Date()
  };

  notifyClients('ack_received', data);

  return {
    message: 'ACK recibido y notificado por SSE',
    ...data
  };
}
