import connection from "@/libs/db";

export default async function handler(req, res) {
    const { id, search } = req.query; // Se añade `id` para la búsqueda por ID

    if (req.method === 'GET') {

        if (id) {
            try {
              const [rows] = await connection.query(`
                SELECT 
                        id, 
                        folio, 
                        cliente_id,
                        cotizacion,
                        nota, 
                        iva,
                        createdAt
                    FROM 
                        cotizaciones
                    WHERE id = ?
                    ORDER BY updatedAt DESC`, [id]
              )
      
              /* if (rows.length === 0) {
                return res.status(404).json({ message: 'Cotización no encontrado' })
              } */
      
              res.status(200).json(rows[0]) // Devolver el evento con los datos del cliente
      
            } catch (error) {
              res.status(500).json({ error: error.message })
            }
            return
          }

          if (search) {
            const searchQuery = `%${search.toLowerCase()}%`
            try {
                const [rows] = await connection.query(
                `SELECT
                    cotizaciones.id, 
                    cotizaciones.folio,  
                    cotizaciones.cliente_id,
                    clientes.nombre AS cliente_nombre,
                    clientes.contacto AS cliente_contacto,
                    cotizaciones.cotizacion,  
                    cotizaciones.nota, 
                    cotizaciones.createdAt 
                FROM cotizaciones
                JOIN clientes ON cotizaciones.cliente_id = clientes.id
                WHERE 
                LOWER(cotizaciones.folio) LIKE ?  
                OR LOWER(clientes.nombre) LIKE ?
                OR LOWER(clientes.contacto) LIKE ?
                OR LOWER(cotizaciones.cotizacion) LIKE ? 
                OR LOWER(cotizaciones.nota) LIKE ?
                OR LOWER(cotizaciones.createdAt) LIKE ?  
                ORDER BY cotizaciones.updatedAt DESC`, 
                [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]
            )
                  
      
              /* if (rows.length === 0) {
                return res.status(404).json({ message: 'No se encontraron cotizaciones' })
              } */
      
              res.status(200).json(rows)
      
            } catch (error) {
              res.status(500).json({ error: 'Error al realizar la búsqueda' })
            }
            return
          }

        try {
            const [rows] = await connection.query(`
                    SELECT 
                        cotizaciones.id, 
                        cotizaciones.folio,
                        cotizaciones.cliente_id,
                        clientes.nombre AS cliente_nombre,
                        clientes.contacto AS cliente_contacto,  
                        cotizaciones.cotizacion,  
                        cotizaciones.iva,  
                        cotizaciones.nota,   
                        cotizaciones.createdAt  
                    FROM cotizaciones
                    JOIN clientes ON cotizaciones.cliente_id = clientes.id
                    ORDER BY cotizaciones.updatedAt DESC`
            )
            /* if (rows.length === 0) {
                return res.status(404).json({ message: 'No se encontraron cotizaciones' })
            } */

            res.status(200).json(rows) // Devolver todos los cotizaciones con los datos de los clientes

        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === 'POST') {
        // Maneja la solicitud POST
        const { folio, cliente_id, cotizacion, iva } = req.body;

        try {
            const [result] = await connection.query(
                'INSERT INTO cotizaciones (folio, cliente_id, cotizacion, iva) VALUES (?, ?, ?, ?)',
                [folio, cliente_id, cotizacion, iva]
            )
            res.status(201).json({ id: result.insertId })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === 'PUT') {

        const { id } = req.query;
        const { cotizacion, cliente_id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID de la cotización es obligatorio' })
        }

        if (cotizacion) {
            try {
                const [result] = await connection.query(
                    'UPDATE cotizaciones SET cotizacion = ?, cliente_id = ? WHERE id = ?',
                    [cotizacion, cliente_id, id]
                )

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Cotización no encontrada' })
                }

                res.status(200).json({ message: 'Cotización actualizada correctamente' })
            } catch (error) {
                res.status(500).json({ error: error.message })
            }
        } else {
            return res.status(400).json({ error: 'Datos insuficientes para actualizar la cotización' })
        }

    } else if (req.method === 'DELETE') {
        // Maneja la solicitud DELETE
        const { id } = req.query;

        try {
            const [result] = await connection.query(
                'DELETE FROM cotizaciones WHERE id = ?',
                [id]
            )

            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'Cotización eliminada correctamente' })
            } else {
                res.status(404).json({ message: 'Cotización no encontrada' })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
}

