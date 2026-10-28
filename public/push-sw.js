// Parte del service worker che gestisce le notifiche push.
// Viene caricato dal service worker della PWA (vedi vite.config.js).

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    // payload non JSON: si mostra una notifica generica
  }

  // Il server manda i dati in `data`; accettiamo anche `notification`.
  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || "TV ShowList";
  const options = {
    body: notification.body || data.body || "",
    icon: "/TVShowList/pwa/icon-192.png",
    badge: "/TVShowList/pwa/icon-192.png",
    data: { url: data.url || "/TVShowList/library" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Al tocco della notifica: porta in primo piano l'app se è già aperta,
// altrimenti la apre sulla pagina indicata.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/TVShowList/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes("/TVShowList/") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
