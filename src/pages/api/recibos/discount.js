import connection from "@/libs/db"

export default async function handler(req, res) {
  const { id } = req.query;
  const { discount } = req.body;

  if (req.method === "GET") {
    // Verificar que el ID esté presente
    if (!id) {
      return res.status(400).json({ error: "ID de recibo es obligatorio" });
    }

    try {
      // Obtener el valor del discount (discount) desde la base de datos
      const [result] = await connection.query(
        "SELECT discount FROM recibos WHERE id = ?",
        [id]
      );

      if (result.length === 0) {
        return res.status(404).json({ error: "Recibo no encontrado" });
      }

      res.status(200).json({ discount: result[0].discount });
    } catch (error) {
      console.error("Error al obtener el discount:", error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "PUT") {
    // Verificar que el id y el discount sean proporcionados
    if (!id || discount === undefined) {
      return res.status(400).json({ error: "ID de recibo y discount son obligatorios" });
    }

    try {
      // Actualizar el discount en la base de datos
      const [result] = await connection.query(
        "UPDATE recibos SET discount = ? WHERE id = ?",
        [discount, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Recibo no encontrado" });
      }

      res.status(200).json({ message: "Descuento actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar el discount:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
