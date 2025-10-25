import { notifyClients } from '../../routes/stream.routes.js';

/**
 * Maneja el evento cuando el robot se conecta correctamente.
 */
export function handleConnected(robotId) {
  // Notificar al panel de control y dashboard (SSE)
  notifyClients('robot_connected', {
    robotId,
    timestamp: new Date()
  });

  return {
    robotId,
    message: 'Notificación de robot conectado enviada por SSE',
    timestamp: new Date()
  };
}
