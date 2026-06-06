/* Notification should be of type = {
    title: string;
    body?: string;
    icon?: string;
    path?: string;
    tag?: string;
    image?: string;
    actions?: {
        action: string;
        title: string;
    }[];
    requireInteraction?: boolean;
    silent?: false;
}
*/

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};

  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: "New Notification",
      body: "Something new happened in your cinematic planet. Open Parlocula now.",
    };
  }
  const { body, icon, title, path, tag, image } = data;

  const options = {
    body,
    icon: icon,
    badge: "/badge.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      path,
      ...(data.data || {}),
    },
    tag,
    image,
    requireInteraction: data.requireInteraction,
    silent: data.silent,
    actions: data.actions ?? [{ title: "open", action: "open" }],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const data = event.notification.data;
  const path = data && data.path ? data.path : "/notifications";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(path);
          return client.focus();
        }
      }

      return clients.openWindow(path);
    }),
  );
});
