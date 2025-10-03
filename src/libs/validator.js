import { z } from 'zod';

export const commandSchema = z.object({
  command: z.enum(['adelante','atras','izquierda','derecha','stop'])
});
