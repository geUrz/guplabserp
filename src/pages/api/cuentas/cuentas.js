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
                    cuenta,
                    tipo,
                    folioref,
                    createdAt
                FROM cuentas 
                WHERE id = ?
                ORDER BY updatedAt DESC`, [id]);

                res.status(200).json(rows[0]); // Devolver el evento con los datos del cliente

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
            return;
        }

        if (search) {
            const searchQuery = `%${search.toLowerCase()}%`;
            try {
                const [rows] = await connection.query(`
                    SELECT
                        cuentas.id, 
                        cuentas.folio, 
                        cuentas.cliente_id, 
                        clientes.nombre AS cliente_nombre,  
                        clientes.contacto AS cliente_contacto, 
                        cuentas.cuenta,  
                        cuentas.tipo, 
                        cuentas.folioref,
                        conceptosrec.concepto AS concepto,
                        cuentas.createdAt
                    FROM cuentas
                    JOIN clientes ON cuentas.cliente_id = clientes.id
                    LEFT JOIN conceptosrec ON cuentas.id = conceptosrec.recibo_id
                    WHERE 
                        LOWER(cuentas.folio) LIKE ? 
                    OR 
                        LOWER(clientes.nombre) LIKE ?
                    OR 
                        LOWER(clientes.contacto) LIKE ?
                    OR 
                        LOWER(cuentas.cuenta) LIKE ?
                    OR 
                        LOWER(cuentas.tipo) LIKE ?
                    OR 
                        LOWER(cuentas.createdAt) LIKE ?  
                    OR 
                        LOWER(conceptosrec.concepto) LIKE ?
                    ORDER BY cuentas.updatedAt DESC`, [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]);

                res.status(200).json(rows); // Devolver los cuentas encontrados por búsqueda

            } catch (error) {
                res.status(500).json({ error: 'Error al realizar la búsqueda' });
            }
            return;
        }

        try {
            const [rows] = await connection.query(`
                SELECT 
                  cuentas.id, 
                  cuentas.folio, 
                  cuentas.cliente_id,  
                  clientes.nombre AS cliente_nombre, 
                  clientes.contacto AS cliente_contacto, 
                  cuentas.cuenta,  
                  cuentas.tipo,  
                  cuentas.folioref,
                  cuentas.createdAt
                FROM cuentas
                JOIN clientes ON cuentas.cliente_id = clientes.id
                ORDER BY cuentas.updatedAt DESC`);

            res.status(200).json(rows); // Devolver todos los cuentas con los datos de los clientes

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'POST') {
        // Maneja la solicitud POST
        const { folio, cliente_id, cuenta, tipo, folioref } = req.body;

        try {
            const [result] = await connection.query(
                'INSERT INTO cuentas (folio, cliente_id, cuenta, tipo, folioref) VALUES (?, ?, ?, ?, ?)',
                [folio, cliente_id, cuenta, tipo, folioref]
            );
            res.status(201).json({ id: result.insertId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else if (req.method === 'PUT') {

        const { id } = req.query;
        const { cuenta, cliente_id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID de la cuenta es obligatorio' });
        }

        if (cuenta) {
            try {
                const [result] = await connection.query(
                    'UPDATE cuentas SET cliente_id = ?, cuenta = ? WHERE id = ?',
                    [cliente_id, cuenta, id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Cuenta no encontrada' });
                }

                res.status(200).json({ message: 'Cuenta actualizada correctamente' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        } else {
            return res.status(400).json({ error: 'Datos insuficientes para actualizar la cuenta' });
        }

    } else if (req.method === 'DELETE') {
        // Maneja la solicitud DELETE
        const { id } = req.query;

        try {
            const [result] = await connection.query(
                'DELETE FROM cuentas WHERE id = ?',
                [id]
            );

            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'Cuenta eliminada correctamente' });
            } else {
                res.status(404).json({ message: 'Cuenta no encontrada' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}
