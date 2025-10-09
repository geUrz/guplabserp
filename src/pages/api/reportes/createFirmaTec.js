import connection from "@/libs/db";

export default async function handler(req, res) {
    const { id, firmaValue } = req.body;

    if (req.method === 'PUT') {
        if (!id) {
            return res.status(400).json({ error: 'ID es obligatorio' });
        }

        try {
            const [result] = await connection.query(
                `UPDATE reportes SET firmatec = ? WHERE id = ?`,
                [firmaValue, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Reporte no encontrado' });
            }

            const message = firmaValue 
                ? 'Firma del técnico actualizada correctamente' 
                : 'Firma del técnico eliminada correctamente';

            res.status(200).json({ message });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
