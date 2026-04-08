// DevPath RO — Service Worker (Web Push)

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "DevPath RO", body: event.data.text(), url: "/" };
  }

  const title = payload.title ?? "DevPath RO";
  const options = {
    body: payload.body ?? "",
    icon: payload.icon ?? "/og/default.png",
    badge: "/og/default.png",
    data: { url: payload.url ?? "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing tab if open
        for (const client of windowClients) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open new tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
