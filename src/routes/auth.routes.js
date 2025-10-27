import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 *  POST /api/auth/signup
 * Crea un nuevo usuario con rol "operator"
 */
router.post("/signup", async (req, res) => {
  try {
    const { auth0Id, name, email } = req.body;

    if (!email || !auth0Id) {
      return res.status(400).json({ message: "Faltan datos obligatorios (email, auth0Id)" });
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "El usuario ya existe" });
    }

    // Crear usuario nuevo
    const newUser = await User.create({
      auth0Id,
      name,
      email,
      role: "operator",
    });

    console.log("🆕 Usuario registrado:", newUser.email);

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: newUser,
    });
  } catch (error) {
    console.error(" Error en signup:", error);
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
});

/**
 *  POST /api/auth/login
 * Verifica si el usuario existe en la base de datos
 */
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El email es obligatorio" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado. Por favor, registrate." });
    }

    console.log(" Usuario logueado:", user.email);

    res.json({
      message: "Login exitoso",
      user,
    });
  } catch (error) {
    console.error(" Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

export default router;
