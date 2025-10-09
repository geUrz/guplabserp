import connection from "@/libs/db"

export default async function handler(req, res) {
    const { id, search } = req.query;

    if (req.method === 'GET') {
        if (id) {
            // Obtener un cliente por ID
            try {
                const [rows] = await connection.query('SELECT id, folio, nombre, contacto, cel, direccion, email FROM clientes WHERE id = ?', [id])

                if (rows.length === 0) {
                    return res.status(404).json({ error: 'Cliente no encontrado' });
                }

                res.status(200).json(rows[0])
            } catch (error) {
                res.status(500).json({ error: error.message })
            }

            return
        }

            if (search) {
                const searchQuery = `%${search.toLowerCase()}%`;
                try {
                    const [rows] = await connection.query(`
                        SELECT
                            id, 
                            folio, 
                            nombre,
                            contacto,
                            cel,
                            direccion,
                            email,
                            createdAt
                        FROM clientes
                        WHERE 
                            LOWER(folio) LIKE ? 
                        OR 
                            LOWER(nombre) LIKE ?
                        OR 
                            LOWER(contacto) LIKE ?
                        OR 
                            LOWER(cel) LIKE ?
                        OR 
                            LOWER(direccion) LIKE ?
                        OR 
                            LOWER(email) LIKE ?  
                        OR 
                            LOWER(createdAt) LIKE ?
                        ORDER BY updatedAt DESC`, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]);
    
                    res.status(200).json(rows); // Devolver los recibos encontrados por búsqueda
    
                } catch (error) {
                    res.status(500).json({ error: 'Error al realizar la búsqueda' });
                }
                return;
            }

            // Obtener todos los clientes
            try {
                const [rows] = await connection.query('SELECT id, folio, nombre, contacto, cel, direccion, email FROM clientes ORDER BY updatedAt DESC');
                res.status(200).json(rows)
            } catch (error) {
                res.status(500).json({ error: error.message })
            }
        
    } else if (req.method === 'POST') {
        try {
            const { folio, nombre, contacto, cel, direccion, email } = req.body
            if (!nombre || !contacto ) {
                return res.status(400).json({ error: 'Todos los datos son obligatorios' })
            }

            const [result] = await connection.query('INSERT INTO clientes (folio, nombre, contacto, cel, direccion, email) VALUES (?, ?, ?, ?, ?, ?)', [folio, nombre, contacto, cel, direccion, email])
            const newClient = { id: result.insertId }
            res.status(201).json(newClient)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === 'PUT') {
        if (!id) {
            return res.status(400).json({ error: 'ID del cliente es obligatorio' })
        }

        const { nombre, contacto, cel, direccion, email } = req.body

        if (!nombre || !contacto) {
            return res.status(400).json({ error: 'Todos los datos son obligatorios' })
        }

        try {
            const [result] = await connection.query('UPDATE clientes SET nombre = ?, contacto = ?, cel = ?, direccion = ?, email = ? WHERE id = ?', [nombre, contacto, cel, direccion, email, id])

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Cliente no encontrado' })
            }

            res.status(200).json({ message: 'Cliente actualizado correctamente' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === 'DELETE') {
        if (!id) {
            return res.status(400).json({ error: 'ID del cliente es obligatorio' })
        }

        try {
            // Actualizar la columna client_id en la tabla notas a NULL para el cliente que se va a eliminar
            await connection.query('UPDATE notas SET cliente_id = NULL WHERE cliente_id = ?', [id])

            // Ahora eliminar el cliente
            const [result] = await connection.query('DELETE FROM clientes WHERE id = ?', [id])

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Cliente no encontrado' })
            }

            res.status(200).json({ message: 'Cliente eliminado correctamente' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
