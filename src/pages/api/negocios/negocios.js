import connection from "@/libs/db"
import authMiddleware from "@/middleware/authMiddleware";

export async function handler(req, res) {

    const user = req.user
    if (!user) return

    const { id, search } = req.query;
    const isAdmin = user?.nivel === 'admin'
    
    if (!isAdmin) {
        return res.status(403).json({ error: "No tienes permiso para accesar" });
    }  

    if (req.method === 'GET') {

        if (id) {
            try {
                const [rows] = await connection.query(`
                    SELECT 
                        id, 
                        folio, 
                        negocio, 
                        cel, 
                        direccion, 
                        email  
                    FROM negocios
                    WHERE id = ?
                `, [id])

                if (rows.length === 0) {
                    return res.status(404).json({ error: 'Negocio no encontrado' })
                }

                res.status(200).json(rows[0])
            } catch (error) {
                res.status(500).json({ error: error.message })
            }

        }

        if (search) {
            const searchQuery = `%${search.toLowerCase()}%`;
          
            try {
    
              const whereClauses = [
                "LOWER(n.folio) LIKE ?",
                "LOWER(n.negocio) LIKE ?",
                "LOWER(n.cel) LIKE ?",
                "LOWER(n.direccion) LIKE ?",
                "LOWER(n.email) LIKE ?",
                "LOWER(CAST(n.createdAt AS CHAR)) LIKE ?"
              ];
          
              const params = Array(whereClauses.length).fill(searchQuery);
          
              const query = `
                SELECT
                  n.id,
                  n.folio,
                  n.negocio,
                  n.cel,
                  n.direccion,
                  n.email
                FROM negocios n
                WHERE (${whereClauses.join(" OR ")})
                ORDER BY n.updatedAt DESC
              `;
          
              const [rows] = await connection.query(query, params);
              return res.status(200).json(rows);
          
            } catch (error) {
              console.error(error);
              return res.status(500).json({ error: 'Error al realizar la búsqueda' });
            }                    

        } else {

            try {
                const [rows] = await connection.query(`
                        SELECT 
                            id, 
                            folio, 
                            negocio, 
                            cel, 
                            direccion, 
                            email  
                        FROM negocios
                        ORDER BY updatedAt DESC`);
                res.status(200).json(rows)
            } catch (error) {
                res.status(500).json({ error: error.message })
            }

        }

    } else if (req.method === 'POST') {
        try {
            const { folio, negocio, cel, direccion, email } = req.body

            if (!isAdmin) {
                return res.status(403).json({ error: 'No tienes permiso para accesar.' });
            }

            if (!negocio) {
                return res.status(400).json({ error: 'Todos los datos son obligatorios' })
            }

            const [result] = await connection.query('INSERT INTO negocios (folio, negocio, cel, direccion, email) VALUES (?, ?, ?, ?, ?)', [folio, negocio, cel, direccion, email])
            const newClient = { id: result.insertId }
            res.status(201).json(newClient)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === 'PUT') {

        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'ID del negocio es obligatorio' })
        }

        const { negocio, cel, direccion, email } = req.body

        if (!negocio) {
            return res.status(400).json({ error: 'Todos los datos son obligatorios' })
        }

        try {
            const [result] = await connection.query('UPDATE negocios SET negocio = ?, cel = ?, direccion = ?, email = ? WHERE id = ?', [negocio, cel, direccion, email, id])

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Negocio no encontrado' })
            }

            res.status(200).json({ message: 'Negocio actualizado correctamente' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === 'DELETE') {

        const { id } = req.query;


        if (!id) {
            return res.status(400).json({ error: 'ID del negocio es obligatorio' })
        }

        try {

            const [result] = await connection.query('DELETE FROM negocios WHERE id = ?', [id])

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Negocio no encontrado' })
            }

            res.status(200).json({ message: 'Negocio eliminado correctamente' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}

export default authMiddleware(handler)