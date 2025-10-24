export { handleAck } from "./handleAck.js";
export { handleConnected } from "./handleConnected.js";
export { handleDisconnected } from "./handleDisconnected.js";
export { handleError } from "./handleError.js";

// por si llega un tipo desconocido
export function handleUnknown(body) {
  console.log("⚠️ Tipo de mensaje desconocido recibido:", body);
}
