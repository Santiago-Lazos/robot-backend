import { Router } from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { File } from 'node:buffer';
import { config } from '../config.js';
import { sendCommand } from '../utils/sendCommand.js';
import { sendCommandSequence } from '../utils/sendCommandSequence.js';

const router = Router();
const upload = multer();
const openai = new OpenAI({ apiKey: config.openaiApiKey });

/**
 * Endpoint que recibe audio, lo transcribe y genera comandos JSON válidos.
 */
router.post('/voice-command', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'No se recibió el archivo de audio.' });
    }

    console.log('🎧 Audio recibido:', req.file.originalname, req.file.mimetype);

    // 1️⃣ Convertir buffer a File válido
    const file = new File([req.file.buffer], req.file.originalname, {
      type: req.file.mimetype || 'audio/webm'
    });

    // 2️⃣ Transcribir audio con Whisper
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'gpt-4o-mini-transcribe'
    });

    const text = transcription.text.trim();
    console.log('🗣️ Transcripción:', text);

    // 3️⃣ Si la transcripción está vacía, no seguir
    if (!text) {
      return res.json({
        ok: false,
        message: 'No se detectó voz o el audio está vacío.'
      });
    }

    // 4️⃣ Pedir a la IA que construya el comando
    const prompt = `
      Sos un analizador de comandos de voz para un robot autónomo. Transformá esta instrucción hablada en comandos JSON válidos.

      Comandos válidos:
      - take_photo → no lleva content.
      - tilt → { direction: "up" | "down", time?: ms }.
      - lift → { direction: "up" | "down", time?: ms }.
      - move → { direction: "forward" | "backward", time?: ms }.
      - turn → { direction: "left" | "right", time?: ms }.

      Reglas:
      - Devolvé un JSON válido con la propiedad "commands"
      - "commands" debe ser un array de comandos.
      - Siempre devolvé un array, incluso si es de un solo comando.
      - Siempre devolvé un array vacío si no se entiende la instrucción.
      - Los comandos dentro del array "commands" deben representarse como objetos con la propiedad "commandType" y "content", como se indicó en la lista de comandos válidos.
      - Si hay varios pasos, devolvé un array de comandos.
      - Si el usuario dice “durante X segundos” o similar, convertí la cantidad de tiempo a milisegundos.
      - Si no hay tiempo, omitilo.
      - Si no se entiende la instrucción, devolvé el array vacío.
      - No incluyas explicaciones, solo JSON.

      Ejemplos:
      "Avanza dos segundos y gira a la izquierda" =>
      {
        "commands": [
          { "commandType": "move", "content": { "direction": "forward", "time": 2000 } },
          { "commandType": "turn", "content": { "direction": "left", "time": 500 } }
        ]
      }

      "Eleva la torre" =>
      { "commands": [ { "commandType": "lift", "content": { "direction": "up" } } ]}

      "Me gusta el helado" => { "commands": [] }

      Texto: "${text}"
      `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Respondé estrictamente en formato JSON válido. No agregues texto ni explicaciones.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const raw = completion.choices[0].message.content;
    console.log('🧠 Respuesta IA:', raw);

    let response;
    try {
      response = JSON.parse(raw);
    } catch {
      console.warn('⚠️ No se pudo parsear JSON válido de la IA.');
      return res.json({
        ok: false,
        transcription: text,
        message: 'No se pudo interpretar un comando válido de la voz.'
      });
    }

    // 5️⃣ Si IA devolvió "none" → ignorar
    if (!response?.commands || response.commands.length === 0) {
      return res.json({
        ok: false,
        transcription: text,
        message: 'No se detectó ningún comando válido en la voz.'
      });
    }

    const normalizeCommand = (cmd) => ({
      type: cmd.commandType || cmd.type,
      content: cmd.content || {}
    });

    const robotId = '68faa22f17d51b1089c1f1d5';

    // 6️⃣ Identificar si es secuencia o comando simple y enviar
    if (response?.commands?.length > 1) {
      console.log('📡 Enviando secuencia de comandos...');
      await sendCommandSequence(robotId, response.commands);
    } else if (response?.commands?.length === 1) {
      const normalized = normalizeCommand(response.commands[0]);
      console.log('📡 Enviando comando único...');
      await sendCommand(robotId, normalized);
    } else {
      console.warn('⚠️ No se detectó estructura de comando válida.');
      return res.json({
        ok: false,
        transcription: text,
        message: 'El comando generado no tiene estructura válida.'
      });
    }

    // 8️⃣ Responder al frontend
    res.json({
      ok: true,
      transcription: text,
      command: response
    });
  } catch (error) {
    console.error('❌ Error procesando el comando de voz:', error);
    res.status(500).json({ error: 'Error al procesar el comando de voz' });
  }
});

export default router;
