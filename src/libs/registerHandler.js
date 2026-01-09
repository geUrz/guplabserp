import connection from "@/libs/db";
import bcrypt from "bcrypt";

export default async function registerHandler(req, res) {
  try {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ error: `Método ${req.method} no permitido` });
    }

    const {
      folio,
      nombre,
      usuario,
      email,
      nivel,
      negocio_id,
      negocio_nombre,
      isactive,
      password,
    } = req.body;

    if (!folio || !nombre || !usuario || !isactive || !password) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    let existingUserQuery = "SELECT * FROM usuarios WHERE usuario = ?";
    let existingUserParams = [usuario];

    if (email) {
      existingUserQuery =
        "SELECT * FROM usuarios WHERE email = ? OR usuario = ?";
      existingUserParams = [email, usuario];
    }

    const [existingUser] = await connection.query(
      existingUserQuery,
      existingUserParams
    );

    if (existingUser && existingUser.length > 0) {
      let errorMsg = "¡ El usuario ya está registrado !";
      if (email && existingUser[0].email === email) {
        errorMsg = "¡ El correo ya está registrado !";
      }
      return res.status(400).json({ error: errorMsg });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      "INSERT INTO usuarios (folio, nombre, usuario, email, nivel, negocio_id, negocio_nombre, isactive, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        folio,
        nombre,
        usuario,
        email,
        nivel,
        negocio_id,
        negocio_nombre,
        isactive,
        hashedPassword,
      ]
    );

    return res
      .status(201)
      .json({
        message: "Usuario registrado exitosamente",
        userId: result.insertId,
      });
  } catch (error) {
    console.error("🚨 Error inesperado en la API:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
