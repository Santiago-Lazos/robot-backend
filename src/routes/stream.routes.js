import { Router } from 'express';

const router = Router();

let clients = []; // Lista de conexiones SSE activas

router.get('/', (req, res) => {
  // Configurar cabeceras SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Enviar un "ping" inicial para mantener viva la conexión en proxies como Nginx
  res.write('event: ping\ndata: connected\n\n');

  // Agregar cliente a la lista
  clients.push(res);
  console.log(`🟢 Cliente SSE conectado (${clients.length})`);

  // Limpiar al desconectarse
  req.on('close', () => {
    clients = clients.filter((client) => client !== res);
    console.log(`🔴 Cliente SSE desconectado (${clients.length})`);
  });
});

// Función utilitaria para enviar evento a todos los clientes
export const notifyClients = (eventName, payload) => {
  clients.forEach((res) => {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
};

export default router;
