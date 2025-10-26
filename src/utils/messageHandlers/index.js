export { handleAck } from "./handleAck.js";
export { handleConnected } from "./handleConnected.js";
export { handleDisconnected } from "./handleDisconnected.js";
export { handleError } from "./handleError.js";
export { handleImage } from "./handleImage.js";
export { handleObstacle } from "./handleObstacle.js";

// por si llega un tipo desconocido
export function handleUnknown(body) {
  console.log("⚠️ Tipo de mensaje desconocido recibido:", body);
}
