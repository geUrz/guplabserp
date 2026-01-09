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
    const [rows] = await connection.query(`
      SELECT 
        os.id, 
        os.folio, 
        os.usuario_id, 
        os.usuario_nombre, 
        os.cliente_id,
        c.nombre AS cliente_nombre,
        c.contacto AS cliente_contacto, 
        os.cliente_nombre, 
        os.cliente_contacto, 
        os.ordenserv, 
        os.descripcion, 
        os.page2, 
        os.nota, 
        os.firmatec, 
        os.firmacli, 
        os.negocio_id,  
        n.negocio AS negocio_nombre,
        os.createdAt
      FROM ordenserv os
      LEFT JOIN clientes c ON os.cliente_id = c.id
      LEFT JOIN negocios n ON os.negocio_id = n.id
      WHERE os.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Orden de servicio no encontrada' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

  if (search) {
    const searchQuery = `%${search.toLowerCase()}%`;

    try {
      const whereClauses = [
        "LOWER(os.folio) LIKE ?",
        "LOWER(os.usuario_nombre) LIKE ?",
        "LOWER(os.cliente_nombre) LIKE ?",
        "LOWER(os.cliente_contacto) LIKE ?",
        "LOWER(os.ordenserv) LIKE ?",
        "LOWER(os.descripcion) LIKE ?",
        "LOWER(os.page2) LIKE ?",
        "LOWER(os.nota) LIKE ?",
        "LOWER(n.negocio) LIKE ?"
      ];

      const params = new Array(whereClauses.length).fill(searchQuery);
      let whereClause = `(${whereClauses.join(" OR ")})`;

      if (!isAdmin && negocioId) {
        whereClause += " AND os.negocio_id = ?";
        params.push(negocioId);
      }

      const query = `
        SELECT  
          os.id, os.folio, os.usuario_id, os.usuario_nombre, os.cliente_id,
          c.nombre AS cliente_nombre, c.contacto AS cliente_contacto, 
          os.cliente_nombre, os.cliente_contacto, os.ordenserv, os.descripcion, 
          os.page2, os.nota, os.firmatec, os.firmacli, os.negocio_id,  
          n.negocio AS negocio_nombre, os.createdAt
        FROM ordenserv os
        LEFT JOIN clientes c ON os.cliente_id = c.id
        LEFT JOIN negocios n ON os.negocio_id = n.id
        WHERE ${whereClause}
        GROUP BY os.id
        ORDER BY os.updatedAt DESC
      `;

      const [rows] = await connection.query(query, params);
      return res.status(200).json(rows);

    } catch (error) {
      res.status(500).json({ error: 'Error al realizar la búsqueda' });
    }
    return;
  }

  if (negocio_id) {
    if (!isAdmin && negocioSolicitado !== negocioId) {
      return res.status(403).json({ error: 'No tienes permiso para accesar' });
    }

    try {
      const [rows] = await connection.query(`
        SELECT 
          os.id, os.folio, os.usuario_id, os.usuario_nombre, os.cliente_id,
          c.nombre AS cliente_nombre, c.contacto AS cliente_contacto, 
          os.cliente_nombre, os.cliente_contacto, os.ordenserv, os.descripcion, 
          os.page2, os.nota, os.firmatec, os.firmacli, os.negocio_id,  
          n.negocio AS negocio_nombre, os.createdAt
        FROM ordenserv os
        LEFT JOIN clientes c ON os.cliente_id = c.id
        LEFT JOIN negocios n ON os.negocio_id = n.id
        WHERE os.negocio_id = ?
        ORDER BY os.updatedAt DESC
      `, [negocio_id]);

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    if (!isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para accesar' });
    }

    try {
      const [rows] = await connection.query(`
        SELECT 
          os.id, os.folio, os.usuario_id, os.usuario_nombre, os.cliente_id,
          c.nombre AS cliente_nombre, c.contacto AS cliente_contacto, 
          os.cliente_nombre, os.cliente_contacto, os.ordenserv, os.descripcion, 
          os.page2, os.nota, os.firmatec, os.firmacli, os.negocio_id,  
          n.negocio AS negocio_nombre, os.createdAt
        FROM ordenserv os
        LEFT JOIN clientes c ON os.cliente_id = c.id
        LEFT JOIN negocios n ON os.negocio_id = n.id
        ORDER BY os.updatedAt DESC
      `);

      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
} else if (req.method === 'POST') {
  try {
    const { usuario_id, usuario_nombre, folio, cliente_id, ordenserv, descripcion } = req.body;
    if (!ordenserv || !descripcion) {
      return res.status(400).json({ error: 'Todos los datos son obligatorios' });
    }

    const [result] = await connection.query(
      'INSERT INTO ordenserv (usuario_id, usuario_nombre, folio, cliente_id, ordenserv, descripcion) VALUES (?, ?, ?, ?, ?, ?)',
      [usuario_id, usuario_nombre, folio, cliente_id, ordenserv, descripcion]
    )

    return res.status(201).json({ id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }

  } else if (req.method === 'PUT') {

    const { ordenserv, cliente_id, descripcion } = req.body

    if (!id) {
      return res.status(400).json({ error: 'ID es obligatorio' })
    }

    try {
      const [result] = await connection.query(
        'UPDATE ordenserv SET ordenserv = ?, cliente_id = ?, descripcion = ? WHERE id = ?',
        [ordenserv, cliente_id, descripcion, id]
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
        const [result] = await connection.query('DELETE FROM ordenserv WHERE id = ?', [id])

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


const ONE_SIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const ONE_SIGNAL_API_KEY = process.env.NEXT_PUBLIC_ONESIGNAL_API_KEY;

// Función para enviar notificación
// Función para enviar notificación
/* async function sendNotificationToResidentialUsers(header, message, url) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${ONE_SIGNAL_API_KEY}`,
  };

  try { */
    // Obtener todos los usuarios logueados con el mismo residencial_id
    /* const [users] = await connection.query(
        'SELECT onesignal_player_id FROM usuarios WHERE residencial_id = ? AND onesignal_player_id IS NOT NULL',
        [residencial_id]
    ); */

    /* if (users.length === 0) {
      console.log('No se encontraron usuarios para enviar notificaciones.');
      return;
    }
 */
    // Extraer los player_ids de los usuarios
    //const playerIds = users.map(user => user.onesignal_player_id);

    /* let playerIds = [];
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
      include_player_ids: playerIds, 
      headings: { en: header },
      contents: { en: message },
      url: url,
    }; */

    // Enviar la notificación a OneSignal
    /* await axios.post('https://onesignal.com/api/v1/notifications', data, { headers });

  } catch (error) {
    console.error('Error sending notification:', error.message);
  }
} */