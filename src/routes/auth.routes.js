import express from "express";
import User from "../models/User.js";
import { checkRole } from "../middlewares/checkRole.js";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

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

// PROTEGIDO CON MIDDLEWARE DE ROL
// Solo los operadores pueden acceder al panel del robot
router.post("/access-operator", checkRole(["operator"]), (req, res) => {
  res.json({
    message: "Acceso permitido al panel del operador",
    user: req.user,
    role: req.user.role
  });
});

// Solo los administradores pueden acceder al panel de administración
router.post("/access-admin", checkRole(["admin"]), (req, res) => {
  res.json({
    message: "Acceso permitido al panel del administrador",
    user: req.user,
    role: req.user.role
  });
});
router.post("/generate-token", checkRole(["admin"]), async (req, res) => {
  try {
    const user = req.user; 
    // Generamos un token con expiración corta
    const token = jwt.sign(
      {
        auth0Id: user.auth0Id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "5m" } // dura 5 minutos
    );

    res.json({ token });
  } catch (err) {
    console.error("Error generando token:", err);
    res.status(500).json({ message: "Error generando token" });
  }
});

router.post("/validate-token", (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token faltante" });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    console.error("Error validando token:", err);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
});

export default router;
