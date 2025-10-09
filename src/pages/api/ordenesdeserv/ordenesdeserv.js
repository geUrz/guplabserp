import connection from "@/libs/db"
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

export default async function handler(req, res) {
  const { id, search } = req.query; // Agregamos 'search' al destructuring

  if (req.method === 'GET') {

    // Caso para búsqueda de reportes insensible a mayúsculas y minúsculas
    if (search) {
      const searchQuery = `%${search.toLowerCase()}%`; // Convertimos la búsqueda a minúsculas
      try {
        const [rows] = await connection.query(
          `SELECT 
                ordenesdeserv.id,
                ordenesdeserv.usuario_id,
                usuarios.nombre AS usuario_nombre,
                usuarios.usuario AS usuario_usuario,
                ordenesdeserv.folio,
                ordenesdeserv.cliente_id,
                clientes.nombre AS cliente_nombre,
                clientes.contacto AS cliente_contacto,
                ordenesdeserv.ordendeservicio,
                ordenesdeserv.descripcion,
                ordenesdeserv.page2,
                ordenesdeserv.nota, 
                ordenesdeserv.firmatec,
                ordenesdeserv.firmacli,
                ordenesdeserv.createdAt
              FROM ordenesdeserv 
              JOIN usuarios ON ordenesdeserv.usuario_id = usuarios.id
              LEFT JOIN clientes ON ordenesdeserv.cliente_id = clientes.id
          WHERE 
            LOWER(ordenesdeserv.ordendeservicio) LIKE ? 
            OR 
              LOWER(ordenesdeserv.folio) LIKE ?
            OR 
              LOWER(clientes.nombre) LIKE ?
            OR 
              LOWER(clientes.contacto) LIKE ?
            OR 
              LOWER(ordenesdeserv.descripcion) LIKE ?
            OR 
              LOWER(ordenesdeserv.nota) LIKE ?
            OR 
              LOWER(ordenesdeserv.createdAt) LIKE ?
            ORDER BY ordenesdeserv.updatedAt DESC`,
          [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]
        )

        /* if (rows.length === 0) {
          return res.status(404).json({ message: 'No se encontraron reportes' })
        } */

        res.status(200).json(rows)
      } catch (error) {
        res.status(500).json({ error: 'Error al realizar la búsqueda' })
      }
      return
    }

    // Caso para obtener todos los reportes
    try {
      const [rows] = await connection.query(
        `SELECT
        ordenesdeserv.id,
        ordenesdeserv.usuario_id,
        usuarios.nombre AS usuario_nombre,
        usuarios.usuario AS usuario_usuario,
        ordenesdeserv.folio,
        ordenesdeserv.cliente_id,
        clientes.nombre AS cliente_nombre,
        clientes.contacto AS cliente_contacto,
        ordenesdeserv.ordendeservicio,
        ordenesdeserv.descripcion,
        ordenesdeserv.page2,
        ordenesdeserv.nota, 
        ordenesdeserv.firmatec,
        ordenesdeserv.firmacli,
        ordenesdeserv.createdAt
    FROM ordenesdeserv
    JOIN usuarios ON ordenesdeserv.usuario_id = usuarios.id
    LEFT JOIN clientes ON ordenesdeserv.cliente_id = clientes.id
    ORDER BY ordenesdeserv.updatedAt DESC
    `)
      res.status(200).json(rows)
    } catch (error) {
      res.status(500).json({ error: error.message })
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
