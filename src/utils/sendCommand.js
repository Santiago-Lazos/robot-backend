import axios from 'axios';
import { config } from '../config.js';

// Helper para esperar entre comandos
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const sendCommand = async (robotId, command) => {
  try {
    if (!command) {
      throw new Error('⚠️ No se recibió ningún comando para enviar.');
    }

    // Si es un array de comandos, enviarlos secuencialmente
    if (Array.isArray(command)) {
      console.log(
        `📦 Enviando ${command.length} comandos al robot ${robotId}...`
      );

      for (const [i, cmd] of command.entries()) {
        const delayTime = cmd.content?.time ?? 0;

        console.log(`➡️ Enviando comando ${i + 1}/${command.length}:`, cmd);
        await sendCommand(robotId, cmd);

        if (delayTime > 0) {
          console.log(
            `⏳ Esperando ${delayTime} ms antes del siguiente comando...`
          );
          await delay(delayTime);
        }
      }

      console.log('✅ Secuencia de comandos completada.');
      return;
    }

    // Validar estructura del comando individual
    if (!command.type) {
      throw new Error(`Comando inválido: falta 'type'`);
    }

    // Si no tiene content, asignar objeto vacío por defecto
    const content = command.content ?? {};

    const messageContent = {
      robotId,
      commandType: command.type,
      content
    };

    console.log('🚀 Enviando comando al robot:', messageContent);

    const response = await axios.post(
      `${config.bridgeUrl}/webhook`,
      messageContent,
      {
        timeout: 5000 // 5s de timeout
      }
    );

    console.log(`✅ Comando enviado correctamente. Código ${response.status}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando comando al robot:', error.message);
    throw error;
  }
};
