import connection from "@/libs/db"
import bcrypt from "bcrypt"

export default async function handler(req, res) {
  const { id } = req.query;  // Cambiar de req.body a req.query
  const { newPassword } = req.body;

  if (req.method === 'PUT') {
    // Validar que se envíen los parámetros necesarios
    if (!id) {
      return res.status(400).json({ error: "ID del usuario es necesario para actualizar" });
    }

    if (!newPassword) {
      return res.status(400).json({ error: "Se requiere una nueva contraseña" });
    }

    try {
      // Encriptar la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar la contraseña en la base de datos
      const [result] = await connection.query(
        `UPDATE usuarios 
         SET password = ? 
         WHERE id = ?`,
        [hashedPassword, id]
      );

      // Verificar si el usuario fue encontrado y actualizado
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Responder con éxito
      res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
      // Capturar cualquier error en la ejecución y devolver un mensaje adecuado
      res.status(500).json({ error: error.message });
    }
  } else {
    // Si el método no es PUT, devolver un error 405
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
