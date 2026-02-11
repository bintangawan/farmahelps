// frontend/public/sw.js

self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/vite.svg', // Ganti dengan icon app kamu jika ada
    badge: '/vite.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Buka dashboard saat diklik
  event.waitUntil(
    clients.openWindow('http://localhost:5173/dashboard')
  );
});