// middlewares/checkRole.js
import User from "../models/User.js";

export const checkRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const { auth0Id } = req.body;

      if (!auth0Id) {
        console.error("Falta auth0Id en la solicitud");
        return res.status(400).json({ message: "Falta auth0Id en la solicitud" });
      }

      const user = await User.findOne({ auth0Id });
      if (!user) {
        console.error("Usuario no encontrado para auth0Id:", auth0Id);
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Guardamos el usuario para los middlewares siguientes
      req.user = user;

      if (!allowedRoles.includes(user.role)) {
        console.error(`Acceso denegado. Rol '${user.role}' no autorizado.`);
        return res.status(403).json({
          message: `Acceso denegado. Rol '${user.role}' no autorizado.`,
          role: user.role, // ✅ devolvemos el rol real del usuario
        });
      }

      console.log(`Acceso concedido para usuario '${user.email}' con rol '${user.role}'`);
      next();
    } catch (err) {
      console.error("Error en middleware de rol:", err);
      res.status(500).json({ message: "Error verificando rol" });
    }
  };
};
