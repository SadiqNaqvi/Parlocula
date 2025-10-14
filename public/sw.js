import localforage from "localforage";

/* Notification should be of type = {
title: string,
body?: string,
data?: {link: string},
tag?: string
}
*/

self.addEventListener("push", (event) => {
  const data = event.data.json();

  const store = localforage.createInstance({ name: "Offline_Storage" });
  store.setItem("new", true, () => console.log("Saved Successfully"));

  event.waitUntil(
    self.registration.showNotification(data.notification.title, data)
  );
});
