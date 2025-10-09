import connection from "@/libs/db";

export default async function handler(req, res) {
    const { id, page2Value } = req.body;

    if (req.method === 'PUT') {
        if (!id) {
            return res.status(400).json({ error: 'ID es obligatorio' });
        }

        try {
            const [result] = await connection.query(
                `UPDATE reportes SET page2 = ? WHERE id = ?`,
                [page2Value, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Reporte no encontrado' });
            }

            const message = page2Value 
                ? 'Page2 actualizada correctamente' 
                : 'Page2 eliminada correctamente';

            res.status(200).json({ message });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
