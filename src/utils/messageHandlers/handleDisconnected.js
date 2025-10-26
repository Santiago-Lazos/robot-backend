import { notifyClients } from '../../routes/stream.routes.js';

/**
 * Maneja el evento cuando el robot se desconecta.
 */
export function handleDisconnected(robotId) {
  // Notificar al frontend para actualizar estado
  notifyClients('robot_disconnected', {
    robotId,
    timestamp: new Date()
  });

  return {
    robotId,
    message: 'Notificación de robot desconectado enviada por SSE',
    timestamp: new Date()
  };
}
