/* Notification should be of type = {
title: string,
body?: string,
icon?:string,
path?:string,
tag?: string
}
*/

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const payload = event.data.json();

  const data = payload.data || payload;
  const { body, icon, title, path } = data;

  const options = {
    body,
    icon: icon,
    badge: "/badge.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "2",
      path,
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.", event);
  event.notification.close();
  
  const data = event.notification.data;
  const path = data && data.path ? data.path : "/notifications";


  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {

        for (const client of clientsArr) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(path);
            return client.focus();
          }
        }

        return clients.openWindow(url);
      })
    )
});
