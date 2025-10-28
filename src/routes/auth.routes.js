import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 *  POST /api/auth/signup
 *  Crea un nuevo usuario con rol "operator"
 */
router.post("/signup", async (req, res) => {
  try {
    const { auth0Id, name, email, tenantId } = req.body;

    if (!auth0Id || !email || !name) {
      return res.status(400).json({ message: "Faltan datos obligatorios (auth0Id, name, email)" });
    }

    // Verificar si ya existe un usuario con ese auth0Id o email
    const existingUser = await User.findOne({ $or: [{ auth0Id }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: "El usuario ya existe" });
    }

    // Crear usuario nuevo
    const newUser = await User.create({
      auth0Id,
      name,
      email,
      role: "operator",
      tenantId: tenantId || null
    });

    console.log("🆕 Usuario registrado:", newUser.email);

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: newUser,
    });
  } catch (error) {
    console.error("Error en signup:", error);
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
});

/**
 *  POST /api/auth/login
 *  Verifica si el usuario existe en la base de datos usando auth0Id o email
 */
router.post("/login", async (req, res) => {
  try {
    const { auth0Id, email } = req.body;

    if (!auth0Id && !email) {
      return res.status(400).json({ message: "Debes enviar auth0Id o email" });
    }

    // Buscar usuario por auth0Id si existe, sino por email
    const user = await User.findOne(auth0Id ? { auth0Id } : { email });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado. Por favor, registrate." });
    }

    console.log("Usuario logueado:", user.email);

    res.json({
      message: "Login exitoso",
      user,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

/**
 * PATCH /api/auth/user/:id
 * Actualiza cualquier campo de un usuario por su ID de Mongo
 */
router.patch("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;            // ID de Mongo
    const updates = req.body;             // Objeto con los campos a actualizar

    // Opcional: validar rol si viene en updates
    if (updates.role && !["admin", "operator"].includes(updates.role)) {
      return res.status(400).json({ message: "Rol inválido. Debe ser 'admin' u 'operator'" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }  // Devuelve el usuario actualizado y valida esquema
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


export default router;
