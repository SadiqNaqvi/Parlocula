/* Notification should be of type = {
title: string,
body?: string,
icon?:string,
path?:string,
tag?: string
}
*/

self.addEventListener("push", (event) => {
  console.log(event);

  if (event.data) {
    const payload = event.data.json();

    const { body, icon, title } = payload.data;

    const options = {
      body,
      icon: icon,
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

const baseUrl = "https://parlocula.vercel.app";

self.addEventListener("notificationclick", function (event) {
  const data = event.data.json();
  const path =
    data && data.path
      ? new URL(data.path, baseUrl)
      : `${baseUrl}/notifications`;

  console.log("Notification click received.", event);
  event.notification.close();
  event.waitUntil(clients.openWindow(path));
});
