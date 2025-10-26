import { Log } from "../models/Log.js";

/**
 * Guarda un error o mensaje en la colección Logs de MongoDB.
 * @param {Object} data
 * @param {string} data.message - Mensaje principal del log.
 * @param {string} [data.stack] - Stack del error.
 * @param {string} [data.source] - Origen del error (por ejemplo: webhook, MQTT, etc).
 * @param {string} [data.level] - Nivel del log (error, warning, info).
 */
export const saveLog = async ({ message, stack = "", source = "backend", level = "error" }) => {
  try {
    const log = new Log({ message, stack, source, level });
    await log.save();
    console.log(`🧾 Log guardado: ${message}`);
  } catch (err) {
    console.error("❌ Error al guardar log:", err.message);
  }
};
