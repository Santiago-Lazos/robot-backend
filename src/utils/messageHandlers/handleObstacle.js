import { notifyClients } from '../../routes/stream.routes.js';
import { handleImage } from './handleImage.js';


export const handleObstacle = async (body) => {
  try {
    const { robotId, content } = body;

    // 1. Notificar a los clientes SSE
    notifyClients('obstacle_detected', {
      robotId,
      timestamp: new Date().toISOString()
    });

    // 2. Ejecutar análisis de imagen
    const imageResult = await handleImage({
      robotId,
      content: content.image
    });

    return {
      status: 'ok',
      reason: 'obstacle_detected',
      imageResult
    };
  } catch (error) {
    console.error('❌ Error al procesar detección de obstáculo:', error);
    throw error;
  }
};
