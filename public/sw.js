// frontend/public/sw.js

self.addEventListener('push', function(event) {
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'FarmaHelps', body: event.data ? event.data.text() : 'Notifikasi baru' };
  }
  
  const options = {
    body: data.body,
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2',
      url: data.url || '/dashboard' // URL dari server atau default
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Gunakan self.location.origin agar dinamis (localhost:9000 di dev, production URL di prod)
  const targetUrl = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Jika ada tab yang sudah terbuka, fokus ke sana
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika tidak, buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});