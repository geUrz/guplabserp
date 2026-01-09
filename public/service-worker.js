const publicKey = 'BGLpa98smGM6E6yxSt5It_xLibXkF3beH1qRhC01giRzfmrZlU-u8-Bg66zvOsuEaEglWp-mQ5cXPxa60wUYn3M';

// Convierte la clave pública VAPID en un formato adecuado
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/\_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Evento push
self.addEventListener('push', function(event) {
  if (event.notification) {
    event.notification.close();
  }

  const urlToOpen = event.notification?.data?.url || '/';
  console.log((urlToOpen));
  
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(clientList => {
      // Asegúrate de que el código se ejecuta cuando el usuario interactúa directamente
      for (let client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus(); // Si ya está abierto, dar foco
        }
      }

      // Si no hay ventanas abiertas, intenta abrir una nueva
      return clients.openWindow(urlToOpen);
    })
  );

  let notificationData = { title: 'Notificación', body: 'Nuevo mensaje', icon: '/icons/erp-192x192.png' };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      console.error('Error al procesar los datos de la notificación:', error);
    }
  }

  const title = notificationData.title || 'Nueva Notificación';
  const options = {
    body: notificationData.body || 'Tienes una nueva notificación',
    icon: notificationData.icon || '/icons/erp-192x192.png',
    badge: notificationData.badge || '/erp-192x192.png',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
