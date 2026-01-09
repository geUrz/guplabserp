import connection from "@/libs/db"
import authMiddleware from "@/middleware/authMiddleware"

export async function handler(req, res) {

    const user = req.user
    if (!user) return

    const { id, negocio_id, search } = req.query;
    const isAdmin = user?.nivel === 'admin'
    const isUsuarioSu = user?.nivel === 'usuariosu'
    const isUsuario = user?.nivel === 'usuario'
    const negocioSolicitado = Number(negocio_id)
    const negocioId = Number(user?.negocio_id)

    if (isUsuario) {
        return res.status(403).json({ error: 'No tienes permiso para accesar' })
    }

    if (req.method === 'GET') {

        if (id) {
            try {
                // Obtener recibo y sus conceptos
                const [rows] = await connection.query(`
                    SELECT 
                        r.id, 
                        r.folio, 
                        r.folioref, 
                        r.usuario_id, 
                        r.usuario_nombre, 
                        r.cliente_id, 
                        r.cliente_nombre, 
                        r.cliente_contacto,
                        c.nombre AS cliente_nombre, 
                        c.contacto AS cliente_contacto, 
                        r.negocio_id, 
                        r.recibo, 
                        r.nota, 
                        r.discount, 
                        r.iva, 
                        r.iva_enabled, 
                        n.negocio AS negocio_nombre,
                        r.createdAt
                    FROM recibos r
                    LEFT JOIN clientes c ON r.cliente_id = c.id
                    LEFT JOIN negocios n ON r.negocio_id = n.id
                    WHERE r.id = ?
                `, [id]);

                const recibo = rows[0];

                // Obtener conceptos del recibo
                const [conceptos] = await connection.query(`
                    SELECT * FROM conceptosrec WHERE recibo_id = ?
                `, [id]);

                // Incluir los conceptos en la respuesta
                recibo.conceptos = conceptos;

                return res.status(200).json(recibo);
            } catch (error) {
                return res.status(500).json({ error: error.message });
            }
        }

        if (search) {
            const searchQuery = `%${search.toLowerCase()}%`

            try {

                const whereClauses = [
                    "LOWER(r.folio) LIKE ?",
                    "LOWER(r.folioref) LIKE ?",
                    "LOWER(r.recibo) LIKE ?",
                    "LOWER(r.usuario_nombre) LIKE ?",
                    "LOWER(c.nombre) LIKE ?",
                    "LOWER(c.contacto) LIKE ?",
                    "LOWER(r.cliente_nombre) LIKE ?",
                    "LOWER(r.cliente_contacto) LIKE ?",
                    "LOWER(r.nota) LIKE ?",
                    "LOWER(con.concepto) LIKE ?"
                ]

                const params = new Array(whereClauses.length).fill(searchQuery)
    
                let whereClause = `(${whereClauses.join(" OR ")})`

                if (!isAdmin && negocioId) {
                    whereClause.push("r.negocio_id = ?")
                    params.push(negocioId)
                }

                const query = `
                    SELECT  
                     r.id,
                     r.folio, 
                     r.folioref, 
                     r.usuario_id, 
                     r.usuario_nombre, 
                     r.cliente_id, 
                     r.cliente_nombre,
                     r.cliente_contacto,
                     c.nombre AS cliente_nombre, 
                    c.contacto AS cliente_contacto,
                     r.negocio_id,
                     r.recibo,
                     r.nota,
                     r.discount,
                     r.iva,
                     r.iva_enabled,
                     n.negocio AS negocio_nombre,
                     r.createdAt
                    FROM recibos r
                    LEFT JOIN clientes c ON r.cliente_id = c.id
                    LEFT JOIN negocios n ON r.negocio_id = n.id
                    LEFT JOIN conceptosrec con ON r.id = con.recibo_id
                    WHERE ${whereClause}
                    GROUP BY r.id
                    ORDER BY r.updatedAt DESC
                `

                const [rows] = await connection.query(query, params)

                for (const recibo of rows) {
                    const [conceptos] = await connection.query(`
                        SELECT * FROM conceptosrec WHERE recibo_id = ?
                    `, [recibo.id]);

                    recibo.conceptos = conceptos
                }

                return res.status(200).json(rows)

            } catch (error) {
                res.status(500).json({ error: 'Error al realizar la búsqueda' })
            }
        }

        if (negocio_id) {

            if (!isAdmin && negocioSolicitado !== negocioId) {
                return res.status(403).json({ error: 'No tienes permiso para accesar' })
            }

            try {
                const [rows] = await connection.query(
                `SELECT 
                  r.id,
                  r.folio, 
                  r.folioref, 
                  r.usuario_id, 
                  r.usuario_nombre, 
                  r.cliente_id, 
                  r.cliente_nombre,
                  r.cliente_contacto,
                  c.nombre AS cliente_nombre, 
                  c.contacto AS cliente_contacto,
                  r.negocio_id,
                  r.recibo,
                  r.nota,
                  r.discount,
                  r.iva,
                  r.iva_enabled,
                  n.negocio AS negocio_nombre,
                  r.createdAt
                FROM recibos r
                LEFT JOIN clientes c ON r.cliente_id = c.id
                LEFT JOIN negocios n ON r.negocio_id = n.id
                  WHERE r.negocio_id = ?
                  ORDER BY r.updatedAt DESC`,
                    [negocio_id]
                )

                for (const recibo of rows) {
                    const [conceptos] = await connection.query(`
                        SELECT * FROM conceptosrec WHERE recibo_id = ?
                    `, [recibo.id]);

                    recibo.conceptos = conceptos
                }

                res.status(200).json(rows)
            } catch (error) {
                res.status(500).json({ error: error.message })
            }

        } else {

            if (!isAdmin) {
                return res.status(403).json({ error: 'No tienes permiso para accesar' })
            }

            try {
                const [rows] = await connection.query(`
                SELECT 
                  r.id,
                  r.folio, 
                  r.folioref, 
                  r.usuario_id, 
                  r.usuario_nombre, 
                  r.cliente_id, 
                  r.cliente_nombre,
                  r.cliente_contacto,
                  c.nombre AS cliente_nombre,
                  c.contacto AS cliente_contacto,
                  r.negocio_id,
                  r.recibo,
                  r.nota,
                  r.discount,
                  r.iva,
                  r.iva_enabled,
                  n.negocio AS negocio_nombre,
                  r.createdAt
                FROM recibos r
                LEFT JOIN clientes c ON r.cliente_id = c.id
                LEFT JOIN negocios n ON r.negocio_id = n.id
                ORDER BY r.updatedAt DESC`)

                for (const recibo of rows) {
                    const [conceptos] = await connection.query(`
                        SELECT * FROM conceptosrec WHERE recibo_id = ?
                    `, [recibo.id]);

                    recibo.conceptos = conceptos
                }

                res.status(200).json(rows)

            } catch (error) {
                res.status(500).json({ error: error.message })
            }

        }

    } else if (req.method === 'POST') {

        const { usuario_id, usuario_nombre, folio, cliente_id, recibo, nota, folioref, iva, iva_enabled } = req.body;

        try {
            const [result] = await connection.query(
                'INSERT INTO recibos (usuario_id, usuario_nombre, folio, cliente_id, recibo, nota, folioref, iva, iva_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [usuario_id, usuario_nombre, folio, cliente_id, recibo, nota, folioref, iva, iva_enabled]
            )
            res.status(201).json({ id: result.insertId })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === 'PUT') {

        const { id } = req.query;
        const { recibo, cliente_id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID del recibo es obligatorio' })
        }

        if (recibo) {
            try {
                const [result] = await connection.query(
                    'UPDATE recibos SET cliente_id = ?, recibo = ? WHERE id = ?',
                    [cliente_id, recibo, id]
                )

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Recibo no encontrado' })
                }

                res.status(200).json({ message: 'Recibo actualizado correctamente' })
            } catch (error) {
                res.status(500).json({ error: error.message })
            }
        } else {
            return res.status(400).json({ error: 'Datos insuficientes para actualizar el recibo' })
        }

    } else if (req.method === 'DELETE') {
        // Maneja la solicitud DELETE
        const { id } = req.query;

        try {
            const [result] = await connection.query(
                'DELETE FROM recibos WHERE id = ?',
                [id]
            )

            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'Recibo eliminado correctamente' })
            } else {
                res.status(404).json({ message: 'Recibo no encontrado' })
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
}

export default authMiddleware(handler)
