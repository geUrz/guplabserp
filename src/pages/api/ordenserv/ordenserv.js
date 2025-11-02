import connection from "@/libs/db"
import authMiddleware from "@/middleware/authMiddleware"
import axios from "axios";

const ONE_SIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const ONE_SIGNAL_API_KEY = process.env.NEXT_PUBLIC_ONESIGNAL_API_KEY;

// Función para enviar notificación
// Función para enviar notificación
async function sendNotificationToResidentialUsers(header, message, url) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${ONE_SIGNAL_API_KEY}`,
  };

  try {
    // Obtener todos los usuarios logueados con el mismo residencial_id
    /* const [users] = await connection.query(
        'SELECT onesignal_player_id FROM usuarios WHERE residencial_id = ? AND onesignal_player_id IS NOT NULL',
        [residencial_id]
    ); */

    if (users.length === 0) {
      console.log('No se encontraron usuarios para enviar notificaciones.');
      return;
    }

    // Extraer los player_ids de los usuarios
    //const playerIds = users.map(user => user.onesignal_player_id);

    let playerIds = [];
    users.forEach(user => {
      // Verificar si hay más de un player_id y convertirlo en array
      if (user.onesignal_player_id.includes(',')) {
        playerIds = playerIds.concat(user.onesignal_player_id.split(','));
      } else {
        playerIds.push(user.onesignal_player_id);
      }
    })

    const data = {
      app_id: ONE_SIGNAL_APP_ID,
      include_player_ids: playerIds,  // Enviar notificación solo a estos usuarios
      headings: { en: header },
      contents: { en: message },
      url: url,
    };

    // Enviar la notificación a OneSignal
    await axios.post('https://onesignal.com/api/v1/notifications', data, { headers });

  } catch (error) {
    console.error('Error sending notification:', error.message);
  }
}

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
                    os.id, 
                    os.folio, 
                    os.usuario_id, 
                    os.cliente_id,
                    c.nombre,
                    c.contacto, 
                    os.cliente_nombre, 
                    os.cliente_contacto, 
                    os.ordenserv, 
                    os.descripcion, 
                    os.page2, 
                    os.nota, 
                    os.createdAt,
                    c.nombre, 
                    c.contacto,
                    os.negocio_id,  
                    n.negocio
                    FROM recibos r
                    LEFT JOIN clientes c ON os.cliente_id = c.id
                    LEFT JOIN negocios n ON os.negocio_id = n.id
                    WHERE r.id = ?
                `, [id]);

                if (rows.length === 0) {
                    return res.status(404).json({ error: 'Ordenservicio no encontrado' });
                }

                res.status(200).json(rows[0])
            } catch (error) {
                res.status(500).json({ error: error.message })
            }

            return
        }}

    if (search) {
      
            const searchQuery = `%${search.toLowerCase()}%`

            try {

                // Construir cláusulas dinámicamente
                const whereClauses = [
                    "LOWER(u.nombre) LIKE ?",
                    "LOWER(u.folio) LIKE ?",
                    "LOWER(u.usuario) LIKE ?",
                    "LOWER(u.email) LIKE ?",
                    "LOWER(u.nivel) LIKE ?",
                    "LOWER(u.negocio_nombre) LIKE ?",
                    "LOWER(CAST(u.isactive AS CHAR)) LIKE ?"
                ];

                const params = [
                    searchQuery, searchQuery, searchQuery, searchQuery,
                    searchQuery, searchQuery, searchQuery
                ];

                if (isActiveQuery !== null) {
                    whereClauses.push("u.isactive = ?");
                    params.push(isActiveQuery);
                }

                let whereClause = `(${whereClauses.join(" OR ")})`;

                if (!isAdmin && negocioId) {
                    whereClause += ` AND u.negocio_id = ?`;
                    params.push(negocioId);
                }

                const query = `
                SELECT  
                  u.id,
                  u.folio, 
                  u.nombre, 
                  u.usuario, 
                  u.email, 
                  u.nivel,
                  u.negocio_id,
                  u.negocio_nombre,
                  u.isactive
                FROM usuarios u
                LEFT JOIN negocios n ON u.negocio_id = n.id
                 WHERE ${whereClause}
                 ORDER BY u.updatedAt DESC
              `;

                const [rows] = await connection.query(query, params);
                return res.status(200).json(rows);

            } catch (error) {
                console.error(error)
                return res.status(500).json({ error: 'Error al realizar la búsqueda' });
            }
  } else if (req.method === 'POST') {

    try {
      const { usuario_id, folio, cliente_id, ordendeservicio, descripcion } = req.body;
      if (!ordendeservicio || !descripcion) {
        return res.status(400).json({ error: 'Todos los datos son obligatorios' })
      }

      const [result] = await connection.query(
        'INSERT INTO ordenesdeserv (usuario_id, folio, cliente_id, ordendeservicio, descripcion) VALUES (?, ?, ?, ?, ?)',
        [usuario_id, folio, cliente_id, ordendeservicio, descripcion]
      )

      // Enviar notificación después de crear el reporte
      const header = 'Orden de servicio'
      const message = `${ordendeservicio}`
      const url = '/ordenesdeservicio'
      await sendNotificationToResidentialUsers(header, message, url)

      const newClient = { id: result.insertId }
      res.status(201).json(newClient)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'PUT') {

    const { ordendeservicio, cliente_id, descripcion } = req.body;

    if (!ordendeservicio || !cliente_id || !descripcion || !id) {
      return res.status(400).json({ error: 'ID, reporte y descripción son obligatorios' })
    }

    try {
      const [result] = await connection.query(
        'UPDATE ordenesdeserv SET ordendeservicio = ?, cliente_id = ?, descripcion = ? WHERE id = ?',
        [ordendeservicio, cliente_id, descripcion, id]
      )

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Orden de servicio no encontrada' })
      }

      res.status(200).json({ message: 'Orden de servicio actualizada correctamente' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'DELETE') {

    if (!id) {
      return res.status(400).json({ error: 'ID de la orden de servicio es obligatorio' })
    }

    else {
      // Eliminar la incidencia por ID
      try {
        const [result] = await connection.query('DELETE FROM ordenesdeserv WHERE id = ?', [id])

        // Verificar si el anuncio fue eliminado
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Orden de servicio no encontrada' })
        }

        res.status(200).json({ message: 'Orden de servicio eliminada correctamente' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default authMiddleware(handler)
