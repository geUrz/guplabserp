
import { AuthProvider, ThemeProvider } from '@/contexts'
import 'semantic-ui-css/semantic.min.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import '@/styles/globals.css'

export default function App(props) {
  const { Component, pageProps } = props

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        subscribeUserToPush();
      } else {
        console.error('Permiso para notificaciones denegado');
      }
    }
  };

  const subscribeUserToPush = async () => {
    if (!('serviceWorker' in navigator)) {
      console.error('Service Worker no soportado en este navegador.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registrado con éxito:', registration);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      console.log('Suscripción creada:', subscription);

      // Enviar la suscripción al servidor
      const response = await fetch('/guardar-suscripcion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      if (response.ok) {
        console.log('Suscripción guardada exitosamente');
      } else {
        console.error('Error al guardar la suscripción');
      }
    } catch (error) {
      console.error('Error en la suscripción:', error);
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  )
}
