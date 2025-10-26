<<<<<<< HEAD
import { notifyClients } from "../../routes/stream.routes.js";
import { Log } from "../../models/Log.js";
=======
import { notifyClients } from '../../routes/stream.routes.js';
>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d

/**
 * Maneja los mensajes de error provenientes del robot.
 * Ejemplo de content:
 * {
 *   type: "sensor",
 *   message: "Fallo en sensor ultrasónico"
 * }
 */
<<<<<<< HEAD
export async function handleError(content) {
  try {
    if (!content) {
      throw new Error("Falta el contenido del error (content)");
    }

    const { type, message, robotId } = content;

    if (!type || !message) {
      throw new Error("Faltan campos requeridos: 'type' o 'message'");
    }

    // 1️⃣ Notificar al panel de administración en tiempo real (SSE)
    notifyClients("robot_error", {
      robotId,
      type,
      message,
      timestamp: new Date(),
    });

    // 2️⃣ Guardar el log en MongoDB (colección logs)
    const log = await Log.create({
      timestamp: new Date(),
      level: "error", // según el esquema del Notion
      message: `Error de tipo "${type}": ${message}`,
      robotId: robotId || null,
    });

    console.log(`🧾 Log guardado en MongoDB: ${log.message}`);

    return { ok: true, log };
  } catch (error) {
    console.error("❌ Error al manejar y guardar el log:", error.message);
    return { ok: false, error: error.message };
  }
=======
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
>>>>>>> e0ee653694d35f6458bf39e8fbd8ad9420bf4c3d
}
