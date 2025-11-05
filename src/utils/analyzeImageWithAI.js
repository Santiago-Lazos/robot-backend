import OpenAI from 'openai';
import { config } from '../config.js';

const AnalysisSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['sign', 'other'] },
    text: { type: 'string' }
  },
  required: ['type', 'text'],
  additionalProperties: false
};

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
      Analiza esta imagen y devuelve un objeto JSON con la estructura:
      {
        "type": "sign" | "other",
        "text": string
      }

      1. "sign": si es una señal o indicación visual (por ejemplo flechas, carteles, pictogramas o símbolos) que indique una acción o dirección.
        - En este caso, responde con una palabra o frase exacta y estable que describa la indicación. Puede ser:
          "Izquierda", "Derecha", "Retroceder", "Iniciar" o "Detener". Si no es ninguna de ellas, la imagen es de tipo "other".
        - Debe ser **siempre la misma respuesta textual para la misma señal visual**, aunque cambie el fondo o el ángulo.
        - Si identificas la palabra "Start", "Iniciar" o "Comenzar", la imagen es de tipo "Iniciar".

      2. "other": si no parece una señal o no coincide con ninguna de las indicaciones mencionadas.
        - En este caso, responde con una descripción breve (máx. 10 palabras) de lo que ves, como:
          "Caja blanca con etiqueta 'Frágil', "Persona", "2 bolsas azules y 3 bolsas verdes".

      Tu salida debe ser un JSON válido con esta estructura:
      {
        "type": "sign" | "other",
        "text": "..."
      }
    `;

    const response = await openai.responses.parse({
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
      text: {
        format: {
          type: 'json_schema',
          name: 'image_analysis',
          schema: AnalysisSchema,
          strict: true
        }
      }
    });

    // Intentar parsear JSON
    let parsed;
    try {
      parsed = JSON.parse(response.output_text);
    } catch {
      console.warn(
        '⚠️ Respuesta IA no era JSON válido, devolviendo texto plano.'
      );
      parsed = { type: 'other', text: response.output_text };
    }

    // Validar que tenga los campos requeridos
    if (!parsed.type || !parsed.text) {
      parsed = { type: 'other', text: response.output_text };
    }

    return parsed;
  } catch (err) {
    if (err.status === 401) {
      throw new Error(
        'Error de autenticación con OpenAI. Verifique la clave de API'
      );
    }

    throw new Error(err.message || String(err));
  }
}
