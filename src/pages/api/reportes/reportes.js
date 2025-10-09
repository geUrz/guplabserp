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
                reportes.id, 
                reportes.usuario_id,
                usuarios.nombre AS usuario_nombre,
                usuarios.usuario AS usuario_usuario,
                reportes.folio, 
                reportes.cliente_id,
                clientes.nombre AS cliente_nombre,
                clientes.contacto AS cliente_contacto,
                reportes.reporte, 
                reportes.descripcion, 
                reportes.page2, 
                reportes.nota, 
                reportes.title1, 
                reportes.title2, 
                reportes.title3, 
                reportes.title4, 
                reportes.title5, 
                reportes.title6, 
                reportes.title7, 
                reportes.title8, 
                reportes.title9, 
                reportes.title10, 
                reportes.title11, 
                reportes.title12, 
                reportes.title13, 
                reportes.title14, 
                reportes.title15, 
                reportes.title16, 
                reportes.title17, 
                reportes.title18, 
                reportes.title19, 
                reportes.title20, 
                reportes.img1, 
                reportes.img2, 
                reportes.img3, 
                reportes.img4, 
                reportes.img5, 
                reportes.img6, 
                reportes.img7, 
                reportes.img8, 
                reportes.img9, 
                reportes.img10, 
                reportes.img11, 
                reportes.img12, 
                reportes.img13, 
                reportes.img14, 
                reportes.img15, 
                reportes.img16, 
                reportes.img17, 
                reportes.img18, 
                reportes.img19, 
                reportes.img20, 
                reportes.firmaTec,
                reportes.firmaCli,
                reportes.createdAt
              FROM reportes 
              JOIN usuarios ON reportes.usuario_id = usuarios.id
              LEFT JOIN clientes ON reportes.cliente_id = clientes.id
          WHERE 
            LOWER(reportes.reporte) LIKE ? 
            OR 
              LOWER(reportes.folio) LIKE ?
            OR 
              LOWER(clientes.nombre) LIKE ?
            OR 
              LOWER(clientes.contacto) LIKE ?
            OR 
              LOWER(reportes.descripcion) LIKE ?
            OR 
              LOWER(reportes.nota) LIKE ?
            OR 
              LOWER(reportes.createdAt) LIKE ?
            ORDER BY reportes.updatedAt DESC`,
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
        reportes.id,
        reportes.usuario_id,
        usuarios.nombre AS usuario_nombre,
        usuarios.usuario AS usuario_usuario,
        reportes.folio,
        reportes.cliente_id,
        clientes.nombre AS cliente_nombre,
        clientes.contacto AS cliente_contacto,
        reportes.reporte,
        reportes.descripcion,
        reportes.page2,
        reportes.nota,
        reportes.title1, 
        reportes.title2, 
        reportes.title3, 
        reportes.title4, 
        reportes.title5, 
        reportes.title6, 
        reportes.title7, 
        reportes.title8, 
        reportes.title9, 
        reportes.title10, 
        reportes.title11, 
        reportes.title12, 
        reportes.title13, 
        reportes.title14, 
        reportes.title15, 
        reportes.title16, 
        reportes.title17, 
        reportes.title18, 
        reportes.title19, 
        reportes.title20, 
        reportes.img1, 
        reportes.img2, 
        reportes.img3, 
        reportes.img4, 
        reportes.img5, 
        reportes.img6, 
        reportes.img7, 
        reportes.img8, 
        reportes.img9, 
        reportes.img10, 
        reportes.img11, 
        reportes.img12, 
        reportes.img13, 
        reportes.img14, 
        reportes.img15, 
        reportes.img16, 
        reportes.img17, 
        reportes.img18, 
        reportes.img19, 
        reportes.img20, 
        reportes.firmaTec,
        reportes.firmaCli,
        reportes.createdAt
    FROM reportes
    JOIN usuarios ON reportes.usuario_id = usuarios.id
    LEFT JOIN clientes ON reportes.cliente_id = clientes.id
    ORDER BY reportes.updatedAt DESC
    `)
      res.status(200).json(rows)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { usuario_id, folio,  cliente_id, reporte, descripcion } = req.body;
      if ( !reporte || !descripcion ) {
        return res.status(400).json({ error: 'Todos los datos son obligatorios' })
      }

      const [result] = await connection.query(
        'INSERT INTO reportes (usuario_id, folio, cliente_id, reporte, descripcion) VALUES (?, ?, ?, ?, ?)',
        [usuario_id, folio, cliente_id, reporte, descripcion]
      )

      // Enviar notificación después de crear el reporte
      const header = 'Reporte'
      const message = `${reporte}`
      const url = '/reportes'
      await sendNotificationToResidentialUsers(header, message, url)

      const newClient = { id: result.insertId }
      res.status(201).json(newClient)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'PUT') {

    const { reporte, cliente_id, descripcion } = req.body;

    if (!reporte || !cliente_id || !descripcion || !id) {
      return res.status(400).json({ error: 'ID, reporte y descripción son obligatorios' })
    }

    try {
      const [result] = await connection.query(
        'UPDATE reportes SET reporte = ?, cliente_id = ?, descripcion = ? WHERE id = ?',
        [reporte, cliente_id, descripcion, id]
      )

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Reporte no encontrado' })
        }

        res.status(200).json({ message: 'Reporte actualizado correctamente' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
  } else if (req.method === 'DELETE') {
    
    if (!id) {
      return res.status(400).json({ error: 'ID del reporte es obligatorio' })
    }

    else {
      // Eliminar la incidencia por ID
      try {
        const [result] = await connection.query('DELETE FROM reportes WHERE id = ?', [id])

        // Verificar si el anuncio fue eliminado
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Reporte no encontrado' })
        }

        res.status(200).json({ message: 'Reporte eliminado correctamente' })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
