import connection from "@/libs/db"; // Conexión a la base de datos

export default async function handler(req, res) {
  const { id } = req.query;
  const { iva } = req.body; // El IVA nuevo que se desea actualizar

  if (req.method === "PUT") {
    // Verificar que el id y el IVA sean proporcionados
    if (!id || iva === undefined) {
      return res.status(400).json({ error: "ID de la recibo y IVA son obligatorios" });
    }

    try {
      // Actualizar el IVA en la base de datos
      const [result] = await connection.query(
        "UPDATE recibos SET iva = ? WHERE id = ?",
        [iva, id]
      );

      // Verificar si la recibo fue encontrada y actualizada
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Recibo no encontrada" });
      }

      res.status(200).json({ message: "IVA actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar IVA:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    // Si no es un método PUT, devolver un error
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
