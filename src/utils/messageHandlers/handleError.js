import { notifyClients } from '../../routes/stream.routes.js';

/**
 * Maneja los mensajes de error provenientes del robot.
 * Ejemplo de content:
 * {
 *   type: "sensor",
 *   message: "Fallo en sensor ultrasónico"
 * }
 */
export async function handleError(robotId, content) {
  if (!content) {
    return { message: 'Falta content en el body JSON.' };
  }

  const { type, message } = content;

  if (!type || !message) {
    return { message: 'Faltan type o message en el body JSON.' };
  }

  // Notificar al panel de administración (SSE)
  notifyClients('robot_error', {
    robotId,
    type,
    message,
    timestamp: new Date()
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

  return {
    message: 'Error recibido y notificado por SSE',
    robotId,
    type,
    message,
    timestamp: new Date()
  };
}
