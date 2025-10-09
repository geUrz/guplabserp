import connection from "@/libs/db"
import authMiddleware from "@/middleware/authMiddleware";

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
        return res.status(403).json({ error: 'No tienes permiso para accesar' });
    } 

    if (req.method === 'GET') {

        if (id) {
            const [rows] = await connection.query(`SELECT * FROM recibos WHERE id = ?`, [id]);
            const recibo = rows[0];

            return res.status(200).json(recibo);
        }

        if (search) {
            const searchQuery = `%${search.toLowerCase()}%`

            try {

                const whereClauses = [
                    "LOWER(r.folio) LIKE ?",
                    "LOWER(r.folioref) LIKE ?",
                    "LOWER(r.recibo) LIKE ?",
                    "LOWER(r.cliente_nombre) LIKE ?",
                    "LOWER(r.cliente_contacto) LIKE ?",
                    "LOWER(r.nota) LIKE ?",
                    "LOWER(r.conceptosrec.concepto) LIKE ?"
                ]

                const params = [
                    searchQuery, searchQuery, searchQuery, searchQuery,
                    searchQuery, searchQuery, searchQuery
                ]

                if (!isAdmin && negocioId) {
                    whereClause += ` AND u.negocio_id = ?`;
                    params.push(negocioId);
                }

                const query = `
                SELECT  
                  r.id,
                  r.folio, 
                  r.folioref, 
                  r.usuario_id, 
                  r.cliente_id, 
                  r.cliente_nombre,
                  r.cliente_contacto,
                  r.negocio_id,
                  r.negocio_nombre,
                  r.recibo,
                  r.nota,
                  r.iva,
                  r.conceptosrec.concepto,
                  r.createdAt
                FROM usuarios u
                LEFT JOIN negocios n ON u.negocio_id = n.id
                 WHERE ${whereClause}
                 ORDER BY u.updatedAt DESC
              `;

                const [rows] = await connection.query(query, params);
                return res.status(200).json(rows)

            } catch (error) {
                res.status(500).json({ error: 'Error al realizar la búsqueda' });
            }
            return;
        }

        try {
            const [rows] = await connection.query(`
                SELECT 
                  r.id, 
                  r.usuario_id, 
                  r.folio, 
                  r.cliente_id, 
                  r.cliente_nombre,
                  r.cliente_contacto,
                  r.recibo,
                  r.nota,  
                  r.folioref,
                  r.iva,
                  r.createdAt
                FROM recibos
                JOIN clientes ON recibos.cliente_id = clientes.id
                ORDER BY recibos.updatedAt DESC`);

            res.status(200).json(rows)

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'POST') {

        const { usuario_id, folio, cliente_id, recibo, nota, folioref, iva } = req.body;

        try {
            const [result] = await connection.query(
                'INSERT INTO recibos (usuario_id, folio, cliente_id, recibo, nota, folioref, iva) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [usuario_id, folio, cliente_id, recibo, nota, folioref, iva]
            );
            res.status(201).json({ id: result.insertId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'PUT') {

        const { id } = req.query;
        const { recibo, cliente_id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID del recibo es obligatorio' });
        }

        if (recibo) {
            try {
                const [result] = await connection.query(
                    'UPDATE recibos SET cliente_id = ?, recibo = ? WHERE id = ?',
                    [cliente_id, recibo, id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Recibo no encontrado' });
                }

                res.status(200).json({ message: 'Recibo actualizado correctamente' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        } else {
            return res.status(400).json({ error: 'Datos insuficientes para actualizar el recibo' });
        }

    } else if (req.method === 'DELETE') {
        // Maneja la solicitud DELETE
        const { id } = req.query;

        try {
            const [result] = await connection.query(
                'DELETE FROM recibos WHERE id = ?',
                [id]
            );

            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'Recibo eliminado correctamente' });
            } else {
                res.status(404).json({ message: 'Recibo no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}

export default authMiddleware(handler)
