import axios from 'axios';
import { config } from '../config.js';

// Pequeño helper para esperar entre comandos
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
        console.log(`➡️ Enviando comando ${i + 1}/${command.length}:`, cmd);
        await sendCommand(robotId, cmd);
        await delay(300); // Espera 300ms entre comandos
      }
      console.log('✅ Todos los comandos enviados.');
      return;
    }

    // Validar estructura del comando individual
    if (!command.type || !command.content) {
      throw new Error(`Comando inválido: falta 'type' o 'content'`);
    }

    const messageContent = {
      robotId,
      commandType: command.type,
      content: command.content
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