import { z } from "zod";

// Esquema de validación para comandos del robot
export const commandSchema = z.object({
  command: z.enum([
    // Movimiento
    "move_forward",
    "move_backward",

    // Giros
    "turn_left",
    "turn_right",

    // Torre
    "lift_up",
    "lift_down",

    // Inclinación
    "tilt_up",
    "tilt_down",

    // Modo
    "mode_manual",
    "mode_auto",

    // Control general
    "stop",
    "start",
    "connect",
    "disconnect"
  ])
});
