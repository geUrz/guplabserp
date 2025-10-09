import jwt from "jsonwebtoken";

export default function authMiddleware(handler) {
  return async (req, res) => {
    try {
      const token = req.cookies.myToken;
      if (!token) {
        return res.status(401).json({ error: "No autorizado" });
      }

      console.log("Token recibido:", token); 

      // Verificar el token con la clave secreta
      const decoded = jwt.verify(token, process.env.JWT_SECRET); 
      console.log("Token verificado:", decoded); 

      req.user = decoded; // Asignar el usuario al request

      return handler(req, res);
    } catch (error) {
      console.error("Error al verificar el token:", error.message);
      return res.status(401).json({ error: "Token inválido" });
    }
  };
}
