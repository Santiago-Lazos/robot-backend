import OpenAI from 'openai';
import { config } from '../config.js';

export async function analyzeImageWithAI(urlImage) {
  try {
    const openai = new OpenAI({ apiKey: config.openaiApiKey });

    const response = await openai.responses.create({
      model: 'gpt-5-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'Analyze the image' },
            { type: 'input_image', image_url: urlImage }
          ]
        }
      ]
    });

    return response;
  } catch (err) {
    throw new Error(err.message || String(err));
  }
}
