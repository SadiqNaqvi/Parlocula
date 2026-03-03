/* Notification should be of type = {
title: string,
body?: string,
icon?:string,
path?:string,
tag?: string
}
*/

self.addEventListener("push", (event) => {
  console.log(event, event.data.json());
  if (!event.data) return;

  let payload;

  try {
    payload = event.data.json();
  } catch (e) {
    payload = event.data;
  }

  console.log(payload);

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

const baseUrl = "https://parlocula.vercel.app";

self.addEventListener("notificationclick", function (event) {
  const data = event.notification.data;
  const path =
    data && data.path
      ? new URL(data.path, baseUrl)
      : `${baseUrl}/notifications`;

  console.log("Notification click received.", event);
  event.notification.close();
  event.waitUntil(clients.openWindow(path));
});
