import OpenAI from 'openai';
import { config } from '../config.js';

export async function analyzeImageWithAI(imageInput) {
  try {
    const openai = new OpenAI({ apiKey: config.openaiApiKey });

    // Si se pasa un buffer, convertirlo a base64 data URL
    let imageSource;
    if (Buffer.isBuffer(imageInput)) {
      const base64 = imageInput.toString('base64');
      imageSource = `data:image/jpeg;base64,${base64}`;
    } else {
      imageSource = imageInput; // si es una URL
    }

    const prompt = `
      Tu tarea es analizar una imagen y clasificarla en uno de dos tipos:

      1. "sign": si es una señal o indicación visual (por ejemplo flechas, carteles, pictogramas o símbolos).
        - En este caso, responde con una palabra o frase exacta y estable que describa la indicación, por ejemplo:
          "Flecha izquierda", "Flecha derecha", "Avanzar", "Retroceder", "Carga", "Descarga".
        - Debe ser **siempre la misma respuesta textual para la misma señal visual**, aunque cambie el fondo o el ángulo.

      2. "other": si no parece una señal.
        - En este caso, responde con una descripción breve (máx. 10 palabras) de lo que ves, como:
          "Caja blanca con etiqueta 'Frágil', "Persona", "2 bolsas azules y 3 bolsas verdes".

      Tu salida debe ser un JSON válido con esta estructura:
      {
        "type": "sign" | "other",
        "text": "..."
      }
    `;

    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: imageSource }
          ]
        }
      ],
      // Reforzar consistencia
      temperature: 0,
      max_output_tokens: 150
    });

    // Extraer el texto del modelo
    const text = response.output?.[0]?.content?.[0]?.text ?? '';
    if (!text) throw new Error('Sin respuesta de la IA.');

    // Intentar parsear JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn(
        '⚠️ Respuesta IA no era JSON válido, devolviendo texto plano.'
      );
      parsed = { type: 'other', text };
    }

    // Validar que tenga los campos requeridos
    if (!parsed.type || !parsed.text) {
      parsed = { type: 'other', text };
    }

    return parsed;
  } catch (err) {
    throw new Error(err.message || String(err));
  }
}
