import { Router } from "express";

const router = Router();

let clients = []; // Lista de conexiones SSE activas

/**
 * GET /api/stream
 * Establece una conexión SSE (Server-Sent Events) con el frontend.
 * Permite enviar eventos en tiempo real a todos los clientes conectados.
 */
router.get("/", (req, res) => {
  // Configurar cabeceras SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.(); // Algunos servidores (como Express 5) soportan flushHeaders()

  // Enviar un "ping" inicial para mantener la conexión activa
  res.write("event: ping\ndata: connected\n\n");

  // Agregar cliente a la lista
  clients.push(res);
  console.log(`🟢 Cliente SSE conectado (${clients.length} activos)`);

  // Cuando el cliente se desconecta
  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
    console.log(`🔴 Cliente SSE desconectado (${clients.length} restantes)`);
  });
});

/**
 * Enviar evento a todos los clientes conectados
 * @param {string} eventName - Nombre del evento (ej: 'new_image', 'robot_connected')
 * @param {object} payload - Datos a enviar
 */
export const notifyClients = (eventName, payload) => {
  const data = JSON.stringify(payload);
  clients.forEach((res) => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${data}\n\n`);
  });
  console.log(`📡 Evento enviado: '${eventName}' → ${clients.length} clientes`);
};

// Log al iniciar el servidor
console.log("🟢 Esperando conexiones SSE en /api/stream...");

export default router;
