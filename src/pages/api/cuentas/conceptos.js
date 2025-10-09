import connection from "@/libs/db";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { cuenta_id, tipo, concepto, precio, cantidad, tipo_doc } = req.body

        try {
            const [result] = await connection.query(
                'INSERT INTO conceptoscue (cuenta_id, tipo, concepto, precio, cantidad, tipo_doc ) VALUES (?, ?, ?, ?, ?, ?)',
                [cuenta_id, tipo, concepto, precio, cantidad, tipo_doc ]
            );
            res.status(201).json({ id: result.insertId })
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === 'GET') {
        const { cuenta_id } = req.query

        try {
            let query = 'SELECT * FROM conceptoscue'
            let params = []

            if (cuenta_id) {
                query += ' WHERE cuenta_id = ?'
                params.push(cuenta_id);
            }

            const [rows] = await connection.query(query, params)
            res.status(200).json(rows)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === 'DELETE') {
        const { concepto_id } = req.query

        try {
            const [result] = await connection.query('DELETE FROM conceptoscue WHERE id = ?', [concepto_id])
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Concepto no encontrado' })
            }
            res.status(200).json({ message: 'Concepto eliminado exitosamente' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query
        const { tipo, concepto, precio, cantidad } = req.body

        try {
            const [result] = await connection.query(
                'UPDATE conceptoscue SET tipo = ?, concepto = ?, precio = ?, cantidad = ? WHERE id = ?',
                [tipo, concepto, precio, cantidad, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Concepto no encontrado' })
            }
            res.status(200).json({ message: 'Concepto actualizado exitosamente' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
