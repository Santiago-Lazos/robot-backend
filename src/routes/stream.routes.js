import { Router } from "express";

const router = Router();
let clients = [];

// Abrir conexión SSE
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  console.log("👂 Cliente conectado al stream SSE");

  clients.push(res);

  req.on("close", () => {
    console.log("❌ Cliente SSE desconectado");
    clients = clients.filter((client) => client !== res);
  });
});

export function notifyClients(event, data) {
  clients.forEach((client) => {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
  console.log(`📢 Evento SSE enviado: ${event}`);
}

console.log("🟢 Esperando conexiones SSE...");

export default router;
