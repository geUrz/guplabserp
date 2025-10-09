import connection from "@/libs/db"

export default async function handler(req, res) {
  const { id, usuario_id } = req.query; 

  if (req.method === 'GET') {

    if (usuario_id) {

      try {
        const [rows] = await connection.query(
          `SELECT 
                id, 
                usuario_id,
                fila1, 
                fila2, 
                fila3, 
                fila4, 
                fila5, 
                fila6, 
                fila7, 
                logo, 
                web,
                createdAt
              FROM datos_pdf 
          WHERE usuario_id = ?`, [usuario_id]
        )

        /* if (rows.length === 0) {
          return res.status(404).json({ message: 'No se encontraron datos_pdf' })
        } */

          res.status(200).json(rows[0])

        } catch (error) {
          res.status(500).json({ error: error.message });
      }
      return;
  }

    try {
      const [rows] = await connection.query(
        `SELECT
            id, 
            usuario_id,
            fila1, 
            fila2, 
            fila3, 
            fila4, 
            fila5, 
            fila6, 
            fila7, 
            logo, 
            web,
            createdAt
          FROM datos_pdf 
        `)
      res.status(200).json(rows)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { usuario_id, fila1, fila2, fila3, fila4, fila5, fila6, fila7, web } = req.body;
      if ( !usuario_id ) {
        return res.status(400).json({ error: 'Todos los datos son obligatorios' })
      }

      const [result] = await connection.query(
        'INSERT INTO datos_pdf (usuario_id, fila1, fila2, fila3, fila4, fila5, fila6, fila7, web) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [usuario_id, fila1, fila2, fila3, fila4, fila5, fila6, fila7, web]
      )

      const newClient = { id: result.insertId }
      res.status(201).json(newClient)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'PUT') {

    const { fila1, fila2, fila3, fila4, fila5, fila6, fila7, web } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID es obligatorio' })
    }

    try {
      const [result] = await connection.query(
        'UPDATE datos_pdf SET fila1 = ?, fila2 = ?, fila3 = ?, fila4 = ?, fila5 = ?, fila6 = ?, fila7 = ?, web = ? WHERE id = ?',
        [fila1, fila2, fila3, fila4, fila5, fila6, fila7, web, id]
      )

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Dato_pdf no encontrado' })
        }

        res.status(200).json({ message: 'Dato_pdf actualizado correctamente' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
  } else if (req.method === 'DELETE') {
    
    if (!id) {
      return res.status(400).json({ error: 'ID del dato_pdf es obligatorio' })
    }

    else {
      // Eliminar la incidencia por ID
      try {
        const [result] = await connection.query('DELETE FROM datos_pdf WHERE id = ?', [id])

        // Verificar si el anuncio fue eliminado
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Dato_pdf no encontrado' })
        }

        res.status(200).json({ message: 'Dato_pdf eliminado correctamente' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
