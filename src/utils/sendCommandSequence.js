import axios from 'axios';
import { config } from '../config.js';

/**
 * Envía una secuencia completa de comandos al robot.
 * La secuencia será interpretada y ejecutada internamente por el firmware del robot.
 */
export const sendCommandSequence = async (robotId, commands) => {
  try {
    if (!Array.isArray(commands) || commands.length === 0) {
      throw new Error(
        '⚠️ La secuencia de comandos está vacía o no es un array.'
      );
    }

    // Validar formato básico de cada comando
    const invalid = commands.find(
      (cmd) => typeof cmd !== 'object' || !cmd.commandType
    );
    if (invalid) {
      throw new Error(
        '⚠️ La secuencia contiene comandos inválidos (faltan campos).'
      );
    }

    const payload = {
      robotId,
      commandType: 'sequence', // 🧠 indica al robot que recibirá una secuencia
      content: commands
    };

    console.log(
      `🚀 Enviando secuencia de ${commands.length} comandos al robot ${robotId}...`
    );
    console.log(JSON.stringify(payload, null, 2));

    const response = await axios.post(`${config.bridgeUrl}/webhook`, payload, {
      timeout: 10000 // 10s de timeout por si la secuencia es grande
    });

    console.log(
      `✅ Secuencia enviada correctamente. Código ${response.status}`
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando secuencia al robot:', error.message);
    throw error;
  }
};
