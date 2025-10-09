import webPush from 'web-push';
import connection from '@/libs/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { title, body, url } = req.body || {};  // Aquí tomamos la URL de la solicitud

    console.log("📩 Notificación recibida en el servidor:", { title, body, url });

    if (!title || !body || !url) {
      return res.status(400).json({ message: "Faltan datos en la notificación" });
    }

    // Si no se pasa la URL, puedes establecer una URL predeterminada
    const notificationUrl = url || '/';

    const [rows] = await connection.execute('SELECT * FROM suscripciones');

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No hay suscriptores registrados' });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/click-192x192.png',
      url: notificationUrl
    });

    for (let i = 0; i < rows.length; i++) {
      const subscription = {
        endpoint: rows[i].endpoint,
        keys: {
          p256dh: rows[i].p256dh,
          auth: rows[i].auth,
        },
      };

      try {
        await webPush.sendNotification(subscription, payload);
      } catch (err) {
        console.error(`Error al enviar la notificación a ${subscription.endpoint}:`, err);
        if (err.statusCode === 410) {
          await connection.execute('DELETE FROM suscripciones WHERE endpoint = ?', [subscription.endpoint]);
        }
      }
    }

    return res.status(200).json({ message: 'Notificación enviada con éxito' });
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
    return res.status(500).json({ message: 'Error interno', error });
  }
}
