import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' })

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io'
import next from 'next';
import path from 'path';
import webPush from 'web-push';  
import bodyParser from 'body-parser'; 
import connection from './src/libs/db.js';  

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
}

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  throw new Error('No key set vapidDetails.publicKey');
}

// Configura VAPID en web-push
webPush.setVapidDetails(
  'mailto:gerardourzua20@gmail.com',  // Cambia este correo por tu correo real
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.prepare().then(() => {
  const server = express();

  // Usar body-parser para manejar datos JSON
  server.use(bodyParser.json());
  server.use(express.static(path.join(__dirname, 'public')));

  const httpServer = http.createServer(server);

  const io = new SocketIOServer(httpServer, {   // Usa el constructor de SocketIOServer
    cors: {
      origin: '*', 
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    socket.on('nuevaCancion', (cancion) => {
      console.log('Nueva canción recibida:', cancion);

      // Notificar a todos los clientes conectados con Socket.IO
      io.emit('notification', { 
        message: '¡ Nueva canción agregada !', 
        details: `Canción: ${cancion.cancion}` 
      });

      io.emit('nuevaCancion', {
        id: cancion.id,
        cancion: cancion.cancion,
        cantante: cancion.cantante,
        nombre: cancion.nombre,
        mensaje: cancion.mensaje,
        estado: cancion.estado,
      });

      // Enviar notificación push a los suscriptores
      const subscription = cancion.subscription; // Suscripción que recibiste del cliente

      if (subscription) {
        const payload = JSON.stringify({
          title: 'Nueva Canción',
          body: `¡Se ha agregado la canción: ${cancion.cancion}!`,
          icon: '/path/to/icon.png', // Icono de la notificación
        });

        // Enviar la notificación push
        webPush.sendNotification(subscription, payload)
          .then(response => {
            console.log('Notificación push enviada:', response);
          })
          .catch(err => {
            console.error('Error al enviar la notificación push:', err);
          });
      }

    });

    socket.on('cambiarEstadoMic', (data) => {
      console.log('Cambio de estado del micrófono recibido:', data);
      io.emit('estadoMicActualizado', {
        id: data.id,
        estado: data.estado,
      });
    });

    socket.on('cancionEliminada', (deletedSongId) => {
      console.log('Canción eliminada con ID:', deletedSongId);
      io.emit('cancionEliminada', deletedSongId);
    });

    socket.on('cancionesEliminadas', () => {
      console.log('Todas las canciones han sido eliminadas');
      io.emit('cancionesEliminadas'); 
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`);
    });
  });

  // Ruta para guardar la suscripción en la base de datos
  server.post('/guardar-suscripcion', async (req, res) => {
    const { subscription } = req.body;

    const usuario_id = 10

    console.log('Suscripción recibida:', req.body)

    if (!usuario_id) {
      return res.status(400).send('Faltan datos para la suscripción');
    }

    // Guardamos la suscripción en MySQL
    try {
      const [result] = await connection.execute(
        'INSERT INTO suscripciones (usuario_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)',
        [usuario_id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
      );

      console.log('Suscripción guardada:', result);
      res.status(200).send('Suscripción guardada');
    } catch (error) {
      console.error('Error al guardar la suscripción:', error);
      res.status(500).send('Error al guardar la suscripción');
    }
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = 3002;
  console.log('NODE_ENV:', process.env.NODE_ENV);

  httpServer.listen(PORT, '0.0.0.0', (err) => { 
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });

});
